
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import ResponsiveNavigation from './ResponsiveNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { loading } = useAuth();

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Use ResponsiveNavigation for all pages except auth
  const showNavigation = location.pathname !== '/auth';

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <ResponsiveNavigation />}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
