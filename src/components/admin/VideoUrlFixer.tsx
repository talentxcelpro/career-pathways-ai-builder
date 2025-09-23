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
        
        // Enhanced matching with better video assignments
        if (allText.includes('python') || allText.includes('programming')) {
          videoUrl = 'https://www.youtube.com/embed/_uQrJ0TkZlc'; // Python Tutorial
        } else if (allText.includes('web development') || allText.includes('html') || allText.includes('css') || allText.includes('javascript') || allText.includes('web')) {
          videoUrl = 'https://www.youtube.com/embed/pQN-pnXPaVg'; // Web Development
        } else if (allText.includes('devops') || allText.includes('deployment') || allText.includes('infrastructure') || allText.includes('cloud')) {
          videoUrl = 'https://www.youtube.com/embed/hQcFE0RD0cQ'; // DevOps & AWS
        } else if (allText.includes('data') || allText.includes('analytics') || allText.includes('sql') || allText.includes('database')) {
          videoUrl = 'https://www.youtube.com/embed/ua-CiDNNj30'; // Data Science
        } else if (allText.includes('marketing') || allText.includes('brand') || allText.includes('social media') || allText.includes('digital marketing')) {
          videoUrl = 'https://www.youtube.com/embed/bFOKONpVDAQ'; // Digital Marketing
        } else if (allText.includes('leadership') || allText.includes('management') || allText.includes('business') || allText.includes('communication') || allText.includes('writing')) {
          videoUrl = 'https://www.youtube.com/embed/llKvV8_T95M'; // Leadership & Communication
        } else if (allText.includes('design') || allText.includes('ui') || allText.includes('ux') || allText.includes('graphic')) {
          videoUrl = 'https://www.youtube.com/embed/ByYP60zz3F4'; // UI/UX Design
        } else if (allText.includes('ai') || allText.includes('artificial intelligence') || allText.includes('machine learning') || allText.includes('ml')) {
          videoUrl = 'https://www.youtube.com/embed/JMUxmLyrhSk'; // AI/ML
        } else if (allText.includes('blockchain') || allText.includes('cryptocurrency') || allText.includes('crypto')) {
          videoUrl = 'https://www.youtube.com/embed/SSo_EIwHSd4'; // Blockchain
        } else if (allText.includes('cybersecurity') || allText.includes('security') || allText.includes('cyber')) {
          videoUrl = 'https://www.youtube.com/embed/inWWhr5tnEA'; // Cybersecurity
        } else if (allText.includes('finance') || allText.includes('accounting') || allText.includes('financial')) {
          videoUrl = 'https://www.youtube.com/embed/WEDIj9JBTC8'; // Finance
        } else if (allText.includes('project management') || allText.includes('agile') || allText.includes('scrum')) {
          videoUrl = 'https://www.youtube.com/embed/i-QyW8D3ei0'; // Project Management
        } else if (allText.includes('mobile') || allText.includes('app development') || allText.includes('react native')) {
          videoUrl = 'https://www.youtube.com/embed/0-S5a0eXPoc'; // Mobile Development
        } else if (allText.includes('content') || allText.includes('copywriting') || allText.includes('writing')) {
          videoUrl = 'https://www.youtube.com/embed/vnVuqfXohxc'; // Content Writing
        } else if (allText.includes('hr') || allText.includes('human resources') || allText.includes('recruitment')) {
          videoUrl = 'https://www.youtube.com/embed/86V_DQdb4e0'; // HR Management
        } else if (allText.includes('sales') || allText.includes('selling') || allText.includes('negotiation')) {
          videoUrl = 'https://www.youtube.com/embed/tHsFGZ3MbgU'; // Sales Training
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