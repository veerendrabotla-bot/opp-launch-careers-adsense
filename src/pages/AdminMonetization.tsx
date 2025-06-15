
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminMonetization = () => {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [adSettings, setAdSettings] = useState({
    enableAds: true,
    googleAdSenseId: '',
    headerAdCode: '',
    sidebarAdCode: '',
    footerAdCode: ''
  });

  const [affiliateLinks, setAffiliateLinks] = useState([
    {
      id: 1,
      name: 'Coursera',
      url: 'https://www.coursera.org/?irclickid=affiliate-link',
      category: 'Education',
      commission: '5%',
      active: true
    },
    {
      id: 2,
      name: 'Udemy',
      url: 'https://www.udemy.com/?deal_code=affiliate',
      category: 'Education',
      commission: '8%',
      active: true
    }
  ]);

  const [sponsorBanners, setSponsorBanners] = useState([
    {
      id: 1,
      name: 'Tech Corp',
      imageUrl: '/placeholder.svg',
      targetUrl: 'https://techcorp.com',
      position: 'Header',
      active: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  ]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const saveAdSettings = () => {
    toast({
      title: "Ad Settings Saved",
      description: "Advertisement settings have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monetization & Ads</h1>
              <p className="text-gray-600 mt-2">Manage platform monetization settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$1,245</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ad Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">3,542</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Affiliate Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sponsor Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$2,100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-ads">Enable Advertisements</Label>
                  <p className="text-sm text-gray-500">Show ads across the platform</p>
                </div>
                <Switch
                  id="enable-ads"
                  checked={adSettings.enableAds}
                  onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, enableAds: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adsense-id">Google AdSense ID</Label>
                <Input
                  id="adsense-id"
                  value={adSettings.googleAdSenseId}
                  onChange={(e) => setAdSettings(prev => ({ ...prev, googleAdSenseId: e.target.value }))}
                  placeholder="ca-pub-xxxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="header-ad">Header Ad Code</Label>
                <Textarea
                  id="header-ad"
                  value={adSettings.headerAdCode}
                  onChange={(e) => setAdSettings(prev => ({ ...prev, headerAdCode: e.target.value }))}
                  placeholder="Paste your header ad code here..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sidebar-ad">Sidebar Ad Code</Label>
                <Textarea
                  id="sidebar-ad"
                  value={adSettings.sidebarAdCode}
                  onChange={(e) => setAdSettings(prev => ({ ...prev, sidebarAdCode: e.target.value }))}
                  placeholder="Paste your sidebar ad code here..."
                  rows={3}
                />
              </div>

              <Button onClick={saveAdSettings}>
                Save Ad Settings
              </Button>
            </CardContent>
          </Card>

          {/* Affiliate Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Affiliate Links
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Affiliate Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Partner Name" />
                      <Input placeholder="Affiliate URL" />
                      <Input placeholder="Category" />
                      <Input placeholder="Commission Rate" />
                      <Button className="w-full">Add Affiliate Link</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {affiliateLinks.map(link => (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{link.name}</h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {link.category}
                        </span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          {link.commission}
                        </span>
                        <Switch checked={link.active} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{link.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sponsor Banners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sponsor Banners
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Banner
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Sponsor Banner</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Sponsor Name" />
                      <Input placeholder="Image URL" />
                      <Input placeholder="Target URL" />
                      <Input placeholder="Position" />
                      <Input type="date" placeholder="Start Date" />
                      <Input type="date" placeholder="End Date" />
                      <Button className="w-full">Add Sponsor Banner</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sponsorBanners.map(banner => (
                  <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{banner.name}</h3>
                        <p className="text-sm text-gray-500">{banner.position}</p>
                        <p className="text-sm text-gray-500">
                          {banner.startDate} - {banner.endDate}
                        </p>
                      </div>
                      <Switch checked={banner.active} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMonetization;
