
// This file has been deprecated in favor of real Supabase data
// All mock data has been replaced with actual database queries
// See realDataService.ts for the new data fetching implementation

import { supabase } from "@/integrations/supabase/client";

// This function is kept for backward compatibility but should not be used
// All sample data should now come from the actual database
export const insertSampleCourses = async () => {
  console.warn('insertSampleCourses is deprecated. Use real database data instead.');
  
  // Check if courses already exist to avoid duplicates
  const { data: existingCourses } = await supabase
    .from('courses')
    .select('id')
    .limit(1);
    
  if (existingCourses && existingCourses.length > 0) {
    console.log('Courses already exist in database');
    return;
  }
  
  // If you need to populate initial data, do it through proper database seeding
  console.log('Please populate course data through the admin interface or database migrations');
};
