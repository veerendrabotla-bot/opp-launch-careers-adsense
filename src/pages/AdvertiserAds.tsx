
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/BackButton';
import { Target, Eye, Users, DollarSign, Edit, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Ad {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number;
  spent: number;
  views: number;
  clicks: number;
  impressions: number;
  created_at: string;
}

const AdvertiserAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const updateAdStatus = async (adId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: newStatus })
        .eq('id', adId);

      if (error) throw error;
      
      setAds(ads.map(ad => 
        ad.id === adId ? { ...ad, status: newStatus } : ad
      ));
      
      toast.success(`Ad ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast.error('Failed to update ad status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/advertiser/dashboard" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Advertisements</h1>
                <p className="text-gray-600 mt-2">Manage your advertising campaigns</p>
              </div>
            </div>
            <Link to="/advertiser/create-ad">
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Create New Ad
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ads created yet</h3>
              <p className="text-gray-600 mb-6">Start your advertising journey by creating your first ad campaign.</p>
              <Link to="/advertiser/create-ad">
                <Button>Create Your First Ad</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{ad.title}</CardTitle>
                    <Badge className={getStatusColor(ad.status)}>
                      {ad.status}
                    </Badge>
                  </div>
                  {ad.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{ad.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{ad.clicks} clicks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">${ad.budget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{ad.impressions} imp.</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {ad.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateAdStatus(ad.id, 'paused')}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateAdStatus(ad.id, 'active')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertiserAds;
