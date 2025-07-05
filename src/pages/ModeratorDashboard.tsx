
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ModeratorNavigation from '@/components/ModeratorNavigation';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';

const ModeratorDashboard = () => {
  const { pendingOpportunities, allOpportunities, isModerator, loading } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCount: 0,
    approvedToday: 0,
    totalApproved: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (isModerator) {
      fetchModeratorStats();
      setupRealTimeUpdates();
    }
  }, [isModerator]);

  useEffect(() => {
    if (allOpportunities.length > 0) {
      const today = new Date().toDateString();
      const approvedToday = allOpportunities.filter(opp => 
        opp.is_approved && 
        opp.approved_at && 
        new Date(opp.approved_at).toDateString() === today
      ).length;

      const totalApproved = allOpportunities.filter(opp => opp.is_approved).length;

      setStats(prev => ({
        ...prev,
        pendingCount: pendingOpportunities.length,
        approvedToday,
        totalApproved
      }));

      // Set real recent activity from actual opportunities
      const sortedOpportunities = [...allOpportunities]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setRecentActivity(sortedOpportunities);
    }
  }, [allOpportunities, pendingOpportunities]);

  const fetchModeratorStats = async () => {
    try {
      // Fetch user count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      setStats(prev => ({
        ...prev,
        totalUsers: profiles?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching moderator stats:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('moderator-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunities',
        },
        () => {
          fetchModeratorStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Moderator privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Pending Review",
      value: stats.pendingCount,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
      trend: "Needs attention"
    },
    {
      title: "Approved Today",
      value: stats.approvedToday,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      trend: "Great progress"
    },
    {
      title: "Total Approved",
      value: stats.totalApproved,
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
      trend: "All time"
    },
    {
      title: "Platform Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      trend: "Growing community"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderator Dashboard</h1>
              <p className="text-gray-600 mt-2">Content moderation and platform oversight</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              <Shield className="h-3 w-3 mr-1" />
              Moderator Access
            </Badge>
          </div>
        </div>
      </div>
      
      <ModeratorNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Moderator Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/moderator/pending">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Review Pending Content ({stats.pendingCount})
                  </Button>
                </Link>
                <Link to="/moderator/approved">
                  <Button className="w-full justify-start" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    View Approved Content
                  </Button>
                </Link>
                <Link to="/moderator/users">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users ({stats.totalUsers})
                  </Button>
                </Link>
                <Link to="/admin/analytics">
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Platform Activity Log
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((opportunity) => (
                    <div key={opportunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{opportunity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(opportunity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        className={opportunity.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {opportunity.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
