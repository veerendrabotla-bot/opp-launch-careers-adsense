
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Plus, Loader2, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    subject: '',
    content: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email campaigns",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          title: newCampaign.title,
          subject: newCampaign.subject,
          content: newCampaign.content,
          admin_id: user.id,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email campaign created successfully"
      });

      setNewCampaign({ title: '', subject: '', content: '' });
      setIsDialogOpen(false);
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading email campaigns...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
              <p className="text-gray-600 mt-2">Create and manage email marketing campaigns</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Campaign</DialogTitle>
                  <DialogDescription>
                    Create a new email campaign to send to your users.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Internal campaign name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={newCampaign.subject}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject line"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Email Content</Label>
                    <Textarea
                      id="content"
                      value={newCampaign.content}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Email content (HTML supported)"
                      rows={10}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createCampaign}
                    disabled={!newCampaign.title || !newCampaign.subject || !newCampaign.content}
                  >
                    Create Campaign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{campaign.title}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Subject:</strong> {campaign.subject}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {campaign.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                        {campaign.sent_at && (
                          <div className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            Sent {new Date(campaign.sent_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {campaign.status === 'draft' && (
                        <Button size="sm" variant="outline">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {campaigns.length === 0 && (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No email campaigns yet</p>
                  <p className="text-sm text-gray-400">Create your first campaign to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEmailCampaigns;
