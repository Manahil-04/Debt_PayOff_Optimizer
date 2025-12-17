import { Debt, GoalType } from './debt-data';

export interface PayoffProjection {
  totalMonths: number;
  totalInterestPaid: number;
  monthlyPayments: { month: number; totalPayment: number; }[];
  balanceOverTime: { month: number; totalBalance: number; }[];
  debtsPayoffSchedule: { debtId: string; payoffMonth: number; }[];
}

interface DebtState extends Debt {
  remainingBalance: number;
  isPaidOff: boolean;
}

/**
 * Calculates the payoff projection for a set of debts.
 * @param initialDebts The list of debts.
 * @param strategy The payoff strategy ('current', 'snowball', 'avalanche').
 * @param extraMonthlyPayment An optional extra amount to pay each month.
 * @returns A PayoffProjection object.
 */
export function calculatePayoff(
  initialDebts: Debt[],
  strategy: 'current' | 'snowball' | 'avalanche',
  extraMonthlyPayment: number = 0
): PayoffProjection {
  if (initialDebts.length === 0) {
    return {
      totalMonths: 0,
      totalInterestPaid: 0,
      monthlyPayments: [],
      balanceOverTime: [],
      debtsPayoffSchedule: [],
    };
  }

  let debts: DebtState[] = initialDebts.map(d => ({
    ...d,
    remainingBalance: d.currentBalance,
    isPaidOff: false,
  }));

  let totalMonths = 0;
  let totalInterestPaid = 0;
  const monthlyPayments: { month: number; totalPayment: number; }[] = [];
  const balanceOverTime: { month: number; totalBalance: number; }[] = [];
  const debtsPayoffSchedule: { debtId: string; payoffMonth: number; }[] = [];

  let currentExtraPaymentPool = extraMonthlyPayment;

  // Initial balance snapshot
  balanceOverTime.push({ month: 0, totalBalance: debts.reduce((sum, d) => sum + d.currentBalance, 0) });

  const MAX_MONTHS = 1200; // Cap at 100 years to prevent infinite loops

  for (let month = 1; month <= MAX_MONTHS; month++) {
    let totalMonthlyPayment = 0;
    let monthInterest = 0;
    let monthPrincipalPaid = 0;
    let activeDebts = debts.filter(d => !d.isPaidOff);

    if (activeDebts.length === 0) break; // All debts paid off

    // Sort debts based on strategy for optimized payments
    if (strategy === 'snowball') {
      activeDebts.sort((a, b) => a.remainingBalance - b.remainingBalance);
    } else if (strategy === 'avalanche') {
      activeDebts.sort((a, b) => b.annualPercentageRate - a.annualPercentageRate);
    }

    // First, apply minimum payments and calculate interest
    for (const debt of debts) {
      if (debt.isPaidOff) continue;

      const monthlyAPR = debt.annualPercentageRate / 12;
      const interestForMonth = debt.remainingBalance * monthlyAPR;
      monthInterest += interestForMonth;
      totalInterestPaid += interestForMonth;

      let payment = debt.minimumPayment;
      if (payment > debt.remainingBalance + interestForMonth) {
        payment = debt.remainingBalance + interestForMonth; // Don't overpay minimum
      }
      
      debt.remainingBalance += interestForMonth - payment;
      monthPrincipalPaid += (payment - interestForMonth);
      totalMonthlyPayment += payment;

      if (debt.remainingBalance <= 0) {
        debt.isPaidOff = true;
        debt.remainingBalance = 0;
        debtsPayoffSchedule.push({ debtId: debt.id, payoffMonth: month });
        currentExtraPaymentPool += debt.minimumPayment; // Roll over minimum payment
      }
    }

    // Then, apply extra payments (if any) to the target debt
    if (currentExtraPaymentPool > 0 && activeDebts.length > 0 && strategy !== 'current') {
      let targetDebt = activeDebts[0]; // Target is the first debt after sorting
      
      let paymentToTarget = Math.min(currentExtraPaymentPool, targetDebt.remainingBalance);
      targetDebt.remainingBalance -= paymentToTarget;
      totalMonthlyPayment += paymentToTarget;
      currentExtraPaymentPool -= paymentToTarget; // Use up the extra payment pool

      if (targetDebt.remainingBalance <= 0) {
        targetDebt.isPaidOff = true;
        targetDebt.remainingBalance = 0;
        debtsPayoffSchedule.push({ debtId: targetDebt.id, payoffMonth: month });
        currentExtraPaymentPool += targetDebt.minimumPayment; // Roll over minimum payment from this debt too
      }
    }
    
    // If there's still extra payment pool left, apply it to the next debt in the sorted list
    // This handles cases where the first target debt was paid off by the extra payment
    // and there's still money left in the pool.
    if (currentExtraPaymentPool > 0 && strategy !== 'current') {
        let remainingActiveDebts = debts.filter(d => !d.isPaidOff);
        if (strategy === 'snowball') {
            remainingActiveDebts.sort((a, b) => a.remainingBalance - b.remainingBalance);
        } else if (strategy === 'avalanche') {
            remainingActiveDebts.sort((a, b) => b.annualPercentageRate - a.annualPercentageRate);
        }

        for (const debt of remainingActiveDebts) {
            if (currentExtraPaymentPool <= 0) break;

            let paymentToDebt = Math.min(currentExtraPaymentPool, debt.remainingBalance);
            debt.remainingBalance -= paymentToDebt;
            totalMonthlyPayment += paymentToDebt;
            currentExtraPaymentPool -= paymentToDebt;

            if (debt.remainingBalance <= 0) {
                debt.isPaidOff = true;
                debt.remainingBalance = 0;
                debtsPayoffSchedule.push({ debtId: debt.id, payoffMonth: month });
                currentExtraPaymentPool += debt.minimumPayment;
            }
        }
    }


    totalMonths = month;
    monthlyPayments.push({ month, totalPayment: totalMonthlyPayment });
    balanceOverTime.push({ month, totalBalance: debts.reduce((sum, d) => sum + d.remainingBalance, 0) });

    // If all debts are paid off, break early
    if (debts.every(d => d.isPaidOff)) {
      break;
    }
  }

  return {
    totalMonths,
    totalInterestPaid,
    monthlyPayments,
    balanceOverTime,
    debtsPayoffSchedule,
  };
}

