
interface EmailConfig {
  service: 'resend' | 'zoho' | 'gmail';
  apiKey?: string;
  smtp?: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
}

interface EmailData {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  trackLinks?: boolean;
}

interface LinkShortenerData {
  originalUrl: string;
  shortCode: string;
  userId?: string;
  campaignId?: string;
}

// URL Shortener utility
export const shortenUrl = async (originalUrl: string, campaignId?: string): Promise<string> => {
  try {
    const shortCode = Math.random().toString(36).substring(2, 8);
    
    // Store the short link in your database (you'll need to implement this)
    const linkData: LinkShortenerData = {
      originalUrl,
      shortCode,
      campaignId
    };

    // For now, return a mock shortened URL
    // In production, you'd store this in your database and return the actual short URL
    return `${window.location.origin}/go/${shortCode}`;
  } catch (error) {
    console.error('Error shortening URL:', error);
    return originalUrl; // Fallback to original URL
  }
};

// Process email content to add tracking and shorten URLs
export const processEmailContent = async (html: string, campaignId?: string, trackLinks: boolean = true): Promise<string> => {
  if (!trackLinks) return html;

  // Regular expression to find URLs in href attributes
  const urlRegex = /href="([^"]+)"/g;
  let processedHtml = html;
  const matches = [...html.matchAll(urlRegex)];

  for (const match of matches) {
    const originalUrl = match[1];
    
    // Skip if it's already a tracking URL or not a valid URL
    if (originalUrl.includes('/go/') || originalUrl.startsWith('#') || originalUrl.startsWith('mailto:')) {
      continue;
    }

    const shortenedUrl = await shortenUrl(originalUrl, campaignId);
    processedHtml = processedHtml.replace(match[0], `href="${shortenedUrl}"`);
  }

  return processedHtml;
};

export const sendEmail = async (emailData: EmailData, config: EmailConfig) => {
  // Process email content for link tracking
  const processedHtml = await processEmailContent(
    emailData.html, 
    'bulk-campaign', 
    emailData.trackLinks !== false
  );

  if (config.service === 'gmail') {
    const response = await fetch('/api/send-gmail-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...emailData,
        html: processedHtml,
        smtp: config.smtp
      })
    });
    return response.json();
  } else if (config.service === 'resend') {
    // Use existing Resend integration
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...emailData,
        html: processedHtml,
        apiKey: config.apiKey
      })
    });
    return response.json();
  } else if (config.service === 'zoho') {
    // Use Zoho SMTP integration
    const response = await fetch('/api/send-zoho-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...emailData,
        html: processedHtml,
        smtp: config.smtp
      })
    });
    return response.json();
  }
};

export const validateEmailConfig = (config: EmailConfig): boolean => {
  if (config.service === 'gmail') {
    return !!(config.smtp?.host && config.smtp?.user && config.smtp?.password);
  } else if (config.service === 'resend') {
    return !!config.apiKey;
  } else if (config.service === 'zoho') {
    return !!(config.smtp?.host && config.smtp?.user && config.smtp?.password);
  }
  return false;
};

// Email templates with unsubscribe links
export const createEmailTemplate = (content: string, recipientName: string, unsubscribeUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OpportunityHub Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">OpportunityHub</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Connecting talent with opportunities</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
        <p>Hello ${recipientName},</p>
        
        ${content}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 14px; text-align: center;">
            You're receiving this email because you signed up for OpportunityHub updates.
            <br>
            <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
            <a href="${window.location.origin}/contact" style="color: #667eea; text-decoration: none;">Contact Us</a>
          </p>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            OpportunityHub - Connecting talent with opportunities<br>
            This email was sent from a notification-only address that cannot accept incoming email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
