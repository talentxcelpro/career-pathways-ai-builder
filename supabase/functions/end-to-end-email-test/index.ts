import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface EndToEndTestRequest {
  test_email: string;
  test_user_name: string;
  scenarios: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Starting end-to-end email automation tests...');
    
    const { test_email, test_user_name, scenarios }: EndToEndTestRequest = await req.json();

    if (!test_email || !test_user_name) {
      throw new Error('Test email and user name are required');
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Test Scenario 1: User Registration Flow
    if (scenarios.includes('user_registration')) {
      try {
        console.log('Testing user registration email flow...');
        
        // Create test user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            full_name: test_user_name,
            email: test_email,
            title: 'Test Software Engineer',
            about: 'Test profile for email automation validation',
            location: 'Remote',
            profile_completion_score: 65
          })
          .select()
          .single();

        if (profileError) {
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }

        // Trigger welcome email
        const { error: welcomeError } = await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: 'welcome_email',
            recipient_email: test_email,
            recipient_name: test_user_name,
            template_data: {
              platform_name: 'TalentXcel',
              getting_started_url: 'https://talentxcel.in/onboarding'
            },
            scheduled_at: new Date().toISOString()
          });

        if (welcomeError) throw welcomeError;

        results.push({
          scenario: 'user_registration',
          status: 'success',
          message: 'User registration flow completed',
          profile_id: profileData.id
        });
        successCount++;

      } catch (error: any) {
        console.error('User registration test failed:', error);
        results.push({
          scenario: 'user_registration',
          status: 'failed',
          error: error.message
        });
        failureCount++;
      }
    }

    // Test Scenario 2: Job Application Flow
    if (scenarios.includes('job_application')) {
      try {
        console.log('Testing job application email flow...');

        // Get a real job from the database
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id, title, company_name, posted_by')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (jobError || !jobData) {
          throw new Error('No active jobs found for testing');
        }

        // Create test job application
        const { data: applicationData, error: applicationError } = await supabase
          .from('job_applications')
          .insert({
            job_id: jobData.id,
            user_id: null, // Anonymous application for testing
            application_data: {
              fullName: test_user_name,
              email: test_email,
              phone: '+1234567890',
              coverLetter: 'Test application for email automation validation'
            },
            resume_url: 'https://example.com/test-resume.pdf'
          })
          .select()
          .single();

        if (applicationError) {
          throw new Error(`Application creation failed: ${applicationError.message}`);
        }

        // Trigger application confirmation email
        const { error: confirmationError } = await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: 'application_confirmation',
            recipient_email: test_email,
            recipient_name: test_user_name,
            template_data: {
              job_title: jobData.title,
              company_name: jobData.company_name,
              application_date: new Date().toLocaleDateString(),
              application_id: applicationData.id
            },
            scheduled_at: new Date().toISOString()
          });

        if (confirmationError) throw confirmationError;

        // If job has a poster, send notification to employer
        if (jobData.posted_by) {
          const { data: employerData } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', jobData.posted_by)
            .single();

          if (employerData?.email) {
            await supabase
              .from('email_automation_queue')
              .insert({
                trigger_type: 'job_application_received',
                recipient_email: employerData.email,
                recipient_name: employerData.full_name || 'Employer',
                template_data: {
                  job_title: jobData.title,
                  applicant_name: test_user_name,
                  applicant_email: test_email,
                  application_date: new Date().toLocaleDateString()
                },
                scheduled_at: new Date().toISOString()
              });
          }
        }

        results.push({
          scenario: 'job_application',
          status: 'success',
          message: 'Job application flow completed',
          job_title: jobData.title,
          application_id: applicationData.id
        });
        successCount++;

      } catch (error: any) {
        console.error('Job application test failed:', error);
        results.push({
          scenario: 'job_application',
          status: 'failed',
          error: error.message
        });
        failureCount++;
      }
    }

    // Test Scenario 3: Job Recommendations
    if (scenarios.includes('job_recommendations')) {
      try {
        console.log('Testing job recommendations email flow...');

        // Get some relevant jobs for recommendations
        const { data: recommendedJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, company_name, location, salary_range')
          .eq('is_active', true)
          .limit(5);

        if (jobsError) throw jobsError;

        // Trigger job recommendation email
        const { error: recommendationError } = await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: 'job_recommendation',
            recipient_email: test_email,
            recipient_name: test_user_name,
            template_data: {
              job_count: recommendedJobs?.length || 0,
              top_job_title: recommendedJobs?.[0]?.title || 'Software Engineer',
              top_company: recommendedJobs?.[0]?.company_name || 'TalentXcel',
              match_score: 87,
              recommended_jobs: recommendedJobs?.slice(0, 3) || []
            },
            scheduled_at: new Date().toISOString()
          });

        if (recommendationError) throw recommendationError;

        results.push({
          scenario: 'job_recommendations',
          status: 'success',
          message: 'Job recommendations flow completed',
          jobs_count: recommendedJobs?.length || 0
        });
        successCount++;

      } catch (error: any) {
        console.error('Job recommendations test failed:', error);
        results.push({
          scenario: 'job_recommendations',
          status: 'failed',
          error: error.message
        });
        failureCount++;
      }
    }

    // Test Scenario 4: Profile Completion Reminder
    if (scenarios.includes('profile_completion')) {
      try {
        console.log('Testing profile completion reminder flow...');

        const { error: reminderError } = await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: 'profile_completion_reminder',
            recipient_email: test_email,
            recipient_name: test_user_name,
            template_data: {
              completion_percentage: 65,
              missing_fields: ['skills', 'experience', 'education'],
              profile_url: 'https://talentxcel.in/profile/edit'
            },
            scheduled_at: new Date().toISOString()
          });

        if (reminderError) throw reminderError;

        results.push({
          scenario: 'profile_completion',
          status: 'success',
          message: 'Profile completion reminder flow completed'
        });
        successCount++;

      } catch (error: any) {
        console.error('Profile completion test failed:', error);
        results.push({
          scenario: 'profile_completion',
          status: 'failed',
          error: error.message
        });
        failureCount++;
      }
    }

    // Process the email queue to send all queued emails
    console.log('Processing email queue to send test emails...');
    try {
      const { data: queueResult, error: queueError } = await supabase.functions.invoke('process-email-queue');
      
      if (queueError) {
        console.error('Queue processing error:', queueError);
      } else {
        console.log('Queue processing result:', queueResult);
      }
    } catch (queueError) {
      console.error('Failed to process email queue:', queueError);
    }

    // Wait a moment for emails to be processed
    await new Promise(resolve => setTimeout(resolve, 3000));

    const summary = {
      success: true,
      message: `End-to-end email testing completed`,
      test_summary: {
        total_scenarios: scenarios.length,
        successful: successCount,
        failed: failureCount,
        success_rate: Math.round((successCount / scenarios.length) * 100)
      },
      test_email,
      test_user_name,
      scenarios_tested: scenarios,
      results,
      timestamp: new Date().toISOString(),
      next_steps: [
        'Check your email inbox for test messages',
        'Verify email delivery in AWS SES console',
        'Monitor email_automation_queue table for status updates',
        'Check email_delivery_tracking for delivery confirmations'
      ]
    };

    console.log('End-to-end test complete:', summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("End-to-end email test error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);