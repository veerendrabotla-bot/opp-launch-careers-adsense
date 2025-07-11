
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { User, Loader2 } from 'lucide-react';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LiveNotifications from '@/components/dashboard/LiveNotifications';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';

const UserDashboard = () => {
  const { stats, recentActivity, loading: dashboardLoading, error } = useUserDashboard();
  const { notifications, unreadCount, loading: notificationsLoading } = useRealtimeNotifications();

  if (dashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="hover:scale-105 transition-all duration-300">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 animate-slide-in-left">
              <BackButton to="/" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Dashboard
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
                  Track your progress and manage your opportunities
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 self-start sm:self-center animate-bounce-in">
              <User className="h-3 w-3 mr-1" />
              User Account
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Grid */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <DashboardStats stats={stats} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <QuickActions />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {/* Recent Activity */}
            <RecentActivity activities={recentActivity} />

            {/* Live Notifications */}
            <LiveNotifications 
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notificationsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
