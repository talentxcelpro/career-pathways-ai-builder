import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SkillVerification {
  id: string;
  user_id: string;
  skill_name: string;
  skill_category: string;
  proficiency_level: string;
  verification_status: string;
  verification_score: number;
  assessment_data: any;
  verified_by?: string;
  verified_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export const useSkillVerifications = () => {
  const [skills, setSkills] = useState<SkillVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSkillVerifications();
  }, []);

  const fetchSkillVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skill verifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch skill verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSkillVerification = async (skillData: Partial<SkillVerification>) => {
    try {
      const { data, error } = await supabase
        .from('skill_verifications')
        .insert([skillData])
        .select()
        .single();

      if (error) throw error;
      
      setSkills(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Skill verification created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating skill verification:', error);
      toast({
        title: "Error",
        description: "Failed to create skill verification",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSkillVerification = async (id: string, updates: Partial<SkillVerification>) => {
    try {
      const { data, error } = await supabase
        .from('skill_verifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSkills(prev => prev.map(skill => skill.id === id ? data : skill));
      toast({
        title: "Success",
        description: "Skill verification updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating skill verification:', error);
      toast({
        title: "Error",
        description: "Failed to update skill verification",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    skills,
    loading,
    fetchSkillVerifications,
    createSkillVerification,
    updateSkillVerification
  };
};