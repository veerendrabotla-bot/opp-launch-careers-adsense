
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Users, 
  Eye, 
  TrendingUp,
  Activity,
  Calendar,
  Globe,
  MousePointer
} from 'lucide-react';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalOpportunities: 0,
    totalViews: 0,
    totalApplications: 0,
    monthlyGrowth: 0,
    topPages: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch basic counts
      const [usersRes, opportunitiesRes, analyticsRes, applicationsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('opportunities').select('id', { count: 'exact' }),
        supabase.from('analytics').select('*'),
        supabase.from('applications').select('id', { count: 'exact' })
      ]);

      const totalViews = analyticsRes.data?.filter(a => a.event_type === 'page_view').length || 0;
      
      setAnalytics({
        totalUsers: usersRes.count || 0,
        totalOpportunities: opportunitiesRes.count || 0,
        totalViews,
        totalApplications: applicationsRes.count || 0,
        monthlyGrowth: 12.5, // Mock data for now
        topPages: [
          { page: '/opportunities', views: Math.floor(totalViews * 0.4) },
          { page: '/scholarships', views: Math.floor(totalViews * 0.3) },
          { page: '/dashboard', views: Math.floor(totalViews * 0.2) }
        ],
        recentActivity: analyticsRes.data?.slice(-10) || []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Total Opportunities",
      value: analytics.totalOpportunities,
      icon: Activity,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Page Views",
      value: analytics.totalViews,
      icon: Eye,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Applications",
      value: analytics.totalApplications,
      icon: MousePointer,
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/admin/dashboard" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">Platform usage and performance metrics</p>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800">
              <BarChart3 className="h-3 w-3 mr-1" />
              Admin Analytics
            </Badge>
          </div>
        </div>
      </div>

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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPages.map((page, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{page.page}</span>
                    <Badge variant="secondary">{page.views} views</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{analytics.monthlyGrowth}%
                </div>
                <p className="text-sm text-gray-600">Monthly user growth</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Trending upward</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
