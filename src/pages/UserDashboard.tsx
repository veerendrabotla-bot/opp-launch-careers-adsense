
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/BackButton';
import { 
  BookmarkIcon, 
  Eye, 
  Send, 
  TrendingUp,
  Calendar,
  Target,
  Award,
  User,
  Bell,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [stats, setStats] = useState({
    bookmarks: 0,
    applications: 0,
    views: 0,
    profileCompletion: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchUserStats();
    fetchRecentActivity();
  }, []);

  const fetchUserStats = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Fetch bookmarks count
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id);

      // Fetch profile completion
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completion_score')
        .eq('id', user.id)
        .single();

      setStats({
        bookmarks: bookmarks?.length || 0,
        applications: 12, // Mock data
        views: 245, // Mock data
        profileCompletion: profile?.profile_completion_score || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    // Mock recent activity data
    setRecentActivity([
      {
        type: 'application',
        title: 'Applied to Software Engineering Internship at Google',
        date: '2 hours ago',
        status: 'pending'
      },
      {
        type: 'bookmark',
        title: 'Bookmarked Machine Learning Scholarship',
        date: '1 day ago',
        status: 'saved'
      },
      {
        type: 'view',
        title: 'Viewed 5 new opportunities in Technology',
        date: '2 days ago',
        status: 'viewed'
      }
    ]);
  };

  const statCards = [
    {
      title: "Saved Opportunities",
      value: stats.bookmarks,
      icon: BookmarkIcon,
      color: "bg-blue-100 text-blue-600",
      link: "/bookmarks"
    },
    {
      title: "Applications Sent",
      value: stats.applications,
      icon: Send,
      color: "bg-green-100 text-green-600",
      link: "/applications"
    },
    {
      title: "Profile Views",
      value: stats.views,
      icon: Eye,
      color: "bg-purple-100 text-purple-600",
      link: "/profile"
    },
    {
      title: "Profile Completion",
      value: `${stats.profileCompletion}%`,
      icon: User,
      color: "bg-orange-100 text-orange-600",
      link: "/profile"
    }
  ];

  const quickActions = [
    {
      title: "Browse Opportunities",
      description: "Find new internships and jobs",
      icon: Target,
      link: "/opportunities",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Scholarships",
      description: "Discover funding opportunities",
      icon: Award,
      link: "/scholarships",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      title: "Build Resume",
      description: "Create professional resumes",
      icon: FileText,
      link: "/resume-builder",
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Submit Opportunity",
      description: "Share opportunities with others",
      icon: Send,
      link: "/submit",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600 mt-2">Track your progress and manage your opportunities</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">
              <User className="h-3 w-3 mr-1" />
              User Account
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{action.description}</p>
                    <Link to={action.link}>
                      <Button className="w-full">
                        {action.title}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {activity.type === 'application' && <Send className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'bookmark' && <BookmarkIcon className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">New opportunities match your profile</p>
                      <p className="text-xs text-gray-500">5 new matches found</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Application status updated</p>
                      <p className="text-xs text-gray-500">Google internship - Under review</p>
                    </div>
                  </div>
                </div>
                <Link to="/notifications">
                  <Button variant="outline" className="w-full mt-4">
                    View All Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
