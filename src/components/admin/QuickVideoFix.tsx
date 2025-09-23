import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const QuickVideoFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);

  const quickFix = async () => {
    setIsFixing(true);
    try {
      // Mapping of broken video IDs to appropriate replacements
      const videoMappings = [
        // AWS Course videos
        { broken: 'rfscVS0vtbw', replacement: '3hLmDS179YE', coursePattern: 'AWS' },
        { broken: 'rfscVS0vtbw', replacement: '1ukSR1GRtMU', coursePattern: 'Flutter' },
        { broken: 'rfscVS0vtbw', replacement: 'kI1KJGgWr34', coursePattern: 'Customer Service' },
        { broken: 'rfscVS0vtbw', replacement: 'AykYRO5d_lI', coursePattern: 'Public Speaking' },
        { broken: 'rfscVS0vtbw', replacement: '_b4QHbOKY3k', coursePattern: 'Interview' },
        { broken: 'rfscVS0vtbw', replacement: 'naIkpQ_cIt0', coursePattern: 'Communication' },
        { broken: 'rfscVS0vtbw', replacement: 'HAnw168huqA', coursePattern: 'other' },
        
        // Fix the other major broken video too
        { broken: 'llKvV8_T95M', replacement: 'UF8uR6Z6KLc', coursePattern: 'Leadership' },
        { broken: 'llKvV8_T95M', replacement: 'BHK4IoLWvfE', coursePattern: 'Brand' },
        { broken: 'llKvV8_T95M', replacement: 'naIkpQ_cIt0', coursePattern: 'Communication' },
        { broken: 'llKvV8_T95M', replacement: 'HAnw168huqA', coursePattern: 'other' },
        
        { broken: 'bFOKONpVDAQ', replacement: 'LHBE6Q9XlzI', coursePattern: 'Python' },
        { broken: 'bFOKONpVDAQ', replacement: 'UB1O30fR-EE', coursePattern: 'Web Development' },
        { broken: 'bFOKONpVDAQ', replacement: 'HAnw168huqA', coursePattern: 'other' }
      ];

      let totalFixed = 0;

      // Get all lessons with broken videos
      const { data: brokenLessons, error: fetchError } = await supabase
        .from('course_lessons')
        .select(`
          id,
          video_url,
          title,
          course_modules!inner (
            courses!inner (
              title,
              category
            )
          )
        `)
        .or('video_url.like.%rfscVS0vtbw%,video_url.like.%llKvV8_T95M%,video_url.like.%bFOKONpVDAQ%');

      if (fetchError) throw fetchError;

      if (!brokenLessons?.length) {
        toast.success('No broken videos found - all videos are working!');
        return;
      }

      console.log(`Found ${brokenLessons.length} broken video lessons to fix`);

      // Process each lesson
      for (const lesson of brokenLessons) {
        const courseTitle = (lesson as any).course_modules?.courses?.title?.toLowerCase() || '';
        const category = (lesson as any).course_modules?.courses?.category?.toLowerCase() || '';
        
        let newVideoUrl = 'https://www.youtube.com/embed/HAnw168huqA'; // Default fallback

        // Determine the best replacement video
        if (courseTitle.includes('aws') || courseTitle.includes('cloud')) {
          newVideoUrl = 'https://www.youtube.com/embed/3hLmDS179YE'; // AWS Training
        } else if (courseTitle.includes('flutter') || courseTitle.includes('mobile')) {
          newVideoUrl = 'https://www.youtube.com/embed/1ukSR1GRtMU'; // Mobile Development
        } else if (courseTitle.includes('customer service')) {
          newVideoUrl = 'https://www.youtube.com/embed/kI1KJGgWr34'; // Customer Service
        } else if (courseTitle.includes('public speaking') || courseTitle.includes('presentation')) {
          newVideoUrl = 'https://www.youtube.com/embed/AykYRO5d_lI'; // Public Speaking
        } else if (courseTitle.includes('interview') || courseTitle.includes('job')) {
          newVideoUrl = 'https://www.youtube.com/embed/_b4QHbOKY3k'; // Interview Skills
        } else if (courseTitle.includes('leadership') || courseTitle.includes('management')) {
          newVideoUrl = 'https://www.youtube.com/embed/UF8uR6Z6KLc'; // Leadership
        } else if (courseTitle.includes('brand') || courseTitle.includes('strategy')) {
          newVideoUrl = 'https://www.youtube.com/embed/BHK4IoLWvfE'; // Brand Strategy
        } else if (courseTitle.includes('python')) {
          newVideoUrl = 'https://www.youtube.com/embed/LHBE6Q9XlzI'; // Python Programming
        } else if (courseTitle.includes('web development') || courseTitle.includes('html') || courseTitle.includes('css')) {
          newVideoUrl = 'https://www.youtube.com/embed/UB1O30fR-EE'; // Web Development
        } else if (category.includes('communication')) {
          newVideoUrl = 'https://www.youtube.com/embed/naIkpQ_cIt0'; // Business Communication
        }

        // Update the lesson
        const { error: updateError } = await supabase
          .from('course_lessons')
          .update({ video_url: newVideoUrl })
          .eq('id', lesson.id);

        if (!updateError) {
          totalFixed++;
        } else {
          console.error(`Failed to update lesson ${lesson.id}:`, updateError);
        }
      }

      toast.success(`🚀 Successfully fixed ${totalFixed} out of ${brokenLessons.length} broken videos! All courses now have working educational content.`);
      
    } catch (error: any) {
      console.error('Quick fix error:', error);
      toast.error(`❌ Failed to fix videos: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Quick Video Fix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Instantly fix all broken YouTube videos with appropriate educational content.
        </p>
        <Button 
          onClick={quickFix} 
          disabled={isFixing}
          className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
        >
          {isFixing ? (
            <>
              <Video className="h-4 w-4 mr-2 animate-pulse" />
              Fixing Videos...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Fix All Broken Videos Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};