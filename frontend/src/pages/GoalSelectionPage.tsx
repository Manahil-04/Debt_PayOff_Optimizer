import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getCurrentUser, FrontendUser } from '@/lib/auth';
import { getGoalByUserId, setGoal, GoalType } from '@/lib/debt-data';
import { toast } from 'sonner';

const GoalSelectionPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchGoal = async () => {
      if (currentUser) {
        const userGoal = await getGoalByUserId(currentUser.id);
        if (userGoal) {
          setSelectedGoal(userGoal.goalType);
        }
      }
    };
    fetchGoal();
  }, [currentUser]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    toast.error("You need to be logged in to view this page.");
    return <Navigate to="/login" replace />;
  }

  const handleSaveGoal = async () => {
    if (!selectedGoal) {
      toast.error("Please select a goal to proceed.");
      return;
    }
    if (currentUser) {
      await setGoal(currentUser.id, selectedGoal);
      navigate('/dashboard'); // Navigate to the dashboard after setting the goal
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Debt Payoff Goal</CardTitle>
          <CardDescription>Select what's most important to you for your debt journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedGoal}
            onValueChange={(value: GoalType) => setSelectedGoal(value)}
            className="grid gap-4"
          >
            <div>
              <RadioGroupItem value="Pay off faster" id="goal-faster" className="peer sr-only" />
              <Label
                htmlFor="goal-faster"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-xl font-semibold">Pay off faster</span>
                <span className="text-sm text-muted-foreground text-center mt-2">
                  Minimize the time it takes to become debt-free.
                </span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="Reduce monthly payment" id="goal-reduce-payment" className="peer sr-only" />
              <Label
                htmlFor="goal-reduce-payment"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-xl font-semibold">Reduce monthly payment</span>
                <span className="text-sm text-muted-foreground text-center mt-2">
                  Lower your total monthly outflow for debts.
                </span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="Lower interest" id="goal-lower-interest" className="peer sr-only" />
              <Label
                htmlFor="goal-lower-interest"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-xl font-semibold">Lower interest</span>
                <span className="text-sm text-muted-foreground text-center mt-2">
                  Save the most money on interest over time.
                </span>
              </Label>
            </div>
          </RadioGroup>
          <Button onClick={handleSaveGoal} className="w-full text-lg py-6">
            View My Path Forward
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalSelectionPage;