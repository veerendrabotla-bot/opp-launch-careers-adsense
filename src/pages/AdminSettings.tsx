
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2 } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platform_name: 'OpportunityHub',
    platform_description: 'Find and share opportunities',
    auto_approve_opportunities: false,
    email_notifications: true,
    maintenance_mode: false,
    max_opportunities_per_user: 10
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;

      // Convert array of settings to object
      const settingsObject = data?.reduce((acc: any, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings(prev => ({ ...prev, ...settingsObject }));
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Convert settings object to array format for database
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        description: getSettingDescription(key)
      }));

      // Upsert each setting
      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('platform_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            description: setting.description,
            updated_by: (await supabase.auth.getUser()).data.user?.id
          }, {
            onConflict: 'key'
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      platform_name: 'The name of the platform',
      platform_description: 'Platform description for SEO and branding',
      auto_approve_opportunities: 'Automatically approve submitted opportunities',
      email_notifications: 'Enable email notifications for users',
      maintenance_mode: 'Put platform in maintenance mode',
      max_opportunities_per_user: 'Maximum opportunities a user can submit per day'
    };
    return descriptions[key] || '';
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-gray-600 mt-2">Configure platform-wide settings</p>
            </div>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platform_name">Platform Name</Label>
                <Input
                  id="platform_name"
                  value={settings.platform_name}
                  onChange={(e) => handleInputChange('platform_name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="platform_description">Platform Description</Label>
                <Textarea
                  id="platform_description"
                  value={settings.platform_description}
                  onChange={(e) => handleInputChange('platform_description', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="max_opportunities">Max Opportunities Per User (Daily)</Label>
                <Input
                  id="max_opportunities"
                  type="number"
                  value={settings.max_opportunities_per_user}
                  onChange={(e) => handleInputChange('max_opportunities_per_user', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve Opportunities</Label>
                  <p className="text-sm text-gray-600">Automatically approve submitted opportunities without manual review</p>
                </div>
                <Switch
                  checked={settings.auto_approve_opportunities}
                  onCheckedChange={(checked) => handleInputChange('auto_approve_opportunities', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600">Enable email notifications for users</p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Put the platform in maintenance mode</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
