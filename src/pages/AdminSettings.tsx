
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';
import { 
  Settings, 
  AlertTriangle,
  Save,
  Upload,
  Bell,
  Shield,
  Database
} from 'lucide-react';

const AdminSettings = () => {
  const { isAdmin } = useAdmin();
  const { settings, updateSetting, loading } = usePlatformSettings();
  const { toast } = useToast();

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

  const handleSettingChange = async (key: string, value: any) => {
    await updateSetting(key, value);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-gray-600 mt-2">Configure platform features and behavior</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Feature Toggles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Feature Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="resume-ai">Resume AI Tailoring</Label>
                    <p className="text-sm text-gray-500">Allow users to use AI for resume optimization</p>
                  </div>
                  <Switch
                    id="resume-ai"
                    checked={settings.enable_resume_ai === true}
                    onCheckedChange={(checked) => handleSettingChange('enable_resume_ai', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="submissions">User Submissions</Label>
                    <p className="text-sm text-gray-500">Allow users to submit new opportunities</p>
                  </div>
                  <Switch
                    id="submissions"
                    checked={settings.enable_submissions === true}
                    onCheckedChange={(checked) => handleSettingChange('enable_submissions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="login-required">Require Login for Apply</Label>
                    <p className="text-sm text-gray-500">Users must login before accessing external links</p>
                  </div>
                  <Switch
                    id="login-required"
                    checked={settings.require_login_for_apply === true}
                    onCheckedChange={(checked) => handleSettingChange('require_login_for_apply', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Automation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Automation & Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-delete">Auto-delete Expired Opportunities</Label>
                    <p className="text-sm text-gray-500">Automatically remove opportunities 7 days after expiry</p>
                  </div>
                  <Switch
                    id="auto-delete"
                    checked={settings.auto_delete_expired === true}
                    onCheckedChange={(checked) => handleSettingChange('auto_delete_expired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Show maintenance page to all users</p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={settings.maintenance_mode === true}
                    onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications & Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-digest">Weekly Digest Emails</Label>
                    <p className="text-sm text-gray-500">Send weekly opportunity digest to users</p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={settings.weekly_digest === true}
                    onCheckedChange={(checked) => handleSettingChange('weekly_digest', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    value={settings.admin_email || ''}
                    onChange={(e) => handleSettingChange('admin_email', e.target.value)}
                    placeholder="admin@opportune.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    value={settings.support_email || ''}
                    onChange={(e) => handleSettingChange('support_email', e.target.value)}
                    placeholder="support@opportune.com"
                    type="email"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="announcement">Platform Announcement</Label>
                  <Textarea
                    id="announcement"
                    value={settings.platform_announcement || ''}
                    onChange={(e) => handleSettingChange('platform_announcement', e.target.value)}
                    placeholder="Enter any announcement for users..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-info">Contact Information</Label>
                  <Textarea
                    id="contact-info"
                    value={settings.contact_info || ''}
                    onChange={(e) => handleSettingChange('contact_info', e.target.value)}
                    placeholder="Contact details for users..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