/**
 * Determines the optimal strategy based on the user's goal.
 * For MVP, "Pay off faster", "Reduce monthly payment", and "Lower interest" all default to Avalanche.
 * @param goalType The user's selected goal.
 * @returns The recommended strategy ('snowball' or 'avalanche').
 */
export function getOptimalStrategy(goalType: GoalType): 'snowball' | 'avalanche' {
  // As per PRD, for MVP, all goals default to Avalanche for optimized path.
  // "Pay off faster" or "Lower interest" goals will default to Avalanche (highest interest first).
  // "Reduce monthly payment" goal will also default to Avalanche, as reducing interest is the primary driver for long-term payment reduction.
  return 'avalanche';
}

/**
 * Generates an AI-like summary based on debt data, projections, and user goal.
 * This is a rule-based system for MVP, not an actual AI.
 */
export function generateAISummary(
  userName: string,
  debts: Debt[],
  goal: GoalType,
  currentProjection: PayoffProjection,
  optimizedProjection: PayoffProjection
): string {
  if (debts.length === 0) {
    return "It looks like you haven't entered any debts yet. Please add your debts to get a personalized summary!";
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const strategyName = getOptimalStrategy(goal) === 'avalanche' ? 'Avalanche' : 'Snowball';

  const monthsSaved = currentProjection.totalMonths - optimizedProjection.totalMonths;
  const interestSaved = currentProjection.totalInterestPaid - optimizedProjection.totalInterestPaid;

  let summary = `Here's what I'm seeing, ${userName}! You have a total debt of $${totalDebt.toFixed(2)} across ${debts.length} accounts, with a combined minimum monthly payment of $${totalMinPayment.toFixed(2)}.`;

  summary += `\n\nYour current path suggests you'll be debt-free in about ${currentProjection.totalMonths} months, paying $${currentProjection.totalInterestPaid.toFixed(2)} in interest.`;

  if (monthsSaved > 0 || interestSaved > 0) {
    summary += ` But, by using the '${strategyName}' method, which focuses on your highest interest debts, you could be debt-free in just ${optimizedProjection.totalMonths} months and save $${interestSaved.toFixed(2)} in interest!`;
  } else {
    summary += ` My analysis shows that your current payment strategy is already quite efficient, or there isn't significant room for optimization with the current debt structure.`;
  }

  switch (goal) {
    case 'Pay off faster':
      summary += ` This aligns perfectly with your goal of paying off debt faster, saving you ${monthsSaved} months!`;
      break;
    case 'Reduce monthly payment':
      summary += ` While the ${strategyName} method primarily saves interest, understanding your total interest burden is key to long-term payment reduction. By saving $${interestSaved.toFixed(2)} in interest, you're setting yourself up for a significantly lighter financial load over time.`;
      break;
    case 'Lower interest':
      summary += ` This strategy is ideal for your goal of lowering interest, as it helps you save a significant $${interestSaved.toFixed(2)}!`;
      break;
  }

  return summary;
}