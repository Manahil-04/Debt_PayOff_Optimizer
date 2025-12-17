import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getCurrentUser, updateUser, deleteUserAccount, logoutUser, FrontendUser } from '@/lib/auth';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name || '',
        email: currentUser.email,
      });
    }
  }, [currentUser, form]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    toast.error("You need to be logged in to view this page.");
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!currentUser) return;

    const success = await updateUser(currentUser.id, { name: values.name, email: values.email });
    if (success) {
      // Re-fetch current user to update state if email changed
      // For this frontend-only demo, we'll just rely on the toast and form reset
      // In a real app, you'd likely refresh the user context.
      toast.success("Profile updated successfully!");
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    if (await deleteUserAccount(currentUser.id)) {
      navigate('/register'); // Redirect to registration after account deletion
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
          <CardDescription>Manage your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Update Profile</Button>
            </form>
          </Form>

          <div className="pt-4 border-t dark:border-gray-700 space-y-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your associated debt and goal data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;