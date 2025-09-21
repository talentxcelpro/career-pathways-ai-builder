/**
 * Database query optimizations for Phase 1
 * Focus on the most frequently accessed queries
 */

import { supabase } from '@/integrations/supabase/client';

// Optimized jobs query with selective fields and proper indexing
export const getJobsOptimized = async (filters: any, page = 1, limit = 20) => {
  let query = supabase
    .from('jobs')
    .select(`
      id,
      title,
      company_name,
      location,
      salary_min,
      salary_max,
      employment_type,
      experience_level,
      is_remote,
      is_featured,
      posted_at,
      expires_at,
      views_count,
      applications_count,
      external_url,
      seo_slug,
      companies:company_id (
        id,
        name,
        logo_url,
        industry,
        is_verified
      )
    `)
    .eq('is_active', true)
    .eq('job_status', 'open')
    .gt('expires_at', new Date().toISOString())
    .order('posted_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  // Apply filters efficiently using indexes
  if (filters.search) {
    query = query.textSearch('title,description,company_name', filters.search);
  }

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters.employment_type?.length > 0) {
    query = query.in('employment_type', filters.employment_type);
  }

  if (filters.experience_level?.length > 0) {
    query = query.in('experience_level', filters.experience_level);
  }

  if (filters.is_remote) {
    query = query.eq('is_remote', true);
  }

  if (filters.salary_min > 0) {
    query = query.gte('salary_max', filters.salary_min);
  }

  if (filters.salary_max > 0) {
    query = query.lte('salary_min', filters.salary_max);
  }

  return query;
};

// Optimized profile query with essential fields only
export const getProfileOptimized = async (userId: string) => {
  return supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      title,
      about,
      location,
      profile_picture_url,
      resume_url,
      skills,
      experience_years,
      current_company,
      industry,
      profile_visibility,
      profile_views_count,
      updated_at
    `)
    .eq('id', userId)
    .maybeSingle();
};

// Optimized companies query
export const getCompaniesOptimized = async (limit = 20) => {
  return supabase
    .from('companies')
    .select(`
      id,
      name,
      slug,
      logo_url,
      industry,
      is_verified,
      employee_count,
      location,
      description
    `)
    .eq('is_active', true)
    .order('is_verified', { ascending: false })
    .order('employee_count', { ascending: false })
    .limit(limit);
};

// Cache-friendly query for job categories
export const getJobCategoriesOptimized = async () => {
  return supabase
    .rpc('get_job_categories_with_counts')
    .limit(20);
};