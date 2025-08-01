import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SkillEnrichmentRequest {
  job_title: string;
  industry?: string;
  description?: string;
  experience_level?: string;
  employment_type?: string;
}

interface SkillEnrichmentResponse {
  success: boolean;
  skills: string[];
  rationale?: string;
  error?: string;
}

export const useSkillEnrichment = () => {
  return useMutation({
    mutationFn: async (data: SkillEnrichmentRequest): Promise<SkillEnrichmentResponse> => {
      console.log('🔄 Enriching skills for:', data);
      console.log('📡 Calling ai-skill-enricher function...');
      
      const { data: result, error } = await supabase.functions.invoke('ai-skill-enricher', {
        body: data
      });

      if (error) {
        console.error('❌ Skill enrichment error:', error);
        throw error;
      }

      console.log('✅ Skill enrichment result:', result);
      
      // Validation of the result
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from skill enricher');
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Skill enrichment failed');
      }
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          `Generated ${data.skills.length} relevant skills`,
          {
            description: data.rationale
          }
        );
      }
    },
    onError: (error) => {
      console.error('❌ Skill enrichment failed:', error);
      toast.error('Skill enrichment failed', {
        description: error.message || 'Failed to generate job-specific skills'
      });
    }
  });
};

// Utility function to get fallback skills based on job title patterns
export const getFallbackSkills = (jobTitle: string): string[] => {
  const title = jobTitle.toLowerCase();
  
  const skillMap: Record<string, string[]> = {
    // Tech roles
    'react': ['React.js', 'JavaScript', 'TypeScript', 'Redux', 'Node.js', 'HTML', 'CSS'],
    'frontend': ['JavaScript', 'HTML', 'CSS', 'React.js', 'Vue.js', 'TypeScript', 'Responsive Design'],
    'backend': ['Node.js', 'Python', 'Java', 'SQL', 'REST APIs', 'Database Design', 'Git'],
    'fullstack': ['JavaScript', 'React.js', 'Node.js', 'SQL', 'MongoDB', 'REST APIs', 'Git'],
    'devops': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Jenkins', 'Linux', 'Terraform'],
    'data': ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Tableau', 'Excel', 'Statistics'],
    
    // Business roles
    'sales': ['CRM Software', 'Cold Calling', 'Lead Generation', 'Negotiation', 'Salesforce', 'Pipeline Management'],
    'marketing': ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing', 'Social Media', 'Campaign Management'],
    'finance': ['Excel', 'Financial Analysis', 'Accounting', 'SAP', 'Financial Modeling', 'Budgeting'],
    'hr': ['HRIS', 'Recruitment', 'Performance Management', 'Employee Relations', 'Payroll', 'Compliance'],
    
    // Design roles
    'design': ['Figma', 'Adobe Creative Suite', 'Sketch', 'Prototyping', 'User Research', 'Wireframing'],
    'ui': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'Design Systems', 'User Interface Design'],
    'ux': ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Information Architecture', 'Figma'],
    
    // Management roles
    'manager': ['Team Leadership', 'Project Management', 'Strategic Planning', 'Budget Management', 'Performance Management', 'Stakeholder Management'],
    'project': ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Risk Management', 'Stakeholder Communication']
  };
  
  // Find matching skills based on keywords in job title
  for (const [keyword, skills] of Object.entries(skillMap)) {
    if (title.includes(keyword)) {
      return skills;
    }
  }
  
  // Generic fallback
  return ['Industry Knowledge', 'Analytical Skills', 'Problem Solving', 'Communication', 'Teamwork'];
};