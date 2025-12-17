import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DebtEntryPage from "./pages/DebtEntryPage";
import GoalSelectionPage from "./pages/GoalSelectionPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage"; // New import
import Header from "./components/Header"; // New import

const queryClient = new QueryClient();

// Wrapper component to conditionally render Header
const AppContent = () => {
  const location = useLocation();
  const noHeaderPaths = ['/', '/login', '/register'];
  const showHeader = !noHeaderPaths.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/debts" element={<DebtEntryPage />} />
        <Route path="/goals" element={<GoalSelectionPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* New route */}
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;