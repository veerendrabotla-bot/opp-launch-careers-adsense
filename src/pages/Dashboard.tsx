
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LiveNotifications from '@/components/dashboard/LiveNotifications';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    stats, 
    recentActivity, 
    loading: dashboardLoading, 
    error 
  } = useUserDashboard();
  
  const { updatePresence } = useUserPresence();
  const { notifications, unreadCount, loading: notificationsLoading } = useRealtimeNotifications();

  useEffect(() => {
    if (user) {
      updatePresence('online', '/dashboard');
    }
  }, [user, updatePresence]);

  if (authLoading || dashboardLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your opportunities today.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="space-y-6 md:space-y-8">
            {/* Live Notifications */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <LiveNotifications 
                notifications={notifications}
                unreadCount={unreadCount}
                loading={notificationsLoading}
              />
            </div>
            
            {/* Stats Grid */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <DashboardStats stats={stats} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <QuickActions />
              </div>
              <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <RecentActivity activities={recentActivity} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
