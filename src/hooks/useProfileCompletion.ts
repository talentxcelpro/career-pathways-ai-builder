import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileCompletionSuggestion {
  field: string;
  label: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const [completionScore, setCompletionScore] = useState(0);
  const [suggestions, setSuggestions] = useState<ProfileCompletionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      checkProfileCompletion();
    }
  }, [user?.id]);

  const checkProfileCompletion = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const score = calculateCompletionScore(profile);
      const missingSuggestions = generateSuggestions(profile);

      setCompletionScore(score);
      setSuggestions(missingSuggestions);
    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionScore = (profile: any): number => {
    let score = 0;
    const totalFields = 12; // Total weighted fields

    // Essential fields (higher weight)
    if (profile.full_name) score += 2;
    if (profile.title) score += 2;
    if (profile.about) score += 2;
    if (profile.profile_picture_url) score += 1;

    // Career fields
    if (profile.career_goals && profile.career_goals.length > 0) score += 1;
    if (profile.career_interests && profile.career_interests.length > 0) score += 1;
    if (profile.career_stage) score += 1;

    // Professional fields
    if (profile.skills && profile.skills.length > 0) score += 1;
    if (profile.company) score += 1;
    if (profile.location) score += 1;
    if (profile.industry) score += 1;

    // Contact fields
    if (profile.linkedin_url) score += 1;

    return Math.round((score / totalFields) * 100);
  };

  const generateSuggestions = (profile: any): ProfileCompletionSuggestion[] => {
    const suggestions: ProfileCompletionSuggestion[] = [];

    if (!profile.title) {
      suggestions.push({
        field: 'title',
        label: 'Professional Title',
        description: 'Add your current job title to help others understand your role',
        priority: 'high',
        icon: 'briefcase'
      });
    }

    if (!profile.about || profile.about.length < 50) {
      suggestions.push({
        field: 'about',
        label: 'Professional Summary',
        description: 'Write a brief summary about yourself and your career aspirations',
        priority: 'high',
        icon: 'user'
      });
    }

    if (!profile.career_goals || profile.career_goals.length === 0) {
      suggestions.push({
        field: 'career_goals',
        label: 'Career Goals',
        description: 'Define your career aspirations to get better connections',
        priority: 'high',
        icon: 'target'
      });
    }

    if (!profile.career_interests || profile.career_interests.length === 0) {
      suggestions.push({
        field: 'career_interests',
        label: 'Professional Interests',
        description: 'Add your areas of professional interest',
        priority: 'medium',
        icon: 'heart'
      });
    }

    if (!profile.skills || profile.skills.length < 3) {
      suggestions.push({
        field: 'skills',
        label: 'Skills & Expertise',
        description: 'List your key skills to match with relevant professionals',
        priority: 'medium',
        icon: 'zap'
      });
    }

    if (!profile.company) {
      suggestions.push({
        field: 'company',
        label: 'Current Company',
        description: 'Add your current workplace for better networking',
        priority: 'medium',
        icon: 'building'
      });
    }

    if (!profile.location) {
      suggestions.push({
        field: 'location',
        label: 'Location',
        description: 'Add your location to connect with nearby professionals',
        priority: 'medium',
        icon: 'map-pin'
      });
    }

    if (!profile.profile_picture_url) {
      suggestions.push({
        field: 'profile_picture',
        label: 'Profile Picture',
        description: 'Add a professional photo to make a great first impression',
        priority: 'low',
        icon: 'camera'
      });
    }

    if (!profile.linkedin_url) {
      suggestions.push({
        field: 'linkedin_url',
        label: 'LinkedIn Profile',
        description: 'Link your LinkedIn profile for extended networking',
        priority: 'low',
        icon: 'linkedin'
      });
    }

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  return {
    completionScore,
    suggestions,
    isLoading,
    refreshCompletion: checkProfileCompletion
  };
};