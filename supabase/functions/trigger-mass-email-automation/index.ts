import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Mass email automation trigger started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email_type = 'all', test_mode = false } = await req.json().catch(() => ({ email_type: 'all', test_mode: false }));
    
    let results = {
      welcome_emails: 0,
      profile_completion_reminders: 0,
      job_recommendations: 0,
      connection_requests: 0,
      monthly_digests: 0,
      total_queued: 0,
      errors: [] as string[]
    };

    // Get all active email event definitions
    const { data: emailTemplates, error: templatesError } = await supabase
      .from('email_event_definitions')
      .select('*')
      .eq('is_enabled', true);

    if (templatesError) {
      throw new Error(`Failed to get email templates: ${templatesError.message}`);
    }

    console.log(`Found ${emailTemplates?.length || 0} enabled email templates`);

    // Get eligible users for different email types
    if (email_type === 'all' || email_type === 'welcome_email') {
      // Send welcome emails to users who registered in last 7 days but haven't received welcome email
      const { data: newUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('email', 'is', null)
        .limit(test_mode ? 5 : 100);

      if (!usersError && newUsers) {
        for (const user of newUsers) {
          // Check if user already received welcome email
          const { data: existingEmail } = await supabase
            .from('email_automation_queue')
            .select('id')
            .eq('trigger_type', 'welcome_email')
            .eq('recipient_email', user.email)
            .single();

          if (!existingEmail) {
            const { error: queueError } = await supabase
              .from('email_automation_queue')
              .insert({
                trigger_type: 'welcome_email',
                recipient_email: user.email,
                recipient_name: user.full_name || 'User',
                template_data: {
                  candidate_name: user.full_name || 'User',
                  user_id: user.id
                },
                scheduled_at: new Date().toISOString(),
                status: 'pending'
              });

            if (queueError) {
              results.errors.push(`Welcome email for ${user.email}: ${queueError.message}`);
            } else {
              results.welcome_emails++;
            }
          }
        }
      }
    }

    // Profile completion reminders for incomplete profiles
    if (email_type === 'all' || email_type === 'profile_completion_reminder') {
      const { data: incompleteProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, about, title, location')
        .not('email', 'is', null)
        .limit(test_mode ? 5 : 200);

      if (!profilesError && incompleteProfiles) {
        for (const profile of incompleteProfiles) {
          // Calculate completion score
          let completionScore = 0;
          if (profile.full_name) completionScore += 25;
          if (profile.about && profile.about.length > 20) completionScore += 25;
          if (profile.title) completionScore += 25;
          if (profile.location) completionScore += 25;

          // Send reminder if profile is less than 75% complete
          if (completionScore < 75) {
            // Check if user received reminder in last 7 days
            const { data: recentReminder } = await supabase
              .from('email_automation_queue')
              .select('id')
              .eq('trigger_type', 'profile_completion_reminder')
              .eq('recipient_email', profile.email)
              .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
              .single();

            if (!recentReminder) {
              const { error: queueError } = await supabase
                .from('email_automation_queue')
                .insert({
                  trigger_type: 'profile_completion_reminder',
                  recipient_email: profile.email,
                  recipient_name: profile.full_name || 'User',
                  template_data: {
                    candidate_name: profile.full_name || 'User',
                    completion_percentage: completionScore,
                    user_id: profile.id
                  },
                  scheduled_at: new Date().toISOString(),
                  status: 'pending'
                });

              if (queueError) {
                results.errors.push(`Profile reminder for ${profile.email}: ${queueError.message}`);
              } else {
                results.profile_completion_reminders++;
              }
            }
          }
        }
      }
    }

    // Job recommendations for active users
    if (email_type === 'all' || email_type === 'job_recommendation') {
      const { data: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('id, full_name, email, title')
        .not('email', 'is', null)
        .not('title', 'is', null)
        .limit(test_mode ? 3 : 50);

      if (!activeError && activeUsers) {
        // Get some recent jobs
        const { data: recentJobs } = await supabase
          .from('jobs')
          .select('id, title, company_name, location')
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gte('posted_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
          .limit(10);

        if (recentJobs && recentJobs.length > 0) {
          for (const user of activeUsers) {
            // Check if user received job recommendation in last 3 days
            const { data: recentRec } = await supabase
              .from('email_automation_queue')
              .select('id')
              .eq('trigger_type', 'job_recommendation')
              .eq('recipient_email', user.email)
              .gte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
              .single();

            if (!recentRec) {
              const randomJob = recentJobs[Math.floor(Math.random() * recentJobs.length)];
              
              const { error: queueError } = await supabase
                .from('email_automation_queue')
                .insert({
                  trigger_type: 'job_recommendation',
                  recipient_email: user.email,
                  recipient_name: user.full_name || 'User',
                  template_data: {
                    candidate_name: user.full_name || 'User',
                    job_title: randomJob.title,
                    company_name: randomJob.company_name || 'Company',
                    job_location: randomJob.location || 'Location',
                    job_id: randomJob.id,
                    user_id: user.id
                  },
                  scheduled_at: new Date().toISOString(),
                  status: 'pending'
                });

              if (queueError) {
                results.errors.push(`Job recommendation for ${user.email}: ${queueError.message}`);
              } else {
                results.job_recommendations++;
              }
            }
          }
        }
      }
    }

    results.total_queued = results.welcome_emails + results.profile_completion_reminders + 
                          results.job_recommendations + results.connection_requests + results.monthly_digests;

    console.log('Mass email automation results:', results);

    // Trigger email queue processing
    try {
      console.log('Triggering email queue processing...');
      const { data: queueResult, error: queueError } = await supabase.functions.invoke('process-email-queue', {
        body: { immediate: true }
      });
      
      if (queueError) {
        console.error('Queue processing trigger error:', queueError);
      } else {
        console.log('Queue processing triggered successfully');
      }
    } catch (queueTriggerError) {
      console.error('Failed to trigger queue processing:', queueTriggerError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Mass email automation completed. Queued ${results.total_queued} emails.`,
      results,
      test_mode
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in mass email automation:", error);
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