// Real-time course data service - replaces static course data
import { supabase } from '@/integrations/supabase/client';
import { validateProductionData, fetchProductionData } from '@/utils/productionCleanup';

export interface Course {
  id: string;
  title: string;
  instructor_name: string;
  rating: number;
  students: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: string;
  originalPrice?: string;
  category: string;
  subcategory: string;
  thumbnail: string;
  tags: string[];
  certified: boolean;
  trending?: boolean;
  description: string;
  whatYouLearn: string[];
  requirements: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseCategory {
  id: string;
  title: string;
  subcategories: string[];
}

// Real-time course data fetching
export const getCourses = async (): Promise<Course[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, []);
};

export const getCoursesByCategory = async (categoryId: string): Promise<Course[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('category', categoryId)
      .eq('is_active', true)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, []);
};

export const getFeaturedCourses = async (limit: number = 6): Promise<Course[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .or('trending.eq.true,rating.gte.4.7')
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }, []);
};

export const searchCourses = async (query: string): Promise<Course[]> => {
  if (!query.trim()) return [];
  
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,category.ilike.%${query}%,instructor_name.ilike.%${query}%`)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, []);
};

export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  return fetchProductionData(async () => {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*')
      .eq('is_active', true)
      .order('title');
    
    if (error) throw error;
    return data || [];
  }, []);
};

// Real-time subscription for course updates
export const subscribeToCourseUpdates = (callback: (courses: Course[]) => void) => {
  const channel = supabase
    .channel('courses-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'courses'
      },
      async () => {
        const courses = await getCourses();
        if (validateProductionData(courses, 'course updates')) {
          callback(courses);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};