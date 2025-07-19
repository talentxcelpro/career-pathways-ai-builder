import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  ats_score: number;
  summary?: string | null;
  status?: 'draft' | 'completed' | 'archived';
  template_id: string;
  is_public: boolean;
  public_url_slug?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeSection {
  id: string;
  resume_id: string;
  section_type: 'personal_info' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'awards';
  content: any;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeWithSections extends Resume {
  sections: ResumeSection[];
}

export const useResumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<ResumeWithSections | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes((data || []) as Resume[]);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResume = async (id: string) => {
    setIsLoading(true);
    try {
      // Fetch resume
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (resumeError) throw resumeError;

      // Fetch sections
      const { data: sections, error: sectionsError } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('resume_id', id)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      const resumeWithSections: ResumeWithSections = {
        ...resume,
        sections: (sections || []) as ResumeSection[]
      };

      setCurrentResume(resumeWithSections);
      return resumeWithSections;
    } catch (error) {
      console.error('Error fetching resume:', error);
      toast({
        title: "Error",
        description: "Failed to load resume",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createResume = async (title: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Please log in to create a resume');

      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title,
          summary: null,
          status: 'draft' as const,
          template_id: 'modern',
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      // Create default sections
      const defaultSections = [
        { section_type: 'personal_info', content: {}, order_index: 0 },
        { section_type: 'summary', content: { content: '' }, order_index: 1 },
        { section_type: 'experience', content: { experiences: [] }, order_index: 2 },
        { section_type: 'education', content: { education: [] }, order_index: 3 },
        { section_type: 'skills', content: { skills: [] }, order_index: 4 },
        { section_type: 'projects', content: { projects: [] }, order_index: 5 },
        { section_type: 'certifications', content: { certifications: [] }, order_index: 6 }
      ];

      for (const section of defaultSections) {
        await supabase
          .from('resume_sections')
          .insert({
            resume_id: data.id,
            ...section
          });
      }

      // Create analytics record
      await supabase
        .from('resume_analytics')
        .insert({
          resume_id: data.id,
          view_count: 0,
          download_count: 0,
          share_count: 0
        });

      toast({
        title: "Resume created!",
        description: "Your new resume has been created successfully.",
      });

      await fetchResumes(); // Refresh list
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create resume';
      toast({
        title: "Creation failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateResume = async (id: string, updates: Partial<Resume>) => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setResumes(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
      if (currentResume?.id === id) {
        setCurrentResume(prev => prev ? { ...prev, ...data } : null);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update resume';
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSection = async (resumeId: string, sectionType: string, content: any) => {
    try {
      const { data, error } = await supabase
        .from('resume_sections')
        .update({ content })
        .eq('resume_id', resumeId)
        .eq('section_type', sectionType)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      if (currentResume?.id === resumeId) {
        setCurrentResume(prev => {
          if (!prev) return null;
          return {
            ...prev,
            sections: prev.sections.map(s => 
              s.section_type === sectionType ? { ...s, content } : s
            )
          };
        });
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update section';
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteResume = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResumes(prev => prev.filter(r => r.id !== id));
      if (currentResume?.id === id) {
        setCurrentResume(null);
      }

      toast({
        title: "Resume deleted",
        description: "Your resume has been deleted successfully.",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete resume';
      toast({
        title: "Deletion failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  return {
    resumes,
    currentResume,
    isLoading,
    fetchResumes,
    fetchResume,
    createResume,
    updateResume,
    updateSection,
    deleteResume
  };
};