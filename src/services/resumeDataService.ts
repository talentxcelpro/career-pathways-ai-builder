import { supabase } from "@/integrations/supabase/client";

export interface ExtractedResumeData {
  personal_information: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_url?: string;
    professional_summary: string;
  };
  work_experience: Array<{
    job_title: string;
    company_name: string;
    location: string;
    start_date: string;
    end_date: string;
    responsibilities: string[];
    key_achievements: string[];
    technologies_used: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    start_date: string;
    end_date: string;
    gpa?: string;
    honors?: string;
    relevant_coursework: string[];
  }>;
  skills: {
    technical_skills: string[];
    programming_languages: string[];
    tools_software: string[];
    soft_skills: string[];
    languages_spoken: string[];
  };
  projects: Array<{
    project_name: string;
    description: string;
    technologies_used: string[];
    start_date?: string;
    end_date?: string;
    project_url?: string;
    github_url?: string;
    key_achievements: string[];
  }>;
  certifications: Array<{
    certification_name: string;
    issuing_organization: string;
    issue_date: string;
    expiry_date?: string;
    credential_id?: string;
    credential_url?: string;
  }>;
  awards: Array<{
    award_name: string;
    issuing_organization: string;
    date_received: string;
    description: string;
  }>;
  volunteer_experience: Array<{
    organization: string;
    role: string;
    start_date: string;
    end_date: string;
    description: string;
  }>;
  publications: Array<{
    title: string;
    publisher: string;
    publication_date: string;
    url?: string;
    description: string;
  }>;
  interests: string[];
  references: Array<{
    reference_name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
}

