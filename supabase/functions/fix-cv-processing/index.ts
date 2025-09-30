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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Starting CV processing fix...');
    
    // Get all pending CV files
    const { data: pendingCVs, error: fetchError } = await supabase
      .from('cv_files')
      .select('*')
      .eq('parsing_status', 'pending')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching pending CVs:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Found ${pendingCVs?.length || 0} pending CVs to process`);

    let processed = 0;
    let failed = 0;

    // Process each CV
    for (const cv of pendingCVs || []) {
      try {
        console.log(`🔄 Processing CV: ${cv.original_filename}`);
        
        // Update status to processing
        await supabase
          .from('cv_files')
          .update({ 
            parsing_status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', cv.id);

        // Call AI resume parser
        const { data: parseResult, error: parseError } = await supabase.functions.invoke('ai-resume-parser', {
          body: {
            fileUrl: cv.file_url,
            fileName: cv.original_filename,
            fileType: cv.file_type,
            cvFileId: cv.id
          }
        });

        if (parseError) {
          console.error(`❌ Parse error for ${cv.original_filename}:`, parseError);
          
          await supabase
            .from('cv_files')
            .update({ 
              parsing_status: 'error',
              parsing_error: parseError.message,
              updated_at: new Date().toISOString()
            })
            .eq('id', cv.id);
            
          failed++;
          continue;
        }

        // If parsing successful, create activation token and send email
        if (parseResult?.success && parseResult?.extractedData) {
          const email = extractEmailFromCV(parseResult.extractedData);
          
          if (email) {
            console.log(`📧 Creating activation for ${email}`);
            
            // Generate activation token
            const token = crypto.randomUUID();
            
            // Save activation token
            const { error: tokenError } = await supabase
              .from('user_activation_tokens')
              .insert({
                email,
                token,
                cv_file_id: cv.id
              });

            if (!tokenError) {
              // Queue activation email
              await supabase
                .from('email_queue')
                .insert({
                  to_email: email,
                  subject: '🎯 Activate Your TalentXcel Profile',
                  html_content: generateActivationEmail(email, token, parseResult.extractedData),
                  priority: 'high'
                });
            }
          }
        }

        processed++;
        console.log(`✅ Successfully processed: ${cv.original_filename}`);
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Failed to process CV ${cv.original_filename}:`, error);
        
        await supabase
          .from('cv_files')
          .update({ 
            parsing_status: 'error',
            parsing_error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', cv.id);
          
        failed++;
      }
    }

    console.log(`🎉 CV processing complete: ${processed} processed, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${processed} CVs, ${failed} failed`,
      stats: {
        total_pending: pendingCVs?.length || 0,
        processed,
        failed
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ CV processing fix error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function extractEmailFromCV(parsingResults: any): string | null {
  if (!parsingResults) return null;
  
  const patterns = [
    parsingResults.profile?.email,
    parsingResults.personalInfo?.email, 
    parsingResults.contact?.email,
    parsingResults.ats?.profile?.email
  ];
  
  for (const email of patterns) {
    if (email && typeof email === 'string' && email.includes('@')) {
      return email.trim().toLowerCase();
    }
  }
  
  const rawText = JSON.stringify(parsingResults);
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0].toLowerCase() : null;
}

function generateActivationEmail(email: string, token: string, cvData: any): string {
  const name = cvData?.profile?.fullName || cvData?.profile?.name || cvData?.ats?.profile?.fullName || 'Professional';
  const title = cvData?.experience?.[0]?.title || cvData?.ats?.experience?.[0]?.title || 'Professional';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Activate Your TalentXcel Profile</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb;">🎯 TalentXcel</h1>
            </div>
            
            <h2>Hi ${name}! 👋</h2>
            
            <p>Great news! We've found your CV and created a profile for you on TalentXcel - India's leading professional network.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Profile Preview:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('/auth/v1', '')}/activate?token=${token}" 
                   style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    🚀 Activate Your Profile
                </a>
            </div>
            
            <h3>What happens next?</h3>
            <ul>
                <li>✅ Access your personalized job recommendations</li>
                <li>🤝 Connect with top employers in India</li>
                <li>📈 Get AI-powered career insights</li>
                <li>💼 Apply to exclusive job opportunities</li>
            </ul>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                This activation link expires in 7 days. If you didn't expect this email, you can safely ignore it.
            </p>
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #666;">
                <p>© 2024 TalentXcel. Connecting talent with opportunity.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}