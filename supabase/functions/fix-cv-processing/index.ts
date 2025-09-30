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
    console.log('🔧 Starting comprehensive CV processing...');
    
    // Parse request body to check for specific CV ID
    const body = await req.text();
    let requestData = {};
    
    if (body && body.trim()) {
      try {
        requestData = JSON.parse(body);
      } catch (e) {
        console.log('Could not parse request body, proceeding with all error CVs');
      }
    }

    // Get CVs that need reprocessing (both pending and error status)
    let query = supabase
      .from('cv_files')
      .select('*');

    if (requestData.cvId) {
      // Process specific CV if ID provided
      query = query.eq('id', requestData.cvId);
      console.log(`🎯 Processing specific CV: ${requestData.cvId}`);
    } else {
      // Process all error and pending CVs that can be reprocessed
      query = query.in('parsing_status', ['pending', 'error'])
        .order('created_at', { ascending: true });
      console.log('🔄 Processing all error and pending CVs');
    }

    const { data: pendingCVs, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching pending CVs:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Found ${pendingCVs?.length || 0} CVs to reprocess (error + pending status)`);

    let processed = 0;
    let failed = 0;
    let profilesCreated = 0;

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

        // Check if already parsed and has valid data
        let extractedData = cv.parsing_results;
        
        // Re-parse if no data or if CV was in error status (always reprocess error CVs)
        if (!extractedData || cv.parsing_status === 'error') {
          console.log(`🤖 Parsing CV with AI: ${cv.original_filename}`);
          
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

          extractedData = parseResult?.extractedData;
        }

        // If we have extracted data, create profile
        if (extractedData) {
          const email = extractEmailFromCV(extractedData);
          const fullName = extractNameFromCV(extractedData);
          
          if (email && fullName) {
            console.log(`👤 Creating profile for ${email}`);
            
            // Check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .single();

            if (!existingProfile) {
              // Create new profile
              const profileData = {
                id: crypto.randomUUID(),
                email: email,
                full_name: fullName,
                title: extractTitleFromCV(extractedData),
                location: extractLocationFromCV(extractedData),
                about: extractAboutFromCV(extractedData),
                skills: extractSkillsFromCV(extractedData),
                experience_years: extractExperienceYearsFromCV(extractedData),
                current_company: extractCurrentCompanyFromCV(extractedData),
                industry: extractIndustryFromCV(extractedData),
                resume_url: cv.file_url,
                activation_status: 'pending',
                cv_file_id: cv.id,
                created_at: new Date().toISOString()
              };

              const { data: newProfile, error: profileError } = await supabase
                .from('profiles')
                .insert(profileData)
                .select()
                .single();

              if (profileError) {
                console.error(`❌ Profile creation error for ${email}:`, profileError);
              } else {
                console.log(`✅ Profile created for ${email}`);
                profilesCreated++;

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
                      html_content: generateActivationEmail(email, token, extractedData, fullName),
                      priority: 'high'
                    });
                  
                  console.log(`📧 Activation email queued for ${email}`);
                }

                // Update CV file with user reference AND update profile with cv_file_id
                await supabase
                  .from('cv_files')
                  .update({
                    user_id: newProfile.id,
                    parsing_status: 'completed',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', cv.id);

                // Also update the profile to link back to CV file
                await supabase
                  .from('profiles')
                  .update({
                    cv_file_id: cv.id,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', newProfile.id);
              }
            } else {
              console.log(`👤 Profile already exists for ${email}`);
              
              // Update CV file status AND link profile to CV
              await supabase
                .from('cv_files')
                .update({
                  user_id: existingProfile.id,
                  parsing_status: 'completed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', cv.id);

              // Also update the profile to link back to CV file if not already linked
              const { data: profileCheck } = await supabase
                .from('profiles')
                .select('cv_file_id')
                .eq('id', existingProfile.id)
                .single();

              if (!profileCheck?.cv_file_id) {
                await supabase
                  .from('profiles')
                  .update({
                    cv_file_id: cv.id,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', existingProfile.id);
              }
            }
          } else {
            console.error(`❌ Missing email or name for ${cv.original_filename}`);
            
            await supabase
              .from('cv_files')
              .update({ 
                parsing_status: 'error',
                parsing_error: 'Could not extract email or name from CV',
                updated_at: new Date().toISOString()
              })
              .eq('id', cv.id);
              
            failed++;
            continue;
          }
        } else {
          console.error(`❌ No extracted data for ${cv.original_filename}`);
          
          await supabase
            .from('cv_files')
            .update({ 
              parsing_status: 'error',
              parsing_error: 'No data could be extracted from CV',
              updated_at: new Date().toISOString()
            })
            .eq('id', cv.id);
            
          failed++;
          continue;
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

    console.log(`🎉 CV processing complete: ${processed} processed, ${failed} failed, ${profilesCreated} profiles created`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully processed ${processed} CVs, ${failed} failed, ${profilesCreated} new profiles created`,
      stats: {
        total_pending: pendingCVs?.length || 0,
        processed,
        failed,
        profilesCreated
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
    parsingResults.ats?.profile?.email,
    parsingResults.contactInfo?.email,
    parsingResults.basic_info?.email
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

function extractNameFromCV(parsingResults: any): string | null {
  if (!parsingResults) return null;
  
  const patterns = [
    parsingResults.profile?.fullName,
    parsingResults.profile?.name,
    parsingResults.personalInfo?.name,
    parsingResults.personalInfo?.fullName,
    parsingResults.ats?.profile?.fullName,
    parsingResults.ats?.profile?.name,
    parsingResults.contactInfo?.name,
    parsingResults.basic_info?.name,
    parsingResults.basic_info?.fullName
  ];
  
  for (const name of patterns) {
    if (name && typeof name === 'string' && name.trim().length > 0) {
      return name.trim();
    }
  }
  
  return null;
}

function extractTitleFromCV(parsingResults: any): string | null {
  if (!parsingResults) return null;
  
  const patterns = [
    parsingResults.profile?.title,
    parsingResults.profile?.headline,
    parsingResults.personalInfo?.title,
    parsingResults.experience?.[0]?.title,
    parsingResults.ats?.experience?.[0]?.title,
    parsingResults.workExperience?.[0]?.title,
    parsingResults.jobs?.[0]?.title
  ];
  
  for (const title of patterns) {
    if (title && typeof title === 'string' && title.trim().length > 0) {
      return title.trim();
    }
  }
  
  return 'Professional';
}

function extractLocationFromCV(parsingResults: any): string | null {
  if (!parsingResults) return null;
  
  const patterns = [
    parsingResults.profile?.location,
    parsingResults.personalInfo?.location,
    parsingResults.contactInfo?.location,
    parsingResults.basic_info?.location,
    parsingResults.ats?.profile?.location
  ];
  
  for (const location of patterns) {
    if (location && typeof location === 'string' && location.trim().length > 0) {
      return location.trim();
    }
  }
  
  return null;
}

function extractAboutFromCV(parsingResults: any): string | null {
  if (!parsingResults) return null;
  
  const patterns = [
    parsingResults.profile?.summary,
    parsingResults.profile?.about,
    parsingResults.summary,
    parsingResults.objective,
    parsingResults.ats?.profile?.summary
  ];
  
  for (const about of patterns) {
    if (about && typeof about === 'string' && about.trim().length > 0) {
      return about.trim();
    }
  }
  
  return null;
}

function extractSkillsFromCV(parsingResults: any): string[] {
  if (!parsingResults) return [];
  
  const skillsArrays = [
    parsingResults.skills,
    parsingResults.technicalSkills,
    parsingResults.ats?.skills,
    parsingResults.keySkills
  ];
  
  let allSkills: string[] = [];
  
  for (const skillsData of skillsArrays) {
    if (Array.isArray(skillsData)) {
      allSkills = allSkills.concat(skillsData.filter(skill => 
        typeof skill === 'string' && skill.trim().length > 0
      ));
    }
  }
  
  // Remove duplicates and return first 10
  return [...new Set(allSkills)].slice(0, 10);
}

function extractExperienceYearsFromCV(parsingResults: any): number {
  if (!parsingResults) return 0;
  
  const experience = parsingResults.experience || parsingResults.workExperience || parsingResults.ats?.experience || [];
  
  if (Array.isArray(experience) && experience.length > 0) {
    // Simple calculation based on number of jobs
    return Math.min(experience.length * 2, 15); // Cap at 15 years
  }
  
  return 0;
}

function extractCurrentCompanyFromCV(parsingResults: any): string | null {
  if (!parsingResults) return null;
  
  const experience = parsingResults.experience || parsingResults.workExperience || parsingResults.ats?.experience || [];
  
  if (Array.isArray(experience) && experience.length > 0) {
    const currentJob = experience[0];
    if (currentJob?.company && typeof currentJob.company === 'string') {
      return currentJob.company.trim();
    }
  }
  
  return null;
}

function extractIndustryFromCV(parsingResults: any): string | null {
  // This could be enhanced with industry detection logic
  const currentCompany = extractCurrentCompanyFromCV(parsingResults);
  if (currentCompany) {
    // Simple industry mapping - can be enhanced
    if (currentCompany.toLowerCase().includes('tech') || currentCompany.toLowerCase().includes('software')) {
      return 'Technology';
    }
  }
  return null;
}

function generateActivationEmail(email: string, token: string, cvData: any, fullName: string): string {
  const title = extractTitleFromCV(cvData) || 'Professional';
  const location = extractLocationFromCV(cvData) || 'India';
  
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
            
            <h2>Hi ${fullName}! 👋</h2>
            
            <p>Great news! We've found your CV and created a professional profile for you on TalentXcel - India's leading career platform.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Profile Preview:</h3>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://talentxcel.in/activate?token=${token}" 
                   style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    🚀 Activate Your Profile
                </a>
            </div>
            
            <h3>What happens when you activate?</h3>
            <ul>
                <li>✅ Access your personalized job recommendations</li>
                <li>🤝 Connect with top employers across India</li>
                <li>📈 Get AI-powered career insights and growth tips</li>
                <li>💼 Apply to exclusive job opportunities</li>
                <li>🎯 Build your professional network</li>
            </ul>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                This activation link expires in 7 days. If you didn't expect this email, you can safely ignore it.
            </p>
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center; color: #666;">
                <p>© 2024 TalentXcel. Connecting talent with opportunity across India.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}