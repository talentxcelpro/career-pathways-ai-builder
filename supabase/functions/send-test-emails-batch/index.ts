import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 Sending batch test emails to arsh.wani@gmail.com');

    const testEmails = [
      {
        to: 'arsh.wani@gmail.com',
        event_key: 'welcome',
        template_data: {
          candidate_name: 'Arsh Wani',
          first_name: 'Arsh'
        },
        subject: '🎉 Welcome to TalentXcel - Your Career Journey Starts Here!'
      },
      {
        to: 'arsh.wani@gmail.com',
        event_key: 'profile_completion_reminder',
        template_data: {
          candidate_name: 'Arsh Wani'
        },
        subject: '⏰ Complete Your Profile - Unlock Premium Features'
      },
      {
        to: 'arsh.wani@gmail.com',
        event_key: 'job_recommendation',
        template_data: {
          candidate_name: 'Arsh Wani',
          job_title: 'Senior Software Engineer',
          company_name: 'TechCorp Solutions',
          location: 'Mumbai, India',
          experience_level: 'Senior',
          salary_range: '₹15-25 LPA',
          job_id: 'TC-2024-001'
        },
        subject: '💼 Perfect Job Match Found - Senior Software Engineer'
      },
      {
        to: 'arsh.wani@gmail.com',
        event_key: 'job_recommendation',
        template_data: {
          candidate_name: 'Arsh Wani',
          job_title: 'Full Stack Developer',
          company_name: 'Innovation Labs',
          location: 'Bangalore, India',
          experience_level: 'Mid-Level',
          salary_range: '₹12-18 LPA',
          job_id: 'IL-2024-005'
        },
        subject: '🚀 New Opportunity Alert - Full Stack Developer'
      },
      {
        to: 'arsh.wani@gmail.com',
        event_key: 'welcome',
        template_data: {
          candidate_name: 'Arsh Wani',
          first_name: 'Arsh'
        },
        subject: '✨ Your TalentXcel Account is Ready - Explore Premium Features'
      }
    ];

    const results = [];

    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      console.log(`📧 Sending test email ${i + 1}/5: ${email.subject}`);

      try {
        const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/unified-email-service', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...email,
            template: email.event_key,
            priority: 'high'
          }),
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
          console.log(`✅ Email ${i + 1} sent successfully: ${result.messageId}`);
          results.push({
            email_number: i + 1,
            subject: email.subject,
            template: email.event_key,
            status: 'sent',
            message_id: result.messageId,
            provider: result.provider
          });
        } else {
          console.error(`❌ Email ${i + 1} failed:`, result);
          results.push({
            email_number: i + 1,
            subject: email.subject,
            template: email.event_key,
            status: 'failed',
            error: result.error || 'Unknown error'
          });
        }

        // Small delay between emails
        if (i < testEmails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error: any) {
        console.error(`❌ Error sending email ${i + 1}:`, error);
        results.push({
          email_number: i + 1,
          subject: email.subject,
          template: email.event_key,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    return new Response(JSON.stringify({
      success: true,
      message: `Batch email test completed: ${successCount} sent, ${failureCount} failed`,
      recipient: 'arsh.wani@gmail.com',
      total_emails: testEmails.length,
      successful_emails: successCount,
      failed_emails: failureCount,
      results: results,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Batch email test failed:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: "Failed to send batch test emails",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);