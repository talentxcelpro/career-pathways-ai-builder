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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Fix Email Automation function started...');
    const { action } = await req.json();
    
    let result = {
      success: false,
      message: 'Unknown action',
      reset_count: 0,
      processed: 0,
      failed: 0,
      total_pending: 0,
      error: ''
    };

    if (action === 'fix_all') {
      console.log('📧 Starting comprehensive email fix...');
      
      // Step 1: Reset failed emails in email_automation_queue to pending
      let resetCount = 0;
      try {
        const { data: queueResetData, error: queueResetError } = await supabase
          .from('email_automation_queue')
          .update({ 
            status: 'pending', 
            attempts: 0, 
            error_message: null,
            processed_at: null 
          })
          .eq('status', 'failed')
          .select('id');

        if (queueResetError) {
          console.warn('Queue reset error (table may not exist):', queueResetError);
        } else {
          resetCount += queueResetData?.length || 0;
          console.log(`✅ Reset ${queueResetData?.length || 0} failed emails in automation queue`);
        }
      } catch (error) {
        console.log('Email automation queue table does not exist, skipping...');
      }

      // Step 2: Reset failed emails in email_delivery_log 
      try {
        const { data: deliveryResetData, error: deliveryResetError } = await supabase
          .from('email_delivery_log')
          .update({ 
            status: 'queued', 
            retry_count: 0, 
            error_message: null 
          })
          .in('status', ['failed', 'bounced'])
          .select('id');

        if (deliveryResetError) {
          console.warn('Delivery log reset error (table may not exist):', deliveryResetError);
        } else {
          resetCount += deliveryResetData?.length || 0;
          console.log(`✅ Reset ${deliveryResetData?.length || 0} failed emails in delivery log`);
        }
      } catch (error) {
        console.log('Email delivery log table does not exist, skipping...');
      }

      // Step 3: Process the email queue by calling process-email-queue function
      let processed = 0;
      let failed = 0;
      let totalPending = 0;

      try {
        console.log('📬 Triggering email queue processing...');
        const { data: processData, error: processError } = await supabase.functions.invoke('process-email-queue', {
          body: { 
            manual_trigger: true,
            reset_triggered: true 
          }
        });

        if (processError) {
          console.error('Error calling process-email-queue:', processError);
          throw processError;
        }

        processed = processData?.processed || 0;
        failed = processData?.failed || 0;
        totalPending = processData?.total_pending || 0;
        
        console.log(`📊 Processing result: ${processed} processed, ${failed} failed, ${totalPending} pending`);

      } catch (error) {
        console.error('Error processing email queue:', error);
        failed = resetCount; // Assume all reset emails failed to process
      }

      // Step 4: Get updated statistics
      try {
        const { data: pendingEmails, error: pendingError } = await supabase
          .from('email_automation_queue')
          .select('id', { count: 'exact' })
          .eq('status', 'pending');

        if (!pendingError && pendingEmails) {
          totalPending = pendingEmails.length;
        }
      } catch (error) {
        console.log('Could not get pending count, table may not exist');
      }

      result = {
        success: resetCount > 0 || processed > 0,
        message: resetCount > 0 
          ? `Successfully reset ${resetCount} failed emails and processed ${processed} emails`
          : processed > 0 
            ? `No failed emails to reset, but processed ${processed} pending emails`
            : 'No failed or pending emails found',
        reset_count: resetCount,
        processed: processed,
        failed: failed,
        total_pending: totalPending,
        error: ''
      };

      console.log('✅ Email fix completed:', result);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in fix-email-automation function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Email fix failed',
        reset_count: 0,
        processed: 0,
        failed: 0,
        total_pending: 0,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);