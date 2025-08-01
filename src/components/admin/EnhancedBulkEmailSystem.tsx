
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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
  Calendar,
  Play
} from 'lucide-react';

type UserRole = 'user' | 'admin' | 'moderator' | 'advertiser';

interface EmailNotification {
  id: string;
  subject: string;
  content: string;
  recipient_type: string;
  target_roles: UserRole[] | null;
  status: string;
  sent_count: number;
  total_recipients: number;
  created_at: string;
  sent_at?: string;
}

interface EmailProgress {
  sent: number;
  total: number;
  failed: number;
  errors: string[];
}

const EnhancedBulkEmailSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<EmailProgress>({ sent: 0, total: 0, failed: 0, errors: [] });
  const [newEmail, setNewEmail] = useState({
    subject: '',
    content: '',
    recipient_type: 'all',
    target_roles: [] as UserRole[]
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

      setNewEmail({
        subject: '',
        content: '',
        recipient_type: 'all',
        target_roles: []
      });

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

  const sendEmails = async (notificationId: string) => {
    try {
      setSending(true);
      setSendingProgress({ sent: 0, total: 0, failed: 0, errors: [] });

      // Get notification details
      const { data: notification, error: notificationError } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (notificationError) throw notificationError;

      // Get recipients based on type
      let recipients: any[] = [];
      
      if (notification.recipient_type === 'all') {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('email, name')
          .not('email', 'is', null);
        
        if (profilesError) throw profilesError;
        recipients = profiles || [];
      } else if (notification.recipient_type === 'role_based' && notification.target_roles) {
        const { data: roleUsers, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', notification.target_roles);

        if (roleError) throw roleError;

        if (roleUsers && roleUsers.length > 0) {
          const userIds = roleUsers.map(ru => ru.user_id);
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('email, name')
            .in('id', userIds)
            .not('email', 'is', null);

          if (profilesError) throw profilesError;
          recipients = profiles || [];
        }
      }

      setSendingProgress(prev => ({ ...prev, total: recipients.length }));

      // Send emails
      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const recipient of recipients) {
        try {
          const emailHtml = `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 2rem;">OpportunityHub</h1>
              </div>
              
              <div style="padding: 2rem; background: #ffffff;">
                <p style="margin-bottom: 1rem;">Hello ${recipient.name || 'there'},</p>
                
                <div style="background: #f8f9fa; padding: 1.5rem; border-left: 4px solid #667eea; margin: 1.5rem 0;">
                  ${notification.content.replace(/\n/g, '<br>')}
                </div>
                
                <p style="color: #666; font-size: 0.9rem; margin-top: 2rem;">
                  This email was sent by OpportunityHub. If you no longer wish to receive these emails, 
                  please contact our support team.
                </p>
              </div>
              
              <div style="background: #f1f3f4; padding: 1rem; text-align: center; color: #666; font-size: 0.8rem;">
                <p>&copy; ${new Date().getFullYear()} OpportunityHub. All rights reserved.</p>
              </div>
            </div>
          `;

          const { error: sendError } = await supabase.functions.invoke('send-notification-email', {
            body: {
              to: recipient.email,
              subject: notification.subject,
              html: emailHtml,
              type: 'general'
            }
          });

          if (sendError) {
            throw new Error(`Failed to send to ${recipient.email}: ${sendError.message}`);
          }

          sent++;
          setSendingProgress(prev => ({ ...prev, sent }));
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (emailError: any) {
          failed++;
          errors.push(emailError.message);
          setSendingProgress(prev => ({ ...prev, failed, errors: [...prev.errors, emailError.message] }));
        }
      }

      // Update notification status
      await supabase
        .from('email_notifications')
        .update({
          status: 'sent',
          sent_count: sent,
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      toast({
        title: "Email Campaign Completed",
        description: `Successfully sent ${sent} emails. ${failed} failed.`,
        variant: failed > 0 ? "destructive" : "default"
      });

      fetchEmailNotifications();

    } catch (error: any) {
      console.error('Error sending emails:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send emails",
        variant: "destructive"
      });
    } finally {
      setSending(false);
      setSendingProgress({ sent: 0, total: 0, failed: 0, errors: [] });
    }
  };

  const handleRoleToggle = (role: UserRole, checked: boolean) => {
    if (checked) {
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

  const availableRoles: UserRole[] = ['user', 'moderator', 'admin', 'advertiser'];

  return (
    <div className="space-y-6">
      {/* Create New Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Bulk Email Campaign
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
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEmail.target_roles.includes(role)}
                      onChange={(e) => handleRoleToggle(role, e.target.checked)}
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
                Creating Campaign...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create Email Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sending Progress */}
      {sending && sendingProgress.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending Emails...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress 
              value={(sendingProgress.sent / sendingProgress.total) * 100} 
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sent: {sendingProgress.sent}/{sendingProgress.total}</span>
              <span>Failed: {sendingProgress.failed}</span>
            </div>
            {sendingProgress.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <details>
                    <summary>View Errors ({sendingProgress.errors.length})</summary>
                    <ul className="mt-2 space-y-1">
                      {sendingProgress.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx} className="text-xs">{error}</li>
                      ))}
                      {sendingProgress.errors.length > 5 && (
                        <li className="text-xs">... and {sendingProgress.errors.length - 5} more</li>
                      )}
                    </ul>
                  </details>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Email History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Email Campaign History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading campaigns...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No email campaigns yet</p>
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

                    {notification.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => sendEmails(notification.id)}
                        disabled={sending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>Email Integration Active:</strong> This system now sends real emails via Resend. 
          Make sure your sending domain is verified in your Resend dashboard to avoid delivery issues.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EnhancedBulkEmailSystem;
