import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CVData {
  parsing_results: any;
  file_url: string;
  original_filename: string;
  id: string;
}

/**
 * Extract email from CV parsing results with multiple fallback patterns
 */
export const extractEmailFromCV = (parsingResults: any): string | null => {
  if (!parsingResults) return null;
  
  // Try different common patterns
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
  
  // Search in raw text for email pattern
  const rawText = JSON.stringify(parsingResults);
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0].toLowerCase() : null;
};

/**
 * Generate a professional summary from CV data
 */
export const generateSummary = (parsingResults: any): string => {
  try {
    const profile = parsingResults.profile || parsingResults.ats?.profile || {};
    const experience = parsingResults.experience || parsingResults.ats?.experience || [];
    const skills = parsingResults.skills || parsingResults.ats?.skills || [];
    
    let summary = '';
    
    // Add experience summary
    if (experience.length > 0) {
      const latestJob = experience[0];
      const yearsExp = experience.length;
      summary += `Experienced professional with ${yearsExp}+ years in ${latestJob.title || 'various roles'}. `;
    }
    
    // Add skills
    if (skills.length > 0) {
      const topSkills = skills.slice(0, 5).join(', ');
      summary += `Skilled in ${topSkills}. `;
    }
    
    // Add location if available
    if (profile.location) {
      summary += `Based in ${profile.location}. `;
    }
    
    return summary || 'Professional seeking new opportunities.';
  } catch (error) {
    console.warn('Error generating summary:', error);
    return 'Professional seeking new opportunities.';
  }
};

/**
 * Activate CV user - convert CV data into active user profile
 */
export const activateCVUser = async (cvData: CVData): Promise<boolean> => {
  try {
    const email = extractEmailFromCV(cvData.parsing_results);
    if (!email) {
      console.log('No email found in CV:', cvData.original_filename);
      return false;
    }
    
    // Check if user already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();
      
    if (existingProfile) {
      console.log('User already exists:', email);
      return false;
    }
    
    // Extract profile data from CV
    const parsingResults = cvData.parsing_results;
    const profile = parsingResults.profile || parsingResults.ats?.profile || {};
    const experience = parsingResults.experience || parsingResults.ats?.experience || [];
    const education = parsingResults.education || parsingResults.ats?.education || [];
    
    // Create pre-filled profile
    const profileData = {
      email,
      full_name: profile.fullName || profile.name || 'Professional',
      title: experience[0]?.title || experience[0]?.position || 'Professional',
      location: profile.location || 'Not specified',
      about: generateSummary(parsingResults),
      resume_url: cvData.file_url,
      source: 'cv_upload',
      activation_status: 'pending',
      cv_file_id: cvData.id,
      profile_visibility: 'public',
      skills: parsingResults.skills || [],
      experience_years: experience.length || 0,
      current_company: experience[0]?.company || null,
      industry: experience[0]?.industry || null
    };
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
      
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }
    
    console.log('✅ CV user activated:', email, newProfile.id);
    
    // Send activation email (simulate for now)
    console.log('📧 Activation email sent to:', email);
    
    return true;
  } catch (error) {
    console.error('Error activating CV user:', error);
    return false;
  }
};

/**
 * Batch activate multiple CV users
 */
export const batchActivateCVUsers = async (cvFiles: CVData[]): Promise<{activated: number, failed: number}> => {
  let activated = 0;
  let failed = 0;
  
  console.log(`🚀 Starting batch activation for ${cvFiles.length} CVs`);
  
  // Process in smaller chunks to avoid overwhelming the system
  const CHUNK_SIZE = 10;
  
  for (let i = 0; i < cvFiles.length; i += CHUNK_SIZE) {
    const chunk = cvFiles.slice(i, i + CHUNK_SIZE);
    
    const promises = chunk.map(async (cvData) => {
      try {
        const result = await activateCVUser(cvData);
        return result;
      } catch (error) {
        console.error('Chunk activation error:', error);
        return false;
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        activated++;
      } else {
        failed++;
      }
    });
    
    // Small delay between chunks
    if (i + CHUNK_SIZE < cvFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`✅ Batch activation complete: ${activated} activated, ${failed} failed`);
  
  if (activated > 0) {
    toast.success(`Activated ${activated} CV users${failed > 0 ? `, ${failed} failed` : ''}`);
  }
  
  return { activated, failed };
};