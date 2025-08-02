
interface EmailConfig {
  service: 'resend' | 'zoho';
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
}

export const sendEmail = async (emailData: EmailData, config: EmailConfig) => {
  if (config.service === 'resend') {
    // Use existing Resend integration
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...emailData,
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
        smtp: config.smtp
      })
    });
    return response.json();
  }
};

export const validateEmailConfig = (config: EmailConfig): boolean => {
  if (config.service === 'resend') {
    return !!config.apiKey;
  } else if (config.service === 'zoho') {
    return !!(config.smtp?.host && config.smtp?.user && config.smtp?.password);
  }
  return false;
};
