import { supabase } from '@/integrations/supabase/client';

export const collegeService = {
  getFilterOptions: async () => {
    try {
      const { data: colleges, error } = await supabase
        .from('colleges')
        .select('college_type, city, state')
        .eq('is_active', true);

      if (error) throw error;

      const college_types = [...new Set(colleges.map(c => c.college_type).filter(Boolean))];
      const cities = [...new Set(colleges.map(c => c.city).filter(Boolean))];
      const states = [...new Set(colleges.map(c => c.state).filter(Boolean))];

      return { college_types, cities, states, disciplines: [] };
    } catch (error) {
      return { college_types: [], cities: [], states: [], disciplines: [] };
    }
  },

  bookmarkCollege: async (collegeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('college_bookmarks')
      .insert([{ college_id: collegeId, user_id: user.id }]);

    if (error) throw error;
    return data;
  },

  removeBookmark: async (collegeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('college_bookmarks')
      .delete()
      .eq('college_id', collegeId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};