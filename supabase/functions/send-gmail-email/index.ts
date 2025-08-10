
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  recipients: string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { recipients, subject, htmlContent, textContent }: EmailRequest = await req.json();

    if (!recipients || !subject || !htmlContent) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: recipients, subject, htmlContent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Gmail credentials from environment
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailPassword) {
      return new Response(
        JSON.stringify({ error: 'Gmail credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending emails to ${recipients.length} recipients`);

    const results = [];

    // Send emails one by one to avoid rate limiting
    for (const recipient of recipients) {
      try {
        // Create email message in MIME format
        const emailMessage = [
          `From: ${gmailUser}`,
          `To: ${recipient}`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          'Content-Type: multipart/alternative; boundary="boundary123"',
          '',
          '--boundary123',
          'Content-Type: text/plain; charset=UTF-8',
          '',
          textContent || htmlContent.replace(/<[^>]*>/g, ''),
          '',
          '--boundary123',
          'Content-Type: text/html; charset=UTF-8',
          '',
          htmlContent,
          '',
          '--boundary123--'
        ].join('\r\n');

        // Encode message in base64
        const encodedMessage = btoa(emailMessage).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        // Send via Gmail API
        const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${await getGmailAccessToken(gmailUser, gmailPassword)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedMessage
          })
        });

        if (gmailResponse.ok) {
          results.push({ recipient, success: true });
          console.log(`Email sent successfully to ${recipient}`);
        } else {
          const error = await gmailResponse.text();
          results.push({ recipient, success: false, error });
          console.error(`Failed to send email to ${recipient}:`, error);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
        console.error(`Error sending to ${recipient}:`, error);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return new Response(JSON.stringify({
      success: true,
      message: `Sent ${successCount} emails successfully, ${failureCount} failed`,
      results,
      totalSent: successCount,
      totalFailed: failureCount
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Gmail email sending error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send emails', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

// Helper function to get Gmail access token
async function getGmailAccessToken(email: string, appPassword: string): Promise<string> {
  // For app passwords, we need to use OAuth2 or create a service account
  // This is a simplified implementation - in production, you'd use proper OAuth2
  
  // For now, return the app password (this needs proper OAuth2 implementation)
  return appPassword;
}

serve(handler);
