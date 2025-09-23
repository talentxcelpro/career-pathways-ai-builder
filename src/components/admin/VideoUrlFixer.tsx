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
        const courseTitle = (lesson as any).course_modules?.courses?.title?.toLowerCase() || '';
        const category = (lesson as any).course_modules?.courses?.category?.toLowerCase() || '';
        const allText = `${lessonTitle} ${courseTitle} ${category}`;
        
        console.log(`Processing: ${lesson.title} from ${courseTitle}`);
        
        // SOPHISTICATED VIDEO MATCHING - Based on actual high-quality educational content
        
        // PYTHON & PROGRAMMING
        if (allText.includes('python')) {
          if (allText.includes('data') || allText.includes('analytics')) {
            videoUrl = 'https://www.youtube.com/embed/wUSDVGivd-8'; // Python for Data Analytics - Full Course
          } else {
            videoUrl = 'https://www.youtube.com/embed/ix9cRaBkVe0'; // Python Full Course 2024
          }
        }
        
        // WEB DEVELOPMENT & FRAMEWORKS
        else if (allText.includes('react') || allText.includes('frontend framework')) {
          videoUrl = 'https://www.youtube.com/embed/CgkZ7MvWUAA'; // React Full Course 2024
        } else if (allText.includes('javascript') || allText.includes('js')) {
          videoUrl = 'https://www.youtube.com/embed/lfmg-EJ8gm4'; // JavaScript Full Course 2024
        } else if (allText.includes('web development') || allText.includes('html') || allText.includes('css') || allText.includes('frontend')) {
          videoUrl = 'https://www.youtube.com/embed/GxmfcnU3feo'; // Complete Web Development Roadmap
        }
        
        // DATA SCIENCE & MACHINE LEARNING
        else if (allText.includes('data science') || allText.includes('data analytics') || allText.includes('business analytics')) {
          videoUrl = 'https://www.youtube.com/embed/ZcaKgqXsEbA'; // Data Science Full Course 2024
        } else if (allText.includes('machine learning') || allText.includes('ai') || allText.includes('artificial intelligence')) {
          videoUrl = 'https://www.youtube.com/embed/LR5nTW6vXhQ'; // Machine Learning Full Course 2024
        }
        
        // DIGITAL MARKETING & BUSINESS
        else if (allText.includes('digital marketing') || allText.includes('marketing') || allText.includes('social media')) {
          videoUrl = 'https://www.youtube.com/embed/Ayekd8lkUkU'; // Digital Marketing Course 10 Hours
        } else if (allText.includes('business') || allText.includes('entrepreneurship') || allText.includes('startup')) {
          videoUrl = 'https://www.youtube.com/embed/nkNHn0VqVBA'; // Digital Marketing Full Course
        }
        
        // PROJECT MANAGEMENT & LEADERSHIP
        else if (allText.includes('project management') || allText.includes('pmp') || allText.includes('agile') || allText.includes('scrum')) {
          videoUrl = 'https://www.youtube.com/embed/MJqP6_a_YKM'; // Project Management Fundamentals
        } else if (allText.includes('leadership') || allText.includes('management') || allText.includes('executive')) {
          videoUrl = 'https://www.youtube.com/embed/VrJjOht8Z9Y'; // Leadership Training & Development
        }
        
        // COMMUNICATION & SOFT SKILLS  
        else if (allText.includes('communication') || allText.includes('presentation') || allText.includes('public speaking')) {
          videoUrl = 'https://www.youtube.com/embed/HAnw168huqA'; // Public Speaking & Communication Skills
        } else if (allText.includes('writing') || allText.includes('copywriting') || allText.includes('content')) {
          videoUrl = 'https://www.youtube.com/embed/vnVuqfXohxc'; // Content Writing Tutorial
        }
        
        // CAREER DEVELOPMENT
        else if (allText.includes('resume') || allText.includes('linkedin') || allText.includes('job interview')) {
          videoUrl = 'https://www.youtube.com/embed/ciIkiWwZnlc'; // Resume Writing & Interview Skills
        } else if (allText.includes('career') || allText.includes('professional') || allText.includes('workplace')) {
          videoUrl = 'https://www.youtube.com/embed/u6XAPnuFjJc'; // Career Development Strategies
        }
        
        // TECHNOLOGY SPECIALIZATIONS
        else if (allText.includes('devops') || allText.includes('cloud') || allText.includes('aws') || allText.includes('deployment')) {
          videoUrl = 'https://www.youtube.com/embed/hQcFE0RD0cQ'; // DevOps & Cloud Computing
        } else if (allText.includes('cybersecurity') || allText.includes('security') || allText.includes('cyber')) {
          videoUrl = 'https://www.youtube.com/embed/inWWhr5tnEA'; // Cybersecurity Fundamentals
        } else if (allText.includes('blockchain') || allText.includes('cryptocurrency') || allText.includes('crypto')) {
          videoUrl = 'https://www.youtube.com/embed/SSo_EIwHSd4'; // Blockchain Technology Explained
        }
        
        // DESIGN & CREATIVITY
        else if (allText.includes('design') || allText.includes('ui') || allText.includes('ux') || allText.includes('graphic')) {
          videoUrl = 'https://www.youtube.com/embed/ByYP60zz3F4'; // UI/UX Design Complete Course
        }
        
        // FINANCE & BUSINESS ANALYTICS
        else if (allText.includes('finance') || allText.includes('accounting') || allText.includes('financial')) {
          videoUrl = 'https://www.youtube.com/embed/WEDIj9JBTC8'; // Finance & Accounting Basics
        } else if (allText.includes('excel') || allText.includes('spreadsheet') || allText.includes('tableau')) {
          videoUrl = 'https://www.youtube.com/embed/Vl0H-qTclOg'; // Excel & Data Analysis
        }
        
        // HEALTHCARE & SPECIALIZED FIELDS
        else if (allText.includes('healthcare') || allText.includes('medical') || allText.includes('nursing')) {
          videoUrl = 'https://www.youtube.com/embed/gGqVNuYhcxw'; // Healthcare Management
        } else if (allText.includes('hr') || allText.includes('human resources') || allText.includes('recruitment')) {
          videoUrl = 'https://www.youtube.com/embed/86V_DQdb4e0'; // HR Management & Leadership
        } else if (allText.includes('sales') || allText.includes('selling') || allText.includes('negotiation')) {
          videoUrl = 'https://www.youtube.com/embed/tHsFGZ3MbgU'; // Sales Training & Techniques
        }
        
        // MOBILE & APP DEVELOPMENT
        else if (allText.includes('mobile') || allText.includes('app development') || allText.includes('android') || allText.includes('ios')) {
          videoUrl = 'https://www.youtube.com/embed/0-S5a0eXPoc'; // Mobile App Development
        }
        
        // EDUCATION & TRAINING
        else if (allText.includes('education') || allText.includes('teaching') || allText.includes('training')) {
          videoUrl = 'https://www.youtube.com/embed/UCFg9bcW7Bk'; // Educational Technology & Methods
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
          Fix Rick Astley placeholder videos with appropriate educational content based on course topics.
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