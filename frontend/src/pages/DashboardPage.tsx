import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCurrentUser, FrontendUser } from '@/lib/auth';
import { getDebtsByUserId, getGoalByUserId, Debt, GoalType } from '@/lib/debt-data';
import { calculatePayoff, getOptimalStrategy, generateAISummary, PayoffProjection } from '@/lib/debt-calculations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChevronRightIcon } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [currentProjection, setCurrentProjection] = useState<PayoffProjection | null>(null);
  const [optimizedProjection, setOptimizedProjection] = useState<PayoffProjection | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;

      if (!currentUser) {
        toast.error("You need to be logged in to view this page.");
        return;
      }

      const userDebts = await getDebtsByUserId(currentUser.id);
      const userGoal = await getGoalByUserId(currentUser.id);

      if (userDebts.length === 0) {
        toast.info("Please add your debts to see your path forward.");
        navigate('/debts');
        return;
      }
      if (!userGoal) {
        toast.info("Please select your debt payoff goal.");
        navigate('/goals');
        return;
      }

      setDebts(userDebts);
      setGoal(userGoal.goalType);

      // Calculate projections
      const current = calculatePayoff(userDebts, 'current');
      const optimalStrategy = getOptimalStrategy(userGoal.goalType);
      const optimized = calculatePayoff(userDebts, optimalStrategy);

      setCurrentProjection(current);
      setOptimizedProjection(optimized);

      // Generate AI Summary
      setAiSummary(generateAISummary(currentUser.name || currentUser.email, userDebts, userGoal.goalType, current, optimized));
    };

    fetchData();
  }, [currentUser, navigate, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentProjection || !optimizedProjection || !goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Loading your personalized path...</p>
      </div>
    );
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const monthsSaved = currentProjection.totalMonths - optimizedProjection.totalMonths;
  const interestSaved = currentProjection.totalInterestPaid - optimizedProjection.totalInterestPaid;

  // Prepare data for Payoff Timeline Chart
  const payoffChartData = currentProjection.balanceOverTime.map((currentPoint, index) => ({
    month: currentPoint.month,
    Current: currentPoint.totalBalance,
    Optimized: optimizedProjection.balanceOverTime[index]?.totalBalance || 0, // Ensure optimized data exists
  }));

  // Prepare data for Interest Savings Comparison Chart
  const interestChartData = [
    { name: 'Current Path', interest: currentProjection.totalInterestPaid },
    { name: 'Optimized Path', interest: optimizedProjection.totalInterestPaid },
  ];

  const handleCalibration = () => {
    navigate('/debts'); // Go back to debt entry for adjustments
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Your PathLight Dashboard</CardTitle>
            <CardDescription className="text-center text-lg">
              Instant Debt Snapshot & Personalized Payoff Projection
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Your Current Debt Snapshot</h3>
              <p className="text-lg">Total Debt: <span className="font-bold text-blue-600">${totalDebt.toFixed(2)}</span></p>
              <p className="text-lg">Total Minimum Monthly Payment: <span className="font-bold text-blue-600">${totalMinPayment.toFixed(2)}</span></p>
              <p className="text-lg">Your Goal: <span className="font-bold text-purple-600">{goal}</span></p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">AI Auto-Summary & Insights</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiSummary}</p>
              <Button variant="link" className="px-0 mt-2">
                Help me make sense of this <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Payoff Projections</CardTitle>
            <CardDescription>Compare your current path to an optimized strategy.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Current Path</h3>
              <p>Payoff Time: <span className="font-bold">{currentProjection.totalMonths} months</span></p>
              <p>Total Interest Paid: <span className="font-bold">${currentProjection.totalInterestPaid.toFixed(2)}</span></p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Optimized Path ({getOptimalStrategy(goal) === 'avalanche' ? 'Avalanche' : 'Snowball'})</h3>
              <p>Payoff Time: <span className="font-bold text-green-600">{optimizedProjection.totalMonths} months</span></p>
              <p>Total Interest Paid: <span className="font-bold text-green-600">${optimizedProjection.totalInterestPaid.toFixed(2)}</span></p>
              {monthsSaved > 0 && <p className="text-green-700 dark:text-green-400 font-semibold">You could save {monthsSaved} months!</p>}
              {interestSaved > 0 && <p className="text-green-700 dark:text-green-400 font-semibold">You could save ${interestSaved.toFixed(2)} in interest!</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Payoff Timeline</CardTitle>
            <CardDescription>See how your total debt balance decreases over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payoffChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: 0 }} />
                <YAxis label={{ value: 'Remaining Balance ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="Current" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Optimized" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Interest Savings Comparison</CardTitle>
            <CardDescription>Visualize the total interest paid for each strategy.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interestChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Total Interest Paid ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="interest" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-6 text-center">
          <CardTitle className="text-2xl font-bold mb-4">Do these numbers look right?</CardTitle>
          <CardDescription className="mb-6">
            If you need to adjust your debt details or add more, you can do so here.
          </CardDescription>
          <Button onClick={handleCalibration} className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white">
            These numbers don’t look right → Let’s fix it together
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;