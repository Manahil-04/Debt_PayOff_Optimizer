import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCurrentUser, FrontendUser } from '@/lib/auth';
import { addDebt, getDebtsByUserId, updateDebt, deleteDebt, Debt } from '@/lib/debt-data';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

const debtFormSchema = z.object({
  debtType: z.string().min(1, { message: 'Debt type is required.' }),
  name: z.string().optional(),
  currentBalance: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Balance must be a positive number.' })
  ),
  annualPercentageRate: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'APR must be a positive number.' }).max(100, { message: 'APR cannot exceed 100%.' })
  ),
  minimumPayment: z.preprocess(
    (val) => Number(val),
    z.number().positive({ message: 'Minimum payment must be a positive number.' })
  ),
});

const DebtEntryPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const form = useForm<z.infer<typeof debtFormSchema>>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      debtType: '',
      name: '',
      currentBalance: 0,
      annualPercentageRate: 0,
      minimumPayment: 0,
    },
  });

  useEffect(() => {
    const fetchDebts = async () => {
      if (currentUser) {
        const userDebts = await getDebtsByUserId(currentUser.id);
        setDebts(userDebts);
      }
    };
    fetchDebts();
  }, [currentUser]);

  useEffect(() => {
    if (editingDebt) {
      form.reset({
        debtType: editingDebt.debtType,
        name: editingDebt.name,
        currentBalance: editingDebt.currentBalance,
        annualPercentageRate: editingDebt.annualPercentageRate * 100, // Convert decimal to percentage for display
        minimumPayment: editingDebt.minimumPayment,
      });
    } else {
      form.reset({
        debtType: '',
        name: '',
        currentBalance: 0,
        annualPercentageRate: 0,
        minimumPayment: 0,
      });
    }
  }, [editingDebt, form]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    toast.error("You need to be logged in to view this page.");
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (values: z.infer<typeof debtFormSchema>) => {
    if (!currentUser) return;

    const debtData = {
      ...values,
      annualPercentageRate: values.annualPercentageRate / 100, // Convert percentage to decimal for storage
    } as Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

    if (editingDebt) {
      const success = await updateDebt(currentUser.id, { ...editingDebt, ...debtData });
      if (success) {
        const updatedDebts = await getDebtsByUserId(currentUser.id);
        setDebts(updatedDebts);
        setEditingDebt(null);
      }
    } else {
      const newDebt = await addDebt(currentUser.id, debtData);
      if (newDebt) {
        setDebts(prev => [...prev, newDebt]);
        form.reset({
          debtType: '',
          name: '',
          currentBalance: 0,
          annualPercentageRate: 0,
          minimumPayment: 0,
        });
      }
    }
  };

  const handleDelete = async (debtId: string) => {
    if (window.confirm("Are you sure you want to delete this debt?")) {
      if (await deleteDebt(currentUser.id, debtId)) {
        const updatedDebts = await getDebtsByUserId(currentUser.id);
        setDebts(updatedDebts);
      }
    }
  };

  const handleProceed = () => {
    if (debts.length === 0) {
      toast.error("Please add at least one debt to proceed.");
      return;
    }
    navigate('/goals');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{editingDebt ? 'Edit Debt' : 'Add New Debt'}</CardTitle>
            <CardDescription>
              {editingDebt ? 'Modify the details of your debt.' : 'Enter the details for each of your debts.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="debtType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a debt type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Student Loan">Student Loan</SelectItem>
                          <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                          <SelectItem value="Mortgage">Mortgage</SelectItem>
                          <SelectItem value="Car Loan">Car Loan</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Visa Card, Student Loan A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="10000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualPercentageRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Percentage Rate (APR %)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="15.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minimumPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Monthly Payment ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="250.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingDebt ? 'Update Debt' : 'Add Debt'}
                </Button>
                {editingDebt && (
                  <Button variant="outline" className="w-full mt-2" onClick={() => setEditingDebt(null)}>
                    Cancel Edit
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {debts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Your Debts</CardTitle>
              <CardDescription>Review and manage your entered debts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">APR</TableHead>
                      <TableHead className="text-right">Min. Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {debts.map((debt) => (
                      <TableRow key={debt.id}>
                        <TableCell className="font-medium">{debt.name || debt.debtType}</TableCell>
                        <TableCell>{debt.debtType}</TableCell>
                        <TableCell className="text-right">${debt.currentBalance.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{(debt.annualPercentageRate * 100).toFixed(2)}%</TableCell>
                        <TableCell className="text-right">${debt.minimumPayment.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setEditingDebt(debt)} className="mr-2">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(debt.id)}>
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={handleProceed} className="px-8 py-4 text-lg">
            Proceed to Goal Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DebtEntryPage;