import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SkillsMarketplaceItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  skill_category: string;
  price_txc: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export interface MicroGig {
  id: string;
  posted_by: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  estimated_hours: number;
  skills_required: string[];
  urgency_level: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export interface MentorshipSession {
  id: string;
  mentor_id: string;
  mentee_id?: string;
  title: string;
  description: string;
  expertise_areas: string[];
  session_type: 'one_time' | 'recurring' | 'package';
  duration_minutes: number;
  price_txc: number;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  mentor_profile?: {
    full_name: string;
    title?: string;
    profile_picture_url?: string;
  };
  mentee_profile?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export const useBusinessModels = () => {
  const [skills, setSkills] = useState<SkillsMarketplaceItem[]>([]);
  const [gigs, setGigs] = useState<MicroGig[]>([]);
  const [mentorshipSessions, setMentorshipSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch Skills Marketplace data
  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills_marketplace')
        .select(`
          *,
          profiles:user_id (
            full_name,
            profile_picture_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills marketplace",
        variant: "destructive"
      });
    }
  };

  // Fetch Micro Gigs data
  const fetchGigs = async () => {
    try {
      const { data, error } = await supabase
        .from('micro_gigs')
        .select(`
          *,
          profiles:posted_by (
            full_name,
            profile_picture_url
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGigs(data || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      toast({
        title: "Error",
        description: "Failed to load micro gigs",
        variant: "destructive"
      });
    }
  };

  // Fetch Mentorship Sessions data
  const fetchMentorshipSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select(`
          *,
          mentor_profile:mentor_id (
            full_name,
            title,
            profile_picture_url
          ),
          mentee_profile:mentee_id (
            full_name,
            profile_picture_url
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMentorshipSessions(data || []);
    } catch (error) {
      console.error('Error fetching mentorship sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load mentorship sessions",
        variant: "destructive"
      });
    }
  };

  // Create new skill listing
  const createSkill = async (skillData: Omit<SkillsMarketplaceItem, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
    try {
      const { data, error } = await supabase
        .from('skills_marketplace')
        .insert([skillData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Skill listing created successfully!"
      });
      
      fetchSkills(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error creating skill:', error);
      toast({
        title: "Error",
        description: "Failed to create skill listing",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Create new micro gig
  const createGig = async (gigData: Omit<MicroGig, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
    try {
      const { data, error } = await supabase
        .from('micro_gigs')
        .insert([gigData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Micro gig posted successfully!"
      });
      
      fetchGigs(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error creating gig:', error);
      toast({
        title: "Error",
        description: "Failed to post micro gig",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Create new mentorship session
  const createMentorshipSession = async (sessionData: Omit<MentorshipSession, 'id' | 'created_at' | 'updated_at' | 'mentor_profile' | 'mentee_profile'>) => {
    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Mentorship session created successfully!"
      });
      
      fetchMentorshipSessions(); // Refresh data
      return data;
    } catch (error) {
      console.error('Error creating mentorship session:', error);
      toast({
        title: "Error",
        description: "Failed to create mentorship session",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSkills(),
        fetchGigs(),
        fetchMentorshipSessions()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    skills,
    gigs,
    mentorshipSessions,
    loading,
    fetchSkills,
    fetchGigs,
    fetchMentorshipSessions,
    createSkill,
    createGig,
    createMentorshipSession
  };
};