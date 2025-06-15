
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Send, Calendar, Users, Edit, Trash2 } from 'lucide-react';

const AdminEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
    recipient_type: 'all',
    recipient_emails: '',
    scheduled_at: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
    }
  };

  React.useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const campaignData = {
        ...formData,
        admin_id: user.id,
        recipient_emails: formData.recipient_type === 'specific' 
          ? formData.recipient_emails.split(',').map(email => email.trim())
          : null,
        scheduled_at: formData.scheduled_at || null
      };

      const { error } = await supabase
        .from('email_campaigns')
        .insert(campaignData);

      if (error) throw error;

      toast({
        title: "Campaign Created",
        description: "Email campaign has been created successfully.",
      });

      setFormData({
        title: '',
        subject: '',
        content: '',
        recipient_type: 'all',
        recipient_emails: '',
        scheduled_at: ''
      });
      setShowForm(false);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sent: 'default',
      scheduled: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-gray-600">Manage and send email campaigns to users</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Mail className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Email Campaign</CardTitle>
            <CardDescription>Design and schedule email campaigns for your users</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Internal campaign name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Subject line for the email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Email content (HTML supported)"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Recipients</label>
                  <Select value={formData.recipient_type} onValueChange={(value) => setFormData({ ...formData, recipient_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="specific">Specific Emails</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  />
                </div>
              </div>

              {formData.recipient_type === 'specific' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Email Addresses</label>
                  <Textarea
                    value={formData.recipient_emails}
                    onChange={(e) => setFormData({ ...formData, recipient_emails: e.target.value })}
                    placeholder="Enter email addresses separated by commas"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Campaign'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {campaigns.map((campaign: any) => (
          <Card key={campaign.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{campaign.title}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-gray-600">{campaign.subject}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {campaign.recipient_type}
                    </span>
                    {campaign.scheduled_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(campaign.scheduled_at).toLocaleDateString()}
                      </span>
                    )}
                    <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminEmailCampaigns;
