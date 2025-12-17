import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logoutUser, FrontendUser } from '@/lib/auth';
import { toast } from 'sonner';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  
  // Refresh user state on mount and when location changes (in case of login/logout elsewhere or just navigation)
  useEffect(() => {
    const fetchUser = async () => {
        const user = await getCurrentUser();
        setCurrentUser(user);
    };
    fetchUser();
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate('/login');
  };

  if (!currentUser) {
    // Don't render header if not logged in (e.g., on landing, login, register pages)
    // Note: Checking currentUser state might cause a flicker on reload if checking auth takes time.
    // For a smoother experience, we might want a global auth context.
    // But for now, we follow the instructions to minimize major refactors.
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 shadow-lg py-4 border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          to="/dashboard" 
          className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          PathLight
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/debts" className="text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium text-base">
            Debts
          </Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium text-base">
            Dashboard
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400 transition-colors font-medium text-base">
            Profile
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 font-medium">
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;