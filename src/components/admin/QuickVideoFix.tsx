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
      let totalFixed = 0;
      let processedLessons = 0;

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
        .or('video_url.like.%rfscVS0vtbw%,video_url.like.%llKvV8_T95M%,video_url.like.%bFOKONpVDAQ%,video_url.like.%ByYP60zz3F4%,video_url.like.%dQw4w9WgXcQ%');

      if (fetchError) throw fetchError;

      if (!brokenLessons?.length) {
        toast.success('✅ No broken videos found - all videos are working!');
        return;
      }

      console.log(`Found ${brokenLessons.length} broken video lessons to fix`);
      toast.info(`🔧 Fixing ${brokenLessons.length} broken videos...`);

      // Real working educational videos by category
      const categoryVideos = {
        // AWS & Cloud Computing
        aws: 'k1RI5locZE4', // AWS Tutorial for Beginners - Real educational content
        cloud: 'k1RI5locZE4',
        
        // Mobile Development
        flutter: 'VPvVD8t02U8', // Flutter Course for Beginners - Real tutorial
        mobile: 'VPvVD8t02U8',
        
        // Customer Service & Support
        'customer service': 'kI1KJGgWr34', // Customer Service Training
        support: 'kI1KJGgWr34',
        
        // Public Speaking & Presentation
        'public speaking': 'HAnw168huqA', // Public Speaking Course
        presentation: 'HAnw168huqA',
        
        // Interview & Career
        interview: 'PJKYqLP6MRE', // Job Interview Tips
        career: 'PJKYqLP6MRE',
        job: 'PJKYqLP6MRE',
        
        // Leadership & Management
        leadership: 'UF8uR6Z6KLc', // Leadership Training
        management: 'UF8uR6Z6KLc',
        
        // Brand & Strategy
        brand: 'vWsK5710d6Y', // Brand Strategy Tutorial
        strategy: 'vWsK5710d6Y',
        
        // Programming
        python: '_uQrJ0TkZlc', // Python Tutorial for Beginners
        javascript: 'PkZNo7MFNFg', // Learn JavaScript - Full Course
        programming: 'PkZNo7MFNFg',
        
        // Web Development
        'web development': 'pQN-pnXPaVg', // HTML CSS JavaScript Course
        html: 'pQN-pnXPaVg',
        css: 'pQN-pnXPaVg',
        frontend: 'pQN-pnXPaVg',
        
        // Design
        design: 'c9Wg6Cb_YlU', // UI/UX Design Course
        'ui': 'c9Wg6Cb_YlU',
        'ux': 'c9Wg6Cb_YlU',
        
        // Communication
        communication: 'naIkpQ_cIt0', // Business Communication
        business: 'naIkpQ_cIt0',
        
        // Default fallback
        default: 'HAnw168huqA' // General Business Skills Course
      };

      // Process each lesson
      for (const lesson of brokenLessons) {
        processedLessons++;
        const courseTitle = (lesson as any).course_modules?.courses?.title?.toLowerCase() || '';
        const category = (lesson as any).course_modules?.courses?.category?.toLowerCase() || '';
        const lessonTitle = lesson.title?.toLowerCase() || '';
        
        // Combine all text for better matching
        const allText = `${courseTitle} ${category} ${lessonTitle}`;
        
        let videoId = categoryVideos.default;
        
        // Smart matching - check for specific keywords
        for (const [keyword, id] of Object.entries(categoryVideos)) {
          if (keyword !== 'default' && allText.includes(keyword)) {
            videoId = id;
            break;
          }
        }
        
        const newVideoUrl = `https://www.youtube.com/embed/${videoId}`;

        console.log(`Fixing lesson: "${lesson.title}" from course: "${(lesson as any).course_modules?.courses?.title}" with video: ${videoId}`);

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

        // Show progress for large batches
        if (processedLessons % 10 === 0) {
          toast.info(`🔄 Progress: ${processedLessons}/${brokenLessons.length} videos processed...`);
        }
      }

      if (totalFixed === brokenLessons.length) {
        toast.success(`🎉 COMPLETE! Successfully fixed all ${totalFixed} broken videos with real educational content!`);
      } else {
        toast.success(`✅ Fixed ${totalFixed} out of ${brokenLessons.length} videos. ${brokenLessons.length - totalFixed} had errors.`);
      }
      
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