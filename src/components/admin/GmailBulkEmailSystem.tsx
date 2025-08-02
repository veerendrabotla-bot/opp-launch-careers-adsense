import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Send, 
  Users, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Loader2
} from 'lucide-react';

interface Recipient {
  name: string;
  email: string;
}

interface EmailStats {
  sent: number;
  failed: number;
  total: number;
}

const GmailBulkEmailSystem = () => {
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    password: ''
  });
  
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    recipientType: 'all',
    customEmails: ''
  });
  
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingStats, setSendingStats] = useState<EmailStats>({ sent: 0, failed: 0, total: 0 });
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();

  const validateConfig = () => {
    const isValid = smtpConfig.user && smtpConfig.password;
    setIsConfigValid(isValid);
    
    if (isValid) {
      toast({
        title: "Configuration Valid",
        description: "Gmail SMTP settings are configured correctly"
      });
    }
  };

  const fetchRecipients = async () => {
    try {
      let recipientList: Recipient[] = [];
      
      if (emailData.recipientType === 'all') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('name, email')
          .not('email', 'is', null);
          
        if (error) throw error;
        recipientList = profiles?.map(p => ({ name: p.name || 'User', email: p.email || '' })) || [];
      } else if (emailData.recipientType === 'custom') {
        const emails = emailData.customEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.includes('@'));
          
        recipientList = emails.map(email => ({ name: 'User', email }));
      }
      
      setRecipients(recipientList);
      setSendingStats({ sent: 0, failed: 0, total: recipientList.length });
      
      toast({
        title: "Recipients Loaded",
        description: `Found ${recipientList.length} recipients`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch recipients",
        variant: "destructive"
      });
    }
  };

  const sendBulkEmails = async () => {
    if (!isConfigValid || recipients.length === 0) {
      toast({
        title: "Error",
        description: "Please configure SMTP and load recipients first",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    const stats = { sent: 0, failed: 0, total: recipients.length };
    
    try {
      const batchSize = 10; // Send in batches to avoid overwhelming
      
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (recipient) => {
          try {
            const personalizedContent = emailData.content.replace(/\{\{name\}\}/g, recipient.name);
            
            const response = await fetch('/api/send-gmail-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: [recipient.email],
                subject: emailData.subject,
                html: personalizedContent,
                smtp: smtpConfig
              })
            });
            
            if (response.ok) {
              stats.sent++;
            } else {
              stats.failed++;
            }
          } catch (error) {
            stats.failed++;
          }
          
          setSendingStats({ ...stats });
        });
        
        await Promise.all(batchPromises);
        
        // Small delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast({
        title: "Bulk Email Complete",
        description: `Sent: ${stats.sent}, Failed: ${stats.failed}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send bulk emails",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gmail SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp-user">Gmail Email</Label>
              <Input
                id="smtp-user"
                type="email"
                value={smtpConfig.user}
                onChange={(e) => setSmtpConfig({...smtpConfig, user: e.target.value})}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp-password">App Password</Label>
              <Input
                id="smtp-password"
                type="password"
                value={smtpConfig.password}
                onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                placeholder="Your Gmail app password"
              />
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Use Gmail App Passwords for authentication. Enable 2FA and generate an app password in your Google Account settings.
            </AlertDescription>
          </Alert>
          
          <Button onClick={validateConfig} className="w-full">
            {isConfigValid ? <CheckCircle className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
            {isConfigValid ? 'Configuration Valid' : 'Validate Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Email Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              placeholder="Your email subject..."
            />
          </div>
          
          <div>
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              value={emailData.content}
              onChange={(e) => setEmailData({...emailData, content: e.target.value})}
              placeholder="Your email content... Use {{name}} for personalization"
              rows={8}
            />
          </div>
          
          <div>
            <Label>Recipients</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="all-users"
                  name="recipients"
                  value="all"
                  checked={emailData.recipientType === 'all'}
                  onChange={(e) => setEmailData({...emailData, recipientType: e.target.value})}
                />
                <Label htmlFor="all-users">All registered users</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom-emails"
                  name="recipients"
                  value="custom"
                  checked={emailData.recipientType === 'custom'}
                  onChange={(e) => setEmailData({...emailData, recipientType: e.target.value})}
                />
                <Label htmlFor="custom-emails">Custom email list</Label>
              </div>
            </div>
            
            {emailData.recipientType === 'custom' && (
              <Textarea
                value={emailData.customEmails}
                onChange={(e) => setEmailData({...emailData, customEmails: e.target.value})}
                placeholder="Enter comma-separated email addresses..."
                rows={3}
              />
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={fetchRecipients} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Load Recipients ({recipients.length})
            </Button>
            <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-semibold">Subject: {emailData.subject}</h3>
              <div className="mt-2" dangerouslySetInnerHTML={{
                __html: emailData.content.replace(/\{\{name\}\}/g, 'John Doe')
              }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipients List */}
      {recipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients ({recipients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {recipients.slice(0, 10).map((recipient: Recipient, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{recipient.name}</span>
                  <span className="text-sm text-gray-500">{recipient.email}</span>
                </div>
              ))}
              {recipients.length > 10 && (
                <div className="text-center text-gray-500 text-sm">
                  ...and {recipients.length - 10} more recipients
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sending Progress */}
      {isSending && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sending Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={(sendingStats.sent + sendingStats.failed) / sendingStats.total * 100} />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sent: {sendingStats.sent}</span>
                <span>Failed: {sendingStats.failed}</span>
                <span>Total: {sendingStats.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Button */}
      <Button 
        onClick={sendBulkEmails} 
        disabled={!isConfigValid || recipients.length === 0 || isSending}
        className="w-full"
        size="lg"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {isSending ? 'Sending...' : `Send to ${recipients.length} recipients`}
      </Button>
    </div>
  );
};

export default GmailBulkEmailSystem;
