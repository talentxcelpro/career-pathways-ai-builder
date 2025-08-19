import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CareerExperience {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  company_logo?: string;
  location?: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements: string[];
  skills_used: string[];
  tools_used: string[];
  created_at: string;
  updated_at: string;
}

export interface CareerEducation {
  id: string;
  user_id: string;
  institution_name: string;
  degree: string;
  field_of_study?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  gpa?: string;
  honors?: string;
  description?: string;
  activities: string[];
  coursework: string[];
  created_at: string;
  updated_at: string;
}

export interface CareerProject {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  project_type: 'personal' | 'professional' | 'academic' | 'open-source';
  technologies: string[];
  start_date?: string;
  end_date?: string;
  is_ongoing: boolean;
  project_url?: string;
  github_url?: string;
  demo_url?: string;
  role?: string;
  achievements: string[];
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CareerSkill {
  id: string;
  user_id: string;
  skill_name: string;
  skill_category: 'technical' | 'soft' | 'language' | 'tool' | 'framework';
  proficiency_level: number; // 1-5
  endorsements_count: number;
  is_verified: boolean;
  years_of_experience?: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerCertification {
  id: string;
  user_id: string;
  certification_name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  verification_status: 'verified' | 'pending' | 'expired' | 'revoked';
  description?: string;
  skills_gained: string[];
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CareerTestimonial {
  id: string;
  user_id: string;
  recommender_name: string;
  recommender_title?: string;
  recommender_company?: string;
  recommender_email?: string;
  recommender_linkedin?: string;
  relationship: string;
  testimonial_text: string;
  skills_endorsed: string[];
  is_public: boolean;
  is_verified: boolean;
  verification_token?: string;
  created_at: string;
  updated_at: string;
}

export interface SkillGapAnalysis {
  id: string;
  user_id: string;
  target_role: string;
  target_industry?: string;
  current_skills: string[];
  required_skills: string[];
  skill_gaps: string[];
  recommended_actions: any;
  competitiveness_score: number;
  last_analyzed: string;
  created_at: string;
  updated_at: string;
}

export function useCareerContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Experience
  const { data: experience, isLoading: experienceLoading } = useQuery({
    queryKey: ['career-experience', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_experience')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as CareerExperience[];
    },
    enabled: !!user?.id,
  });

  // Education
  const { data: education, isLoading: educationLoading } = useQuery({
    queryKey: ['career-education', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_education')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as CareerEducation[];
    },
    enabled: !!user?.id,
  });

  // Projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['career-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as CareerProject[];
    },
    enabled: !!user?.id,
  });

  // Skills
  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['career-skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('proficiency_level', { ascending: false });
      if (error) throw error;
      return data as CareerSkill[];
    },
    enabled: !!user?.id,
  });

  // Certifications
  const { data: certifications, isLoading: certificationsLoading } = useQuery({
    queryKey: ['career-certifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });
      if (error) throw error;
      return data as CareerCertification[];
    },
    enabled: !!user?.id,
  });

  // Testimonials
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['career-testimonials', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('career_testimonials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CareerTestimonial[];
    },
    enabled: !!user?.id,
  });

  // Skill Gap Analysis
  const { data: skillGapAnalysis, isLoading: skillGapLoading } = useQuery({
    queryKey: ['skill-gap-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('skill_gap_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('last_analyzed', { ascending: false });
      if (error) throw error;
      return data as SkillGapAnalysis[];
    },
    enabled: !!user?.id,
  });

  // Mutations
  const addExperience = useMutation({
    mutationFn: async (experience: Omit<CareerExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('career_experience')
        .insert([{ ...experience, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-experience', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const addEducation = useMutation({
    mutationFn: async (education: Omit<CareerEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('career_education')
        .insert([{ ...education, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-education', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const addProject = useMutation({
    mutationFn: async (project: Omit<CareerProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('career_projects')
        .insert([{ ...project, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-projects', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const addSkill = useMutation({
    mutationFn: async (skill: Omit<CareerSkill, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'endorsements_count' | 'is_verified'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('career_skills')
        .insert([{ ...skill, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-skills', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const addCertification = useMutation({
    mutationFn: async (certification: Omit<CareerCertification, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verification_status'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('career_certifications')
        .insert([{ ...certification, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-certifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const addTestimonial = useMutation({
    mutationFn: async (testimonial: Omit<CareerTestimonial, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'verification_token'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('career_testimonials')
        .insert([{ ...testimonial, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-testimonials', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['career-passport', user?.id] });
    }
  });

  const generateSkillGapAnalysis = useMutation({
    mutationFn: async (targetRole: string, targetIndustry?: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // This would typically call an AI service to analyze skill gaps
      // For now, we'll create a simple analysis
      const currentSkills = skills?.map(s => s.skill_name) || [];
      
      const { data, error } = await supabase
        .from('skill_gap_analysis')
        .insert([{
          user_id: user.id,
          target_role: targetRole,
          target_industry: targetIndustry,
          current_skills: currentSkills,
          required_skills: [], // Would be populated by AI
          skill_gaps: [], // Would be populated by AI
          recommended_actions: {},
          competitiveness_score: 50 // Would be calculated by AI
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-gap-analysis', user?.id] });
    }
  });

  return {
    // Data
    experience: experience || [],
    education: education || [],
    projects: projects || [],
    skills: skills || [],
    certifications: certifications || [],
    testimonials: testimonials || [],
    skillGapAnalysis: skillGapAnalysis || [],
    
    // Loading states
    isLoading: experienceLoading || educationLoading || projectsLoading || 
               skillsLoading || certificationsLoading || testimonialsLoading || skillGapLoading,
    
    // Mutations
    addExperience,
    addEducation,
    addProject,
    addSkill,
    addCertification,
    addTestimonial,
    generateSkillGapAnalysis,
    
    // Computed values
    getTotalExperience: () => {
      if (!experience?.length) return 0;
      return experience.reduce((total, exp) => {
        const start = new Date(exp.start_date);
        const end = exp.is_current ? new Date() : new Date(exp.end_date || exp.start_date);
        const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
      }, 0);
    },
    
    getSkillsByCategory: () => {
      if (!skills?.length) return {};
      return skills.reduce((acc, skill) => {
        if (!acc[skill.skill_category]) {
          acc[skill.skill_category] = [];
        }
        acc[skill.skill_category].push(skill);
        return acc;
      }, {} as Record<string, CareerSkill[]>);
    },
    
    getVerifiedCertifications: () => {
      return certifications?.filter(cert => cert.verification_status === 'verified') || [];
    },
    
    getPublicTestimonials: () => {
      return testimonials?.filter(testimonial => testimonial.is_public) || [];
    }
  };
}