export class ResumeDataService {
  static async saveExtractedData(
    userId: string, 
    data: ExtractedResumeData,
    confidenceScore: number,
    filename: string
  ): Promise<void> {
    console.log('Saving extracted resume data to normalized tables...');

    try {
      // 1. Save personal information
      if (data.personal_information) {
        const { error: profileError } = await supabase
          .from('users_profile')
          .upsert({
            user_id: userId,
            full_name: data.personal_information.full_name,
            email: data.personal_information.email,
            phone: data.personal_information.phone,
            location: data.personal_information.location,
            linkedin_url: data.personal_information.linkedin_url,
            professional_summary: data.personal_information.professional_summary,
          });

        if (profileError) {
          console.error('Error saving profile:', profileError);
          throw profileError;
        }
      }

      // 2. Save work experience
      if (data.work_experience?.length > 0) {
        // Clear existing work experience
        await supabase
          .from('work_experience')
          .delete()
          .eq('user_id', userId);

        const { error: workError } = await supabase
          .from('work_experience')
          .insert(
            data.work_experience.map(exp => ({
              user_id: userId,
              job_title: exp.job_title,
              company_name: exp.company_name,
              location: exp.location,
              start_date: exp.start_date,
              end_date: exp.end_date,
              responsibilities: exp.responsibilities,
              key_achievements: exp.key_achievements,
              technologies_used: exp.technologies_used,
            }))
          );

        if (workError) {
          console.error('Error saving work experience:', workError);
          throw workError;
        }
      }

      // 3. Save education
      if (data.education?.length > 0) {
        // Clear existing education
        await supabase
          .from('education')
          .delete()
          .eq('user_id', userId);

        const { error: eduError } = await supabase
          .from('education')
          .insert(
            data.education.map(edu => ({
              user_id: userId,
              degree: edu.degree,
              institution: edu.institution,
              location: edu.location,
              start_date: edu.start_date,
              end_date: edu.end_date,
              gpa: edu.gpa,
              honors: edu.honors,
              relevant_coursework: edu.relevant_coursework,
            }))
          );

        if (eduError) {
          console.error('Error saving education:', eduError);
          throw eduError;
        }
      }

      // 4. Save skills
      if (data.skills) {
        const { error: skillsError } = await supabase
          .from('skills')
          .upsert({
            user_id: userId,
            technical_skills: data.skills.technical_skills,
            programming_languages: data.skills.programming_languages,
            tools_software: data.skills.tools_software,
            soft_skills: data.skills.soft_skills,
            languages_spoken: data.skills.languages_spoken,
          });

        if (skillsError) {
          console.error('Error saving skills:', skillsError);
          throw skillsError;
        }
      }

      // 5. Save projects
      if (data.projects?.length > 0) {
        // Clear existing projects
        await supabase
          .from('projects')
          .delete()
          .eq('user_id', userId);

        const { error: projectsError } = await supabase
          .from('projects')
          .insert(
            data.projects.map(project => ({
              user_id: userId,
              project_name: project.project_name,
              description: project.description,
              technologies_used: project.technologies_used,
              start_date: project.start_date,
              end_date: project.end_date,
              project_url: project.project_url,
              github_url: project.github_url,
              key_achievements: project.key_achievements,
            }))
          );

        if (projectsError) {
          console.error('Error saving projects:', projectsError);
          throw projectsError;
        }
      }

      // 6. Save certifications
      if (data.certifications?.length > 0) {
        // Clear existing certifications
        await supabase
          .from('certifications')
          .delete()
          .eq('user_id', userId);

        const { error: certsError } = await supabase
          .from('certifications')
          .insert(
            data.certifications.map(cert => ({
              user_id: userId,
              certification_name: cert.certification_name,
              issuing_organization: cert.issuing_organization,
              issue_date: cert.issue_date,
              expiry_date: cert.expiry_date,
              credential_id: cert.credential_id,
              credential_url: cert.credential_url,
            }))
          );

        if (certsError) {
          console.error('Error saving certifications:', certsError);
          throw certsError;
        }
      }

      // 7. Save awards
      if (data.awards?.length > 0) {
        // Clear existing awards
        await supabase
          .from('awards')
          .delete()
          .eq('user_id', userId);

        const { error: awardsError } = await supabase
          .from('awards')
          .insert(
            data.awards.map(award => ({
              user_id: userId,
              award_name: award.award_name,
              issuing_organization: award.issuing_organization,
              date_received: award.date_received,
              description: award.description,
            }))
          );

        if (awardsError) {
          console.error('Error saving awards:', awardsError);
          throw awardsError;
        }
      }

      // 8. Save volunteer experience
      if (data.volunteer_experience?.length > 0) {
        // Clear existing volunteer experience
        await supabase
          .from('volunteer_experience')
          .delete()
          .eq('user_id', userId);

        const { error: volunteerError } = await supabase
          .from('volunteer_experience')
          .insert(
            data.volunteer_experience.map(vol => ({
              user_id: userId,
              organization: vol.organization,
              role: vol.role,
              start_date: vol.start_date,
              end_date: vol.end_date,
              description: vol.description,
            }))
          );

        if (volunteerError) {
          console.error('Error saving volunteer experience:', volunteerError);
          throw volunteerError;
        }
      }

      // 9. Save publications
      if (data.publications?.length > 0) {
        // Clear existing publications
        await supabase
          .from('publications')
          .delete()
          .eq('user_id', userId);

        const { error: pubsError } = await supabase
          .from('publications')
          .insert(
            data.publications.map(pub => ({
              user_id: userId,
              title: pub.title,
              publisher: pub.publisher,
              publication_date: pub.publication_date,
              url: pub.url,
              description: pub.description,
            }))
          );

        if (pubsError) {
          console.error('Error saving publications:', pubsError);
          throw pubsError;
        }
      }

      // 10. Save interests
      if (data.interests?.length > 0) {
        const { error: interestsError } = await supabase
          .from('interests')
          .upsert({
            user_id: userId,
            interest_list: data.interests,
          });

        if (interestsError) {
          console.error('Error saving interests:', interestsError);
          throw interestsError;
        }
      }

      // 11. Save references
      if (data.references?.length > 0) {
        // Clear existing references
        await supabase
          .from('references')
          .delete()
          .eq('user_id', userId);

        const { error: refsError } = await supabase
          .from('references')
          .insert(
            data.references.map(ref => ({
              user_id: userId,
              reference_name: ref.reference_name,
              title: ref.title,
              company: ref.company,
              email: ref.email,
              phone: ref.phone,
              relationship: ref.relationship,
            }))
          );

        if (refsError) {
          console.error('Error saving references:', refsError);
          throw refsError;
        }
      }

      // 12. Log successful upload
      const { error: logError } = await supabase
        .from('resume_upload_logs')
        .insert({
          user_id: userId,
          filename: filename,
          extraction_status: 'completed',
          confidence_score: confidenceScore,
          processing_time_ms: Date.now(),
        });

      if (logError) {
        console.error('Error logging upload:', logError);
        // Don't throw here - log error shouldn't fail the entire process
      }

      console.log('Successfully saved all resume data to normalized tables');

    } catch (error) {
      console.error('Failed to save resume data:', error);
      
      // Log failed upload
      await supabase
        .from('resume_upload_logs')
        .insert({
          user_id: userId,
          filename: filename,
          extraction_status: 'failed',
          error_message: error.message,
          processing_time_ms: Date.now(),
        });

      throw error;
    }
  }

