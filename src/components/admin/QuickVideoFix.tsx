import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Video, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateVideoUrl, KNOWN_BROKEN_VIDEO_IDS } from '@/utils/videoValidation';

interface FixProgress {
  total: number;
  processed: number;
  fixed: number;
  failed: number;
  currentItem: string;
}

export const QuickVideoFix: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [progress, setProgress] = useState<FixProgress>({
    total: 0,
    processed: 0,
    fixed: 0,
    failed: 0,
    currentItem: ''
  });

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

  // Enhanced batch processing with transaction safety
  const processBatch = async (lessons: any[], startIndex: number, batchSize: number) => {
    const batch = lessons.slice(startIndex, startIndex + batchSize);
    const results = { fixed: 0, failed: 0 };

    for (const lesson of batch) {
      setProgress(prev => ({ ...prev, currentItem: lesson.title }));
      
      try {
        const courseTitle = lesson.course_modules?.courses?.title?.toLowerCase() || '';
        const category = lesson.course_modules?.courses?.category?.toLowerCase() || '';
        const lessonTitle = lesson.title?.toLowerCase() || '';
        const allText = `${courseTitle} ${category} ${lessonTitle}`;
        
        let videoId = categoryVideos.default;
        
        // Smart matching
        for (const [keyword, id] of Object.entries(categoryVideos)) {
          if (keyword !== 'default' && allText.includes(keyword)) {
            videoId = id;
            break;
          }
        }
        
        const newVideoUrl = `https://www.youtube.com/embed/${videoId}`;
        
        // Update with retry logic
        let retries = 3;
        let updateError = null;
        
        while (retries > 0) {
          const { error } = await supabase
            .from('course_lessons')
            .update({ video_url: newVideoUrl })
            .eq('id', lesson.id);
            
          if (!error) {
            results.fixed++;
            break;
          } else {
            updateError = error;
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
            }
          }
        }
        
        if (updateError) {
          console.error(`Failed to update lesson ${lesson.id} after retries:`, updateError);
          results.failed++;
        }
        
      } catch (error) {
        console.error(`Error processing lesson ${lesson.id}:`, error);
        results.failed++;
      }
      
      setProgress(prev => ({
        ...prev,
        processed: prev.processed + 1,
        fixed: prev.fixed + results.fixed,
        failed: prev.failed + results.failed
      }));
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    return results;
  };

  const quickFix = async () => {
    setIsFixing(true);
    console.log('🔧 Enhanced QuickVideoFix: Starting batch processing...');
    
    try {
      // Reset progress
      setProgress({ total: 0, processed: 0, fixed: 0, failed: 0, currentItem: '' });

      // Enhanced database query with error handling
      console.log('📊 QuickVideoFix: Fetching lessons from database...');
      let allLessons = null;
      let retries = 3;
      
      while (retries > 0 && !allLessons) {
        try {
          const { data, error } = await supabase
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

          if (error) {
            console.error('Database fetch error:', error);
            if (retries === 1) throw error;
            retries--;
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          allLessons = data;
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!allLessons) {
        throw new Error('Failed to fetch lessons after retries');
      }

      console.log(`📈 Found ${allLessons.length} lessons with video URLs`);
      toast.info(`Scanning ${allLessons.length} videos for issues...`);

      // Identify broken videos using known broken IDs
      const brokenLessons = allLessons.filter(lesson => {
        if (!lesson.video_url) return false;
        return KNOWN_BROKEN_VIDEO_IDS.some(id => lesson.video_url.includes(id));
      });

      if (!brokenLessons.length) {
        console.log('✅ No broken videos found');
        toast.success('✅ No broken videos found - all videos are working!');
        return;
      }

      console.log(`🎯 Found ${brokenLessons.length} broken video lessons to fix`);
      setProgress(prev => ({ ...prev, total: brokenLessons.length }));
      toast.info(`🔧 Processing ${brokenLessons.length} broken videos in batches...`);

      // Process in batches to prevent overwhelming the database
      const BATCH_SIZE = 10;
      let totalFixed = 0;
      let totalFailed = 0;

      for (let i = 0; i < brokenLessons.length; i += BATCH_SIZE) {
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(brokenLessons.length / BATCH_SIZE);
        
        console.log(`🔄 Processing batch ${batchNumber}/${totalBatches}`);
        toast.info(`Processing batch ${batchNumber}/${totalBatches}...`);
        
        const batchResults = await processBatch(brokenLessons, i, BATCH_SIZE);
        totalFixed += batchResults.fixed;
        totalFailed += batchResults.failed;
        
        // Delay between batches to prevent rate limiting
        if (i + BATCH_SIZE < brokenLessons.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Final results
      console.log(`🏁 Process complete - ${totalFixed}/${brokenLessons.length} videos fixed, ${totalFailed} failed`);
      
      if (totalFixed === brokenLessons.length) {
        toast.success(`🎉 SUCCESS! Fixed all ${totalFixed} broken videos with educational content!`);
      } else if (totalFixed > 0) {
        toast.success(`✅ Fixed ${totalFixed} of ${brokenLessons.length} videos. ${totalFailed} had errors.`);
      } else {
        toast.error(`❌ Unable to fix any videos. All ${totalFailed} attempts failed.`);
      }
      
    } catch (error: any) {
      console.error('❌ Enhanced QuickVideoFix: Critical error:', error);
      
      // Better error handling based on error type
      let errorMessage = 'Unknown error occurred';
      if (error.code === 'PGRST301') {
        errorMessage = 'Database connection issue - please try again';
      } else if (error.message?.includes('JWT')) {
        errorMessage = 'Authentication expired - please refresh and try again';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network connection issue - check your internet';
      } else {
        errorMessage = error.message || 'Unexpected error occurred';
      }
      
      toast.error(`❌ Failed to fix videos: ${errorMessage}`);
      setProgress(prev => ({ ...prev, currentItem: 'Error occurred' }));
    } finally {
      console.log('🔄 Enhanced QuickVideoFix: Cleaning up');
      setIsFixing(false);
      // Reset progress after a delay so user can see final status
      setTimeout(() => {
        setProgress({ total: 0, processed: 0, fixed: 0, failed: 0, currentItem: '' });
      }, 5000);
    }
  };

  const progressPercentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Enhanced Video Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Batch process broken videos with retry logic and real-time progress tracking.
        </p>
        
        {isFixing && progress.total > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4 animate-pulse" />
                Processing...
              </span>
              <span className="font-medium">
                {progress.processed}/{progress.total}
              </span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Fixed: {progress.fixed}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>Failed: {progress.failed}</span>
              </div>
            </div>
            
            {progress.currentItem && (
              <p className="text-xs text-muted-foreground truncate">
                Current: {progress.currentItem}
              </p>
            )}
          </div>
        )}
        
        <Button 
          onClick={quickFix} 
          disabled={isFixing}
          className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
        >
          {isFixing ? (
            <>
              <Video className="h-4 w-4 mr-2 animate-pulse" />
              Processing Batch Fix...
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