
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Send, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Calendar
} from 'lucide-react';

interface EmailNotification {
  id: string;
  subject: string;
  content: string;
  recipient_type: string;
  target_roles: string[];
  status: string;
  sent_count: number;
  total_recipients: number;
  created_at: string;
  sent_at?: string;
}

const BulkEmailSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newEmail, setNewEmail] = useState({
    subject: '',
    content: '',
    recipient_type: 'all',
    target_roles: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailNotifications();
  }, []);

  const fetchEmailNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching email notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBulkNotification = async () => {
    if (!newEmail.subject.trim() || !newEmail.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);

      const targetRoles = newEmail.recipient_type === 'role_based' 
        ? newEmail.target_roles 
        : null;

      const { data: notificationId, error } = await supabase.rpc('send_bulk_notification', {
        _subject: newEmail.subject,
        _content: newEmail.content,
        _recipient_type: newEmail.recipient_type,
        _target_roles: targetRoles
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bulk notification created successfully",
      });

      // Reset form
      setNewEmail({
        subject: '',
        content: '',
        recipient_type: 'all',
        target_roles: []
      });

      // Refresh the list
      fetchEmailNotifications();

    } catch (error: any) {
      console.error('Error creating bulk notification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bulk notification",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sending':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sending: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.draft}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Create New Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Bulk Email Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={newEmail.subject}
              onChange={(e) => setNewEmail(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter email subject"
              disabled={sending}
            />
          </div>

          <div>
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              value={newEmail.content}
              onChange={(e) => setNewEmail(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your email message here..."
              rows={6}
              disabled={sending}
            />
          </div>

          <div>
            <Label htmlFor="recipient_type">Recipients</Label>
            <Select
              value={newEmail.recipient_type}
              onValueChange={(value) => setNewEmail(prev => ({ ...prev, recipient_type: value }))}
              disabled={sending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="role_based">Specific Roles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newEmail.recipient_type === 'role_based' && (
            <div>
              <Label>Target Roles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['user', 'moderator', 'admin', 'advertiser'].map(role => (
                  <label key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEmail.target_roles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewEmail(prev => ({ 
                            ...prev, 
                            target_roles: [...prev.target_roles, role] 
                          }));
                        } else {
                          setNewEmail(prev => ({ 
                            ...prev, 
                            target_roles: prev.target_roles.filter(r => r !== role) 
                          }));
                        }
                      }}
                      disabled={sending}
                    />
                    <span className="capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={createBulkNotification}
            disabled={sending || !newEmail.subject.trim() || !newEmail.content.trim()}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Notification...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Bulk Notification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Email History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Email Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No email notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(notification.status)}
                        <h3 className="font-medium">{notification.subject}</h3>
                        {getStatusBadge(notification.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.recipient_type === 'all' 
                            ? 'All Users' 
                            : `Roles: ${notification.target_roles?.join(', ') || 'None'}`
                          }
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {new Date(notification.created_at).toLocaleDateString()}
                        </div>

                        {notification.status === 'sent' && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Sent to {notification.sent_count}/{notification.total_recipients} users
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> This system creates notification records that can be integrated 
          with your email service (like Resend) to actually send emails. The notifications are 
          stored and tracked but require additional email integration to deliver to users.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BulkEmailSystem;
