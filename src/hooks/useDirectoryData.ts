import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  tagline?: string;
  founded_year?: number;
  size?: string;
  industries?: string[];
  culture?: string;
  benefits?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  established_year?: number;
  college_type: string;
  affiliation?: string;
  ranking?: number;
  accreditation?: string[];
  facilities?: string[];
  admission_process?: string;
  fees_structure?: string;
  scholarships?: string[];
  placement_stats?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useCompanies = (searchTerm: string = '', industry: string = '') => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm, industry]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('companies')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (industry) {
        query = query.contains('industries', [industry]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { companies, loading, refetch: fetchCompanies };
};

export const useColleges = (searchTerm: string = '', type: string = '') => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchColleges();
  }, [searchTerm, type]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('colleges')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (type) {
        query = query.eq('college_type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast({
        title: "Error",
        description: "Failed to load colleges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { colleges, loading, refetch: fetchColleges };
};

export const useBookmarks = (type: 'company' | 'college') => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookmarks();
  }, [type]);

  const fetchBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const table = type === 'company' ? 'company_bookmarks' : 'college_bookmarks';
      const slugField = type === 'company' ? 'company_slug' : 'college_slug';

      const { data, error } = await supabase
        .from(table)
        .select(slugField)
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(data?.map(item => item[slugField]) || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (slug: string, name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to bookmark items",
          variant: "destructive",
        });
        return;
      }

      const table = type === 'company' ? 'company_bookmarks' : 'college_bookmarks';
      const slugField = type === 'company' ? 'company_slug' : 'college_slug';
      const nameField = type === 'company' ? 'company_name' : 'college_name';

      const isBookmarked = bookmarks.includes(slug);

      if (isBookmarked) {
        await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id)
          .eq(slugField, slug);
        
        setBookmarks(prev => prev.filter(b => b !== slug));
        toast({
          title: "Bookmark Removed",
          description: `${type === 'company' ? 'Company' : 'College'} removed from your bookmarks`,
        });
      } else {
        await supabase
          .from(table)
          .insert({
            user_id: user.id,
            [slugField]: slug,
            [nameField]: name
          });
        
        setBookmarks(prev => [...prev, slug]);
        toast({
          title: "Bookmarked",
          description: `${type === 'company' ? 'Company' : 'College'} added to your bookmarks`,
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  return { bookmarks, toggleBookmark, refetch: fetchBookmarks };
};