  static async loadUserResumeData(userId: string): Promise<ExtractedResumeData | null> {
    console.log('Loading user resume data from normalized tables...');

    try {
      // Load all sections in parallel
      const [
        { data: profile },
        { data: workExperience },
        { data: education },
        { data: skills },
        { data: projects },
        { data: certifications },
        { data: awards },
        { data: volunteerExperience },
        { data: publications },
        { data: interests },
        { data: references }
      ] = await Promise.all([
        supabase.from('users_profile').select('*').eq('user_id', userId).single(),
        supabase.from('work_experience').select('*').eq('user_id', userId),
        supabase.from('education').select('*').eq('user_id', userId),
        supabase.from('skills').select('*').eq('user_id', userId).single(),
        supabase.from('projects').select('*').eq('user_id', userId),
        supabase.from('certifications').select('*').eq('user_id', userId),
        supabase.from('awards').select('*').eq('user_id', userId),
        supabase.from('volunteer_experience').select('*').eq('user_id', userId),
        supabase.from('publications').select('*').eq('user_id', userId),
        supabase.from('interests').select('*').eq('user_id', userId).single(),
        supabase.from('references').select('*').eq('user_id', userId)
      ]);

      if (!profile) {
        return null;
      }

      const resumeData: ExtractedResumeData = {
        personal_information: {
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          linkedin_url: profile.linkedin_url || '',
          professional_summary: profile.professional_summary || '',
        },
        work_experience: workExperience?.map(exp => ({
          job_title: exp.job_title,
          company_name: exp.company_name,
          location: exp.location || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          responsibilities: exp.responsibilities || [],
          key_achievements: exp.key_achievements || [],
          technologies_used: exp.technologies_used || [],
        })) || [],
        education: education?.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location || '',
          start_date: edu.start_date || '',
          end_date: edu.end_date || '',
          gpa: edu.gpa || '',
          honors: edu.honors || '',
          relevant_coursework: edu.relevant_coursework || [],
        })) || [],
        skills: {
          technical_skills: skills?.technical_skills || [],
          programming_languages: skills?.programming_languages || [],
          tools_software: skills?.tools_software || [],
          soft_skills: skills?.soft_skills || [],
          languages_spoken: skills?.languages_spoken || [],
        },
        projects: projects?.map(proj => ({
          project_name: proj.project_name,
          description: proj.description || '',
          technologies_used: proj.technologies_used || [],
          start_date: proj.start_date || '',
          end_date: proj.end_date || '',
          project_url: proj.project_url || '',
          github_url: proj.github_url || '',
          key_achievements: proj.key_achievements || [],
        })) || [],
        certifications: certifications?.map(cert => ({
          certification_name: cert.certification_name,
          issuing_organization: cert.issuing_organization,
          issue_date: cert.issue_date || '',
          expiry_date: cert.expiry_date || '',
          credential_id: cert.credential_id || '',
          credential_url: cert.credential_url || '',
        })) || [],
        awards: awards?.map(award => ({
          award_name: award.award_name,
          issuing_organization: award.issuing_organization,
          date_received: award.date_received || '',
          description: award.description || '',
        })) || [],
        volunteer_experience: volunteerExperience?.map(vol => ({
          organization: vol.organization,
          role: vol.role,
          start_date: vol.start_date || '',
          end_date: vol.end_date || '',
          description: vol.description || '',
        })) || [],
        publications: publications?.map(pub => ({
          title: pub.title,
          publisher: pub.publisher || '',
          publication_date: pub.publication_date || '',
          url: pub.url || '',
          description: pub.description || '',
        })) || [],
        interests: interests?.interest_list || [],
        references: references?.map(ref => ({
          reference_name: ref.reference_name,
          title: ref.title || '',
          company: ref.company || '',
          email: ref.email || '',
          phone: ref.phone || '',
          relationship: ref.relationship || '',
        })) || [],
      };

      return resumeData;

    } catch (error) {
      console.error('Failed to load resume data:', error);
      return null;
    }
  }
}