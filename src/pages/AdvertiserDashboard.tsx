
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/BackButton';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  DollarSign,
  Plus,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdData {
  id: string;
  title: string;
  status: string;
  views: number;
  clicks: number;
  budget: number;
  impressions: number;
}

const AdvertiserDashboard = () => {
  const [stats, setStats] = useState({
    activeAds: 0,
    totalViews: 0,
    totalClicks: 0,
    budget: 0,
    impressions: 0,
    ctr: 0
  });

  useEffect(() => {
    fetchAdvertiserStats();
  }, []);

  const fetchAdvertiserStats = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch advertiser statistics from ads table
      const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .eq('advertiser_id', user.id);

      if (error) {
        console.error('Error fetching ads:', error);
        return;
      }

      const adsData = ads as AdData[] || [];

      setStats({
        activeAds: adsData.filter(ad => ad.status === 'active').length,
        totalViews: adsData.reduce((sum, ad) => sum + (ad.views || 0), 0),
        totalClicks: adsData.reduce((sum, ad) => sum + (ad.clicks || 0), 0),
        budget: adsData.reduce((sum, ad) => sum + (ad.budget || 0), 0),
        impressions: adsData.reduce((sum, ad) => sum + (ad.impressions || 0), 0),
        ctr: adsData.length ? (adsData.reduce((sum, ad) => sum + (ad.clicks || 0), 0) / Math.max(adsData.reduce((sum, ad) => sum + (ad.impressions || 1), 0), 1) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching advertiser stats:', error);
    }
  };

  const statCards = [
    {
      title: "Active Ads",
      value: stats.activeAds,
      icon: Target,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks.toLocaleString(),
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Budget Spent",
      value: `$${stats.budget.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      title: "Impressions",
      value: stats.impressions.toLocaleString(),
      icon: TrendingUp,
      color: "bg-red-100 text-red-600"
    },
    {
      title: "CTR",
      value: `${stats.ctr.toFixed(2)}%`,
      icon: BarChart3,
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  const quickActions = [
    {
      title: "Create New Ad",
      description: "Launch a new advertising campaign",
      icon: Plus,
      link: "/advertiser/create-ad",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Campaign Analytics",
      description: "View detailed performance metrics",
      icon: BarChart3,
      link: "/advertiser/analytics",
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Ad Management",
      description: "Manage existing advertisements",
      icon: Target,
      link: "/advertiser/ads",
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Billing & Payments",
      description: "Manage billing and payment methods",
      icon: DollarSign,
      link: "/advertiser/billing",
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/opportunities" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advertiser Dashboard</h1>
                <p className="text-gray-600 mt-2">Manage your advertising campaigns and track performance</p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              Advertiser Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    Access {action.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvertiserDashboard;
