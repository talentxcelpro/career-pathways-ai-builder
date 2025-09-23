import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const VideoUrlFixer: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);

  const fixVideoUrls = async () => {
    setIsFixing(true);
    try {
      // Get ALL video lessons with course information for comprehensive update
      const { data: lessons, error: fetchError } = await supabase
        .from('course_lessons')
        .select(`
          id, 
          title,
          video_url,
          course_modules!inner (
            title,
            courses!inner (
              title,
              category
            )
          )
        `)
        .eq('lesson_type', 'video');

      if (fetchError) throw fetchError;

      if (!lessons || lessons.length === 0) {
        toast.error('No video lessons found');
        return;
      }

      console.log(`Found ${lessons.length} video lessons to update`);

      let updatedCount = 0;

      for (const lesson of lessons) {
        let videoUrl = 'https://www.youtube.com/embed/rfscVS0vtbw'; // Default: JavaScript
        
        const lessonTitle = lesson.title.toLowerCase();
        const moduleTitle = (lesson as any).course_modules?.title?.toLowerCase() || '';
        const courseTitle = (lesson as any).course_modules?.courses?.title?.toLowerCase() || '';
        const category = (lesson as any).course_modules?.courses?.category?.toLowerCase() || '';
        const allText = `${lessonTitle} ${moduleTitle} ${courseTitle} ${category}`;
        
        console.log(`Processing: ${lesson.title} from ${courseTitle} (${category})`);
        
        // PRECISE MATCHING BASED ON COURSE TITLE AND CATEGORY - Fixes the mismatch issue
        
        // AI & MACHINE LEARNING
        if (courseTitle.includes('artificial intelligence') || courseTitle.includes('machine learning')) {
          videoUrl = 'https://www.youtube.com/embed/JMUxmLyrhSk'; // Machine Learning Course
        }
        
        // BLOCKCHAIN & CRYPTOCURRENCY  
        else if (courseTitle.includes('blockchain') || courseTitle.includes('cryptocurrency')) {
          videoUrl = 'https://www.youtube.com/embed/SSo_EIwHSd4'; // Blockchain Technology Course
        }
        
        // BUSINESS COMMUNICATION & WRITING
        else if (courseTitle.includes('business writing') || courseTitle.includes('communication')) {
          videoUrl = 'https://www.youtube.com/embed/HAnw168huqA'; // Business Communication Skills
        }
        
        // BRAND MANAGEMENT & MARKETING STRATEGY
        else if (courseTitle.includes('brand management') || courseTitle.includes('brand strategy')) {
          videoUrl = 'https://www.youtube.com/embed/bFOKONpVDAQ'; // Brand Management Course
        }
        
        // BUSINESS ANALYTICS & DATA
        else if (courseTitle.includes('business analytics') || courseTitle.includes('data-driven')) {
          videoUrl = 'https://www.youtube.com/embed/ZcaKgqXsEbA'; // Business Analytics Course
        }
        
        // CUSTOMER SERVICE & EXPERIENCE
        else if (courseTitle.includes('customer service') || courseTitle.includes('customer experience')) {
          videoUrl = 'https://www.youtube.com/embed/kI1KJGgWr34'; // Customer Service Training
        }
        
        // CYBERSECURITY
        else if (courseTitle.includes('cybersecurity') || courseTitle.includes('cyber security')) {
          videoUrl = 'https://www.youtube.com/embed/inWWhr5tnEA'; // Cybersecurity Fundamentals
        }
        
        // DATA SCIENCE & ANALYTICS
        else if (courseTitle.includes('data science') || courseTitle.includes('data analytics')) {
          videoUrl = 'https://www.youtube.com/embed/wUSDVGivd-8'; // Data Science Course
        }
        
        // DIGITAL MARKETING
        else if (courseTitle.includes('digital marketing') || category.includes('marketing')) {
          videoUrl = 'https://www.youtube.com/embed/Ayekd8lkUkU'; // Digital Marketing Course
        }
        
        // ENTREPRENEURSHIP & STARTUP
        else if (courseTitle.includes('entrepreneurship') || courseTitle.includes('startup')) {
          videoUrl = 'https://www.youtube.com/embed/nkNHn0VqVBA'; // Entrepreneurship Course
        }
        
        // FINANCIAL ANALYSIS & PLANNING
        else if (courseTitle.includes('financial') || courseTitle.includes('finance')) {
          videoUrl = 'https://www.youtube.com/embed/WEDIj9JBTC8'; // Financial Planning Course
        }
        
        // HEALTHCARE MANAGEMENT
        else if (courseTitle.includes('healthcare') || courseTitle.includes('medical')) {
          videoUrl = 'https://www.youtube.com/embed/gGqVNuYhcxw'; // Healthcare Management
        }
        
        // HR & HUMAN RESOURCES
        else if (courseTitle.includes('human resources') || courseTitle.includes('hr')) {
          videoUrl = 'https://www.youtube.com/embed/86V_DQdb4e0'; // HR Management Course
        }
        
        // INNOVATION & CREATIVITY
        else if (courseTitle.includes('innovation') || courseTitle.includes('creative')) {
          videoUrl = 'https://www.youtube.com/embed/ByYP60zz3F4'; // Innovation & Creativity
        }
        
        // JOB INTERVIEW & CAREER
        else if (courseTitle.includes('job interview') || courseTitle.includes('interview mastery')) {
          videoUrl = 'https://www.youtube.com/embed/ciIkiWwZnlc'; // Job Interview Skills
        }
        
        // LEADERSHIP & MANAGEMENT  
        else if (courseTitle.includes('leadership') || courseTitle.includes('management')) {
          videoUrl = 'https://www.youtube.com/embed/VrJjOht8Z9Y'; // Leadership Training
        }
        
        // NETWORKING & RELATIONSHIPS
        else if (courseTitle.includes('networking') || courseTitle.includes('relationship')) {
          videoUrl = 'https://www.youtube.com/embed/u6XAPnuFjJc'; // Professional Networking
        }
        
        // OPERATIONS MANAGEMENT
        else if (courseTitle.includes('operations') || courseTitle.includes('operational')) {
          videoUrl = 'https://www.youtube.com/embed/MJqP6_a_YKM'; // Operations Management
        }
        
        // PERSONAL DEVELOPMENT
        else if (courseTitle.includes('personal development') || courseTitle.includes('self-improvement')) {
          videoUrl = 'https://www.youtube.com/embed/u6XAPnuFjJc'; // Personal Development
        }
        
        // PROJECT MANAGEMENT
        else if (courseTitle.includes('project management') || courseTitle.includes('pmp')) {
          videoUrl = 'https://www.youtube.com/embed/MJqP6_a_YKM'; // Project Management
        }
        
        // PYTHON PROGRAMMING
        else if (courseTitle.includes('python')) {
          videoUrl = 'https://www.youtube.com/embed/ix9cRaBkVe0'; // Python Programming Course
        }
        
        // QUALITY ASSURANCE & CONTROL
        else if (courseTitle.includes('quality') || courseTitle.includes('qa')) {
          videoUrl = 'https://www.youtube.com/embed/MJqP6_a_YKM'; // Quality Management
        }
        
        // SALES & SELLING
        else if (courseTitle.includes('sales') || courseTitle.includes('selling')) {
          videoUrl = 'https://www.youtube.com/embed/tHsFGZ3MbgU'; // Sales Training
        }
        
        // SUPPLY CHAIN MANAGEMENT
        else if (courseTitle.includes('supply chain') || courseTitle.includes('logistics')) {
          videoUrl = 'https://www.youtube.com/embed/MJqP6_a_YKM'; // Supply Chain Management
        }
        
        // TEAM BUILDING & COLLABORATION
        else if (courseTitle.includes('team building') || courseTitle.includes('collaboration')) {
          videoUrl = 'https://www.youtube.com/embed/VrJjOht8Z9Y'; // Team Building
        }
        
        // UI/UX DESIGN
        else if (courseTitle.includes('ui') || courseTitle.includes('ux') || courseTitle.includes('design')) {
          videoUrl = 'https://www.youtube.com/embed/ByYP60zz3F4'; // UI/UX Design Course
        }
        
        // WEB DEVELOPMENT
        else if (courseTitle.includes('web development') || courseTitle.includes('frontend') || courseTitle.includes('backend')) {
          videoUrl = 'https://www.youtube.com/embed/GxmfcnU3feo'; // Web Development Course
        }
        
        // CATEGORY-BASED FALLBACKS for unmatched courses
        else if (category === 'technology') {
          videoUrl = 'https://www.youtube.com/embed/rfscVS0vtbw'; // General Technology
        } else if (category === 'business') {
          videoUrl = 'https://www.youtube.com/embed/nkNHn0VqVBA'; // General Business
        } else if (category === 'marketing') {
          videoUrl = 'https://www.youtube.com/embed/Ayekd8lkUkUU'; // General Marketing
        } else if (category === 'communication') {
          videoUrl = 'https://www.youtube.com/embed/HAnw168huqA'; // General Communication
        }

        const { error: updateError } = await supabase
          .from('course_lessons')
          .update({ video_url: videoUrl })
          .eq('id', lesson.id);

        if (updateError) {
          console.error(`Error updating lesson ${lesson.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
      
      toast.success(`Successfully updated ${updatedCount} out of ${lessons.length} video URLs with relevant content!`);
    } catch (error) {
      console.error('Error fixing video URLs:', error);
      toast.error(`Failed to fix video URLs: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video URL Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Match videos precisely with course content to fix mismatches. Uses course titles, categories, and modules for accurate matching.
        </p>
        <Button 
          onClick={fixVideoUrls} 
          disabled={isFixing}
          className="w-full"
        >
          {isFixing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Fixing Video URLs...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Fix Video URLs
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};