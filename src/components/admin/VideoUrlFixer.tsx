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
      // Get all Rick Astley videos with course information
      const { data: lessons, error: fetchError } = await supabase
        .from('course_lessons')
        .select(`
          id, 
          title,
          course_modules!inner (
            courses!inner (
              title,
              category
            )
          )
        `)
        .eq('lesson_type', 'video')
        .or('video_url.eq.https://www.youtube.com/watch?v=dQw4w9WgXcQ,video_url.like.%dQw4w9WgXcQ%');

      if (fetchError) throw fetchError;

      if (!lessons || lessons.length === 0) {
        toast.success('No Rick Astley videos found to update');
        return;
      }

      console.log(`Found ${lessons.length} Rick Astley videos to update`);

      let updatedCount = 0;

      for (const lesson of lessons) {
        let videoUrl = 'https://www.youtube.com/embed/rfscVS0vtbw'; // Default: JavaScript
        
        const lessonTitle = lesson.title.toLowerCase();
        const courseTitle = (lesson as any).course_modules?.courses?.title?.toLowerCase() || '';
        const allText = `${lessonTitle} ${courseTitle}`;
        
        console.log(`Processing: ${lesson.title} from ${courseTitle}`);
        
        if (allText.includes('python')) {
          videoUrl = 'https://www.youtube.com/embed/_uQrJ0TkZlc'; // Python Tutorial
        } else if (allText.includes('web development') || allText.includes('html') || allText.includes('css') || allText.includes('javascript')) {
          videoUrl = 'https://www.youtube.com/embed/pQN-pnXPaVg'; // Web Development
        } else if (allText.includes('data') || allText.includes('analytics')) {
          videoUrl = 'https://www.youtube.com/embed/ua-CiDNNj30'; // Data Science
        } else if (allText.includes('marketing') || allText.includes('brand') || allText.includes('social media')) {
          videoUrl = 'https://www.youtube.com/embed/bFOKONpVDAQ'; // Marketing
        } else if (allText.includes('leadership') || allText.includes('management') || allText.includes('business') || allText.includes('communication')) {
          videoUrl = 'https://www.youtube.com/embed/llKvV8_T95M'; // Leadership
        } else if (allText.includes('design') || allText.includes('ui') || allText.includes('ux')) {
          videoUrl = 'https://www.youtube.com/embed/ByYP60zz3F4'; // Design
        } else if (allText.includes('ai') || allText.includes('artificial intelligence') || allText.includes('machine learning')) {
          videoUrl = 'https://www.youtube.com/embed/JMUxmLyrhSk'; // AI/ML
        } else if (allText.includes('blockchain') || allText.includes('cryptocurrency')) {
          videoUrl = 'https://www.youtube.com/embed/SSo_EIwHSd4'; // Blockchain
        } else if (allText.includes('writing') || allText.includes('content')) {
          videoUrl = 'https://www.youtube.com/embed/vnVuqfXohxc'; // Writing
        } else if (allText.includes('finance') || allText.includes('accounting')) {
          videoUrl = 'https://www.youtube.com/embed/WEDIj9JBTC8'; // Finance
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
      
      toast.success(`Successfully updated ${updatedCount} out of ${lessons.length} video URLs!`);
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