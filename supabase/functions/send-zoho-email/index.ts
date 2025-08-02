
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ZohoEmailRequest {
  to: string[];
  subject: string;
  html: string;
  from: string;
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
    const { to, subject, html, from, smtp }: ZohoEmailRequest = await req.json();

    const client = new SMTPClient({
      connection: {
        hostname: smtp.host,
        port: smtp.port,
        tls: true,
        auth: {
          username: smtp.user,
          password: smtp.password,
        },
      },
    });

    for (const recipient of to) {
      await client.send({
        from: from,
        to: recipient,
        subject: subject,
        content: html,
        html: html,
      });
    }

    await client.close();

    console.log("Zoho email sent successfully to:", to);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${to.length} recipients` 
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending Zoho email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email" 
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
