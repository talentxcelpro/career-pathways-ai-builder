import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: 'application_received' | 'status_updated' | 'interview_scheduled';
  data: {
    applicantName?: string;
    jobTitle?: string;
    companyName?: string;
    newStatus?: string;
    interviewDate?: string;
    interviewTime?: string;
    interviewLocation?: string;
    employerName?: string;
    applicationId?: string;
  };
}

const getEmailTemplate = (template: string, data: any) => {
  switch (template) {
    case 'application_received':
      return {
        subject: `New Application for ${data.jobTitle} - ${data.applicantName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">New Job Application Received</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #1e293b;">Application Details</h3>
              <ul style="color: #475569; line-height: 1.6;">
                <li><strong>Position:</strong> ${data.jobTitle}</li>
                <li><strong>Applicant:</strong> ${data.applicantName}</li>
                <li><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">
              A new candidate has applied for the ${data.jobTitle} position at ${data.companyName}. 
              You can review their application and manage it through your employer dashboard.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('FRONTEND_URL')}/employer/applications" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Application
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The TalentXcel Team
            </p>
          </div>
        `
      };
      
    case 'status_updated':
      return {
        subject: `Application Status Update - ${data.jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Application Status Update</h2>
            
            <p style="color: #475569; line-height: 1.6;">
              Dear ${data.applicantName},
            </p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e293b;">Status Update</h3>
              <p style="color: #475569; line-height: 1.6;">
                Your application for the <strong>${data.jobTitle}</strong> position at 
                <strong>${data.companyName}</strong> has been updated.
              </p>
              <p style="color: #2563eb; font-size: 18px; font-weight: bold;">
                New Status: ${data.newStatus?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('FRONTEND_URL')}/applications" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Application Status
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The TalentXcel Team
            </p>
          </div>
        `
      };
      
    case 'interview_scheduled':
      return {
        subject: `Interview Scheduled - ${data.jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #16a34a; margin-bottom: 20px;">Interview Scheduled!</h2>
            
            <p style="color: #475569; line-height: 1.6;">
              Dear ${data.applicantName},
            </p>
            
            <p style="color: #475569; line-height: 1.6;">
              Congratulations! You have been selected for an interview for the 
              <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.
            </p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3 style="margin-top: 0; color: #166534;">Interview Details</h3>
              <ul style="color: #15803d; line-height: 1.6;">
                <li><strong>Date:</strong> ${data.interviewDate}</li>
                <li><strong>Time:</strong> ${data.interviewTime}</li>
                <li><strong>Location:</strong> ${data.interviewLocation}</li>
                <li><strong>Position:</strong> ${data.jobTitle}</li>
              </ul>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">
              Please confirm your attendance and feel free to reach out if you have any questions.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('FRONTEND_URL')}/applications" 
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Interview Details
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Best of luck!<br>
              The TalentXcel Team
            </p>
          </div>
        `
      };
      
    default:
      throw new Error(`Unknown template: ${template}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, template, data }: EmailRequest = await req.json();

    if (!to || !template || !data) {
      throw new Error('Missing required fields: to, template, data');
    }

    const emailTemplate = getEmailTemplate(template, data);
    
    const emailResponse = await resend.emails.send({
      from: "TalentXcel <noreply@talentxcel.dev>",
      to: [to],
      subject: subject || emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-job-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);