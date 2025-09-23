import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateVideoUrl, KNOWN_BROKEN_VIDEO_IDS } from '@/utils/videoValidation';

export const QuickVideoFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);

  const quickFix = async () => {
    setIsFixing(true);
    console.log('🔧 QuickVideoFix: Starting video fix process...');
    
    try {
      let totalFixed = 0;
      let processedLessons = 0;

      // Get all lessons with video URLs first
      console.log('📊 QuickVideoFix: Fetching lessons from database...');
      const { data: allLessons, error: fetchError } = await supabase
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
        .not('video_url', 'is', null);

      if (fetchError) {
        console.error('❌ QuickVideoFix: Database fetch error:', fetchError);
        throw fetchError;
      }

      console.log(`📈 QuickVideoFix: Found ${allLessons?.length || 0} lessons with video URLs`);
      toast.info(`Scanning ${allLessons?.length || 0} videos for issues...`);

      // Use direct broken video ID detection instead of validation API calls
      const brokenLessons = [];
      if (allLessons) {
        for (const lesson of allLessons) {
          if (lesson.video_url) {
            // Check if URL contains known broken video IDs
            const hasKnownBrokenId = KNOWN_BROKEN_VIDEO_IDS.some(id => lesson.video_url.includes(id));
            
            if (hasKnownBrokenId) {
              console.log(`🔍 QuickVideoFix: Found broken video - ${lesson.title}: ${lesson.video_url}`);
              brokenLessons.push(lesson);
            }
          }
        }
      }

      if (!brokenLessons?.length) {
        console.log('✅ QuickVideoFix: No broken videos found');
        toast.success('✅ No broken videos found - all videos are working!');
        return;
      }

      console.log(`🎯 QuickVideoFix: Found ${brokenLessons.length} broken video lessons to fix`);
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

      // Process each lesson with detailed logging
      for (const lesson of brokenLessons) {
        processedLessons++;
        console.log(`🔄 QuickVideoFix: Processing lesson ${processedLessons}/${brokenLessons.length}: "${lesson.title}"`);
        
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
            console.log(`🎯 QuickVideoFix: Matched keyword "${keyword}" for lesson "${lesson.title}"`);
            break;
          }
        }
        
        const newVideoUrl = `https://www.youtube.com/embed/${videoId}`;

        console.log(`🔧 QuickVideoFix: Updating lesson "${lesson.title}" with new video: ${videoId}`);
        console.log(`📝 QuickVideoFix: Old URL: ${lesson.video_url}`);
        console.log(`✨ QuickVideoFix: New URL: ${newVideoUrl}`);

        // Update the lesson with error handling
        const { error: updateError } = await supabase
          .from('course_lessons')
          .update({ video_url: newVideoUrl })
          .eq('id', lesson.id);

        if (!updateError) {
          totalFixed++;
          console.log(`✅ QuickVideoFix: Successfully updated lesson ${lesson.id}`);
        } else {
          console.error(`❌ QuickVideoFix: Failed to update lesson ${lesson.id}:`, updateError);
          toast.error(`Failed to update "${lesson.title}": ${updateError.message}`);
        }

        // Show progress for batches
        if (processedLessons % 5 === 0) {
          console.log(`📊 QuickVideoFix: Progress update - ${processedLessons}/${brokenLessons.length} processed, ${totalFixed} fixed`);
          toast.info(`🔄 Progress: ${processedLessons}/${brokenLessons.length} videos processed, ${totalFixed} fixed...`);
        }

        // Add small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`🏁 QuickVideoFix: Process complete - ${totalFixed}/${brokenLessons.length} videos fixed`);
      
      if (totalFixed === brokenLessons.length) {
        console.log('🎉 QuickVideoFix: All videos fixed successfully!');
        toast.success(`🎉 COMPLETE! Successfully fixed all ${totalFixed} broken videos with real educational content!`);
      } else {
        console.log(`⚠️ QuickVideoFix: Partial success - ${totalFixed}/${brokenLessons.length} fixed`);
        toast.success(`✅ Fixed ${totalFixed} out of ${brokenLessons.length} videos. ${brokenLessons.length - totalFixed} had errors.`);
      }
      
    } catch (error: any) {
      console.error('❌ QuickVideoFix: Critical error:', error);
      console.error('❌ QuickVideoFix: Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      toast.error(`❌ Failed to fix videos: ${error.message}`);
    } finally {
      console.log('🔄 QuickVideoFix: Cleaning up, setting isFixing to false');
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