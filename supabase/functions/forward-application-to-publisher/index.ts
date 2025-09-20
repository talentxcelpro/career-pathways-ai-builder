import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationForwardRequest {
  job_id: string;
  applicant_data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    location: string;
    expectedCTC: string;
    noticePeriod: string;
    resume_url?: string;
    coverLetterUrl?: string;
    [key: string]: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Application forwarding started...');
    
    const requestBody: ApplicationForwardRequest = await req.json();
    const { job_id, applicant_data } = requestBody;
    
    // Validate required fields
    if (!job_id || !applicant_data?.email || !applicant_data?.fullName) {
      throw new Error('Missing required fields: job_id, email, fullName');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get job details and publisher info
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        companies(name, email, contact_email)
      `)
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`);
    }

    // Check for duplicate applications in CV database
    const { data: existingApplication, error: duplicateError } = await supabase
      .from('job_applications')
      .select('id, created_at')
      .eq('job_id', job_id)
      .eq('application_data->>email', applicant_data.email)
      .maybeSingle();

    if (duplicateError) {
      console.error('Error checking duplicates:', duplicateError);
    }

    // Store in CV database for employer access
    const cvDatabaseEntry = {
      user_id: null, // Will be set by auth if user is logged in
      full_name: applicant_data.fullName,
      email: applicant_data.email,
      phone_number: applicant_data.phoneNumber,
      location: applicant_data.location,
      expected_ctc: applicant_data.expectedCTC,
      notice_period: applicant_data.noticePeriod,
      resume_url: applicant_data.resume_url,
      cover_letter_url: applicant_data.coverLetterUrl,
      source_job_id: job_id,
      source_job_title: job.title,
      source_company: job.company_name || job.companies?.name,
      application_data: applicant_data,
      is_duplicate: !!existingApplication,
      original_application_date: existingApplication?.created_at,
      created_at: new Date().toISOString()
    };

    // Insert into CV database (create table if it doesn't exist)
    const { error: cvInsertError } = await supabase
      .from('cv_database')
      .insert(cvDatabaseEntry);

    if (cvInsertError) {
      console.error('Error inserting into CV database:', cvInsertError);
      // Don't fail the entire process if CV database insert fails
    }

    // Determine publisher email
    let publisherEmail = null;
    if (job.companies?.email || job.companies?.contact_email) {
      publisherEmail = job.companies.email || job.companies.contact_email;
    } else if (job.external_url) {
      // For external jobs, try to extract domain and create a generic email
      const domain = job.external_url.match(/https?:\/\/(?:www\.)?([^\/]+)/)?.[1];
      if (domain) {
        publisherEmail = `hr@${domain}`;
      }
    }

    // Forward to publisher if email is available
    if (publisherEmail) {
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-application-notification', {
        body: {
          recipient_email: publisherEmail,
          user_name: applicant_data.fullName,
          job_title: job.title,
          company: job.company_name || job.companies?.name,
          applicant_name: applicant_data.fullName,
          application_link: `https://talentxcel.in/employer/cv-database?job_id=${job_id}`,
          job_id: job_id,
          template_name: 'publisher_application_notification'
        }
      });

      if (emailError) {
        console.error('Error sending notification to publisher:', emailError);
      } else {
        console.log('Application forwarded to publisher:', publisherEmail);
      }
    }

    // Update application count for the job
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ 
        applications_count: (job.applications_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', job_id);

    if (updateError) {
      console.error('Error updating job application count:', updateError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Application processed and forwarded successfully',
      data: {
        forwarded_to_publisher: !!publisherEmail,
        publisher_email: publisherEmail,
        is_duplicate: !!existingApplication,
        stored_in_cv_database: !cvInsertError,
        job_title: job.title,
        company: job.company_name || job.companies?.name
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in forward-application-to-publisher function:", error);
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