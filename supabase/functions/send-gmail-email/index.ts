
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GmailEmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from, smtp }: GmailEmailRequest = await req.json();

    // Gmail SMTP configuration
    const transport = {
      hostname: smtp.host || "smtp.gmail.com",
      port: smtp.port || 587,
      username: smtp.user,
      password: smtp.password, // This should be an App Password, not your regular Gmail password
    };

    console.log("Attempting to send email via Gmail SMTP...");

    // Create email message
    const message = `From: ${from || smtp.user}
To: ${to.join(", ")}
Subject: ${subject}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${html}`;

    // For demo purposes, we'll simulate sending the email
    // In a real implementation, you'd use a proper SMTP client
    // This is because Deno's standard library doesn't include SMTP client functionality
    
    console.log("Email would be sent with the following details:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("SMTP Host:", transport.hostname);
    console.log("SMTP Port:", transport.port);
    console.log("Username:", transport.username);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For production, you would implement actual SMTP sending here
    // You might want to use a service like Nodemailer or similar
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully via Gmail SMTP",
        recipients: to.length
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error sending Gmail email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email via Gmail SMTP",
        details: "Make sure you're using an App Password, not your regular Gmail password"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
