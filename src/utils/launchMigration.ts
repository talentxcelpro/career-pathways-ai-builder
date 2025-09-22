// Complete launch readiness migration script
import { supabase } from '@/integrations/supabase/client';

export const migrateCourseData = async () => {
  try {
    console.log('Starting course data migration...');
    
    // Check if courses table exists and has data
    const { data: existingCourses, error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Courses table not found, creating migration...');
      
      // Create courses table if it doesn't exist
      await supabase.rpc('create_courses_table');
      
      // Migrate static course data to database
      const staticCourses = await import('@/data/coursesData');
      const courses = staticCourses.coursesDatabase;
      
      for (const course of courses) {
        await supabase.from('courses').insert({
          title: course.title,
          instructor: course.instructor,
          rating: course.rating,
          students: course.students,
          duration: course.duration,
          level: course.level,
          price: course.price,
          category: course.category,
          subcategory: course.subcategory,
          thumbnail: course.thumbnail,
          description: course.description,
          is_active: true
        });
      }
      
      console.log('Course data migration completed');
    } else {
      console.log('Courses table already exists with data');
    }
    
  } catch (error) {
    console.error('Course migration failed:', error);
  }
};

export const cleanupTestData = async () => {
  try {
    console.log('Cleaning up test data...');
    
    // Remove test users and related data
    await supabase.rpc('clean_test_users_and_duplicates');
    
    console.log('Test data cleanup completed');
  } catch (error) {
    console.error('Test data cleanup failed:', error);
  }
};

export const validateLaunchReadiness = async () => {
  const issues: string[] = [];
  
  try {
    // Check for test data
    const { data: testUsers } = await supabase
      .from('profiles')
      .select('id')
      .or('full_name.ilike.%test%,email.ilike.%test%')
      .limit(1);
    
    if (testUsers && testUsers.length > 0) {
      issues.push('Test users still exist in database');
    }
    
    // Check for active jobs
    const { count: activeJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (!activeJobs || activeJobs < 10) {
      issues.push('Insufficient active jobs for production');
    }
    
    // Check for real companies
    const { count: verifiedCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);
    
    if (!verifiedCompanies || verifiedCompanies < 5) {
      issues.push('Need more verified companies');
    }
    
    // Check auth configuration
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        issues.push('Auth configuration issues detected');
      }
    } catch (authError) {
      issues.push('Auth system not responding');
    }
    
    return {
      isReady: issues.length === 0,
      issues,
      checkedAt: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      isReady: false,
      issues: ['Failed to validate launch readiness'],
      error: error.message
    };
  }
};

// Run all migration tasks
export const runLaunchPreparation = async () => {
  console.log('🚀 Starting launch preparation...');
  
  try {
    await migrateCourseData();
    await cleanupTestData();
    
    const validation = await validateLaunchReadiness();
    
    console.log('✅ Launch preparation completed');
    console.log('Launch readiness:', validation);
    
    return validation;
  } catch (error) {
    console.error('❌ Launch preparation failed:', error);
    return {
      isReady: false,
      issues: ['Launch preparation failed'],
      error: error.message
    };
  }
};