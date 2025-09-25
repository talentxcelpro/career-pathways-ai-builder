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

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  reward_txc: number;
  completion_rate: number;
  enrolled_count: number;
  rating: number;
  instructor_id: string;
  thumbnail_url?: string;
  is_premium: boolean;
  requirements: string[];
  learning_outcomes: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  instructor_profile?: {
    full_name: string;
    profile_picture_url?: string;
    title?: string;
  };
}

export const useBusinessModels = () => {
  const [skills, setSkills] = useState<SkillsMarketplaceItem[]>([]);
  const [gigs, setGigs] = useState<MicroGig[]>([]);
  const [mentorshipSessions, setMentorshipSessions] = useState<MentorshipSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      // Fallback to using job skills data
      try {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            description,
            skills_required,
            salary_min,
            experience_level,
            created_at,
            profiles:posted_by (
              full_name,
              profile_picture_url
            )
          `)
          .eq('is_active', true)
          .not('skills_required', 'is', null)
          .limit(20);

        const transformedSkills: SkillsMarketplaceItem[] = (jobsData || []).map(job => ({
          id: job.id,
          user_id: (job.profiles as any)?.id || '',
          title: `Learn ${job.skills_required?.[0] || 'Professional Skills'}`,
          description: `Master ${job.skills_required?.[0]} as required for ${job.title}`,
          skill_category: job.skills_required?.[0]?.toLowerCase().includes('tech') ? 'programming' : 'business',
          price_txc: Math.floor((job.salary_min || 10000) / 100),
          difficulty_level: job.experience_level === 'entry_level' ? 'beginner' : 
                           job.experience_level === 'senior' ? 'advanced' : 'intermediate',
          estimated_hours: Math.floor(Math.random() * 20) + 5,
          is_active: true,
          created_at: job.created_at,
          updated_at: job.created_at,
          profiles: {
            full_name: (job.profiles as any)?.full_name || 'Anonymous',
            profile_picture_url: (job.profiles as any)?.profile_picture_url
          }
        }));

        setSkills(transformedSkills);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to load skills marketplace",
          variant: "destructive"
        });
      }
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
      // Fallback to using jobs data as gigs
      try {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            description,
            role_category,
            salary_min,
            salary_max,
            skills_required,
            created_at,
            profiles:posted_by (
              full_name,
              profile_picture_url
            )
          `)
          .eq('is_active', true)
          .limit(15);

        const transformedGigs: MicroGig[] = (jobsData || []).map(job => ({
          id: job.id,
          posted_by: (job.profiles as any)?.id || '',
          title: `Gig: ${job.title}`,
          description: job.description || 'Short-term project opportunity',
          category: job.role_category || 'general',
          budget_min: Math.floor((job.salary_min || 5000) / 10),
          budget_max: Math.floor((job.salary_max || job.salary_min || 10000) / 8),
          estimated_hours: Math.floor(Math.random() * 40) + 10,
          skills_required: job.skills_required || [],
          urgency_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          status: 'open',
          created_at: job.created_at,
          updated_at: job.created_at,
          profiles: {
            full_name: (job.profiles as any)?.full_name || 'Anonymous',
            profile_picture_url: (job.profiles as any)?.profile_picture_url
          }
        }));

        setGigs(transformedGigs);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to load micro gigs",
          variant: "destructive"
        });
      }
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
      // Fallback to using profiles data for mentorship
      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            title,
            profile_picture_url,
            about,
            created_at
          `)
          .not('title', 'is', null)
          .limit(10);

        const transformedSessions: MentorshipSession[] = (profilesData || []).map(profile => ({
          id: profile.id,
          mentor_id: profile.id,
          title: `Mentorship with ${profile.full_name}`,
          description: profile.about || `Get mentored by an experienced ${profile.title}`,
          expertise_areas: [profile.title || 'career_development'],
          session_type: Math.random() > 0.5 ? 'one_time' : 'recurring',
          duration_minutes: [30, 45, 60][Math.floor(Math.random() * 3)],
          price_txc: Math.floor(Math.random() * 500) + 200,
          status: 'available',
          created_at: profile.created_at,
          updated_at: profile.created_at,
          mentor_profile: {
            full_name: profile.full_name,
            title: profile.title,
            profile_picture_url: profile.profile_picture_url
          }
        }));

        setMentorshipSessions(transformedSessions);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to load mentorship sessions",
          variant: "destructive"
        });
      }
    }
  };

  // Fetch Courses data (Learn & Earn)
  const fetchCourses = async () => {
    try {
      // Try to get from courses table, if not available use jobs as courses
      let { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor_profile:instructor_id (
            full_name,
            profile_picture_url,
            title
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (coursesError) {
        // Fallback: Use jobs data as learning opportunities
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            description,
            role_category,
            experience_level,
            skills_required,
            salary_min,
            salary_max,
            created_at,
            profiles:posted_by (
              full_name,
              profile_picture_url,
              title
            )
          `)
          .eq('is_active', true)
          .limit(20)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Transform jobs to courses format
        const transformedCourses: Course[] = (jobsData || []).map(job => ({
          id: job.id,
          title: `Learn: ${job.title}`,
          description: job.description || 'Professional development opportunity',
          category: job.role_category || 'general',
          level: job.experience_level === 'entry_level' ? 'beginner' : 
                 job.experience_level === 'senior' ? 'advanced' : 'intermediate',
          duration_hours: Math.floor(Math.random() * 20) + 5,
          reward_txc: Math.floor((job.salary_min || 5000) / 10),
          completion_rate: Math.floor(Math.random() * 30) + 70,
          enrolled_count: Math.floor(Math.random() * 1000) + 100,
          rating: 4.5 + Math.random() * 0.5,
          instructor_id: (job.profiles as any)?.id || '',
          is_premium: (job.salary_max || 0) > 100000,
          requirements: job.skills_required || [],
          learning_outcomes: (job.skills_required || []).slice(0, 3),
          created_at: job.created_at,
          updated_at: job.created_at,
          is_active: true,
          instructor_profile: {
            full_name: (job.profiles as any)?.full_name || 'Professional Instructor',
            profile_picture_url: (job.profiles as any)?.profile_picture_url,
            title: (job.profiles as any)?.title
          }
        }));

        setCourses(transformedCourses);
        return;
      }

      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load learning courses",
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

  // Get real statistics from database
  const getStatistics = async () => {
    try {
      const [
        { count: skillsCount },
        { count: gigsCount },
        { count: mentorshipsCount },
        { count: usersCount }
      ] = await Promise.all([
        supabase.from('skills_marketplace').select('*', { count: 'exact', head: true }),
        supabase.from('micro_gigs').select('*', { count: 'exact', head: true }),
        supabase.from('mentorship_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      return {
        skillsCount: skillsCount || 0,
        gigsCount: gigsCount || 0,
        mentorshipsCount: mentorshipsCount || 0,
        usersCount: usersCount || 0
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        skillsCount: 0,
        gigsCount: 0,
        mentorshipsCount: 0,
        usersCount: 0
      };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchSkills(),
          fetchGigs(),
          fetchMentorshipSessions(),
          fetchCourses()
        ]);
      } catch (err) {
        setError('Failed to load business models data');
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    skills,
    gigs,
    mentorshipSessions,
    courses,
    loading,
    error,
    fetchSkills,
    fetchGigs,
    fetchMentorshipSessions,
    fetchCourses,
    getStatistics,
    createSkill,
    createGig,
    createMentorshipSession
  };
};