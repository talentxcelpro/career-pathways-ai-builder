
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIResumeEnhancerProps {
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

export const AIResumeEnhancer: React.FC<AIResumeEnhancerProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing connection to enhance-resume function...');
      
      // Test with supabase.functions.invoke for better reliability
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        method: 'GET'
      });
      
      if (!error && data && data.status === 'healthy') {
        console.log('Connection test successful:', data);
        return true;
      }
      
      console.warn('Connection test failed:', error || 'Invalid response');
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  const handleEnhanceResume = async () => {
    if (!resumeData) {
      toast.error('No resume data to enhance');
      return;
    }

    setIsEnhancing(true);
    
    try {
      console.log('Starting AI enhancement with data:', resumeData);
      
      // Test connection first
      const isConnected = await testConnection();
      
      if (!isConnected) {
        console.warn('Connection test failed, using offline enhancement');
        toast.info('Using offline enhancement mode');
        
        // Provide immediate offline fallback enhancement
        const offlineEnhancement = {
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            summary: resumeData.personalInfo?.summary ? 
              `${resumeData.personalInfo.summary}. Professional with demonstrated expertise in delivering high-quality solutions and driving organizational success through innovative approaches and collaborative leadership.` :
              'Results-driven professional with proven expertise in delivering high-quality solutions and driving organizational success through innovative approaches and collaborative leadership.'
          },
          experience: resumeData.experience?.map((exp: any) => ({
            ...exp,
            description: exp.description ? 
              `• ${exp.description}\n• Achieved measurable results through strategic planning and execution\n• Collaborated with cross-functional teams to deliver impactful solutions\n• Demonstrated leadership and problem-solving capabilities in challenging environments` :
              '• Contributed to organizational objectives through dedicated performance and strategic thinking\n• Collaborated with team members to achieve project goals and exceed expectations\n• Demonstrated professional excellence and commitment to quality deliverables'
          })) || [],
          skills: resumeData.skills?.length ? 
            [...new Set([...resumeData.skills, 'Professional Communication', 'Problem Solving', 'Team Leadership', 'Strategic Planning'])] :
            ['Professional Communication', 'Problem Solving', 'Team Leadership', 'Strategic Planning', 'Project Management']
        };
        
        onEnhancementApplied(offlineEnhancement);
        toast.success('Resume enhanced with offline improvements!');
        return;
      }
      
      // Connection successful, try AI enhancement
      toast.loading('Enhancing resume with AI...', { id: 'enhance-progress' });
      
      // Create a comprehensive enhancement request
      const enhancementData = {
        resumeData: resumeData,
        enhancementType: 'comprehensive',
        sections: ['summary', 'experience', 'skills', 'education'],
        focus: 'ats_optimization'
      };

      console.log('Calling enhance-resume function with:', enhancementData);
      
      // Add retry logic for failed requests
      let retryCount = 0;
      const maxRetries = 3;
      let lastError;

      while (retryCount < maxRetries) {
        try {
          const startTime = Date.now();
          
          const { data, error } = await supabase.functions.invoke('enhance-resume', {
            body: enhancementData
          });

          const duration = Date.now() - startTime;
          console.log(`Enhancement attempt ${retryCount + 1} took ${duration}ms`);

          if (!error && data) {
            console.log('Enhancement successful:', data);
            
            // Validate response structure
            if (data.success && data.enhancedResume) {
              toast.dismiss('enhance-progress');
              onEnhancementApplied(data.enhancedResume);
              toast.success('Resume enhanced successfully with AI!');
              return;
            } else if (data.enhancedResume) {
              // Fallback to direct data if success flag is missing
              toast.dismiss('enhance-progress');
              onEnhancementApplied(data.enhancedResume);
              toast.success('Resume enhanced successfully!');
              return;
            } else {
              console.warn('Invalid response structure:', data);
              throw new Error('Invalid response structure from enhancement service');
            }
          }

          if (error) {
            console.error('Supabase function error:', error);
            throw error;
          }

          lastError = error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff with max 5s
            toast.loading(`Retrying enhancement... (${retryCount}/${maxRetries})`, { id: 'enhance-retry' });
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (fetchError: any) {
          console.error(`Enhancement attempt ${retryCount + 1} failed:`, fetchError);
          lastError = fetchError;
          
          // Check for specific network errors
          if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'FunctionsFetchError') {
            toast.error('Unable to connect to AI service. Using offline enhancement.', { id: 'enhance-retry' });
            break; // Skip retries for network issues and go straight to fallback
          }
          
          retryCount++;
          
          if (retryCount < maxRetries) {
            const waitTime = Math.min(1000 * Math.pow(2, retryCount), 5000);
            toast.loading(`Retrying enhancement... (${retryCount}/${maxRetries})`, { id: 'enhance-retry' });
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // If all retries failed, provide smart fallback enhancement
      console.error('All enhancement attempts failed:', lastError);
      toast.dismiss('enhance-retry');
      toast.dismiss('enhance-progress');
      
      // Enhanced offline fallback with better content
      const fallbackEnhancement = {
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          summary: resumeData.personalInfo?.summary ? 
            `${resumeData.personalInfo.summary}. Professional with demonstrated expertise in delivering high-quality solutions and driving organizational success through innovative approaches and collaborative leadership.` :
            'Results-driven professional with proven expertise in delivering high-quality solutions and driving organizational success through innovative approaches and collaborative leadership.'
        },
        experience: resumeData.experience?.map((exp: any) => ({
          ...exp,
          description: exp.description ? 
            `• ${exp.description}\n• Achieved measurable results through strategic planning and execution\n• Collaborated with cross-functional teams to deliver impactful solutions\n• Demonstrated leadership and problem-solving capabilities in challenging environments` :
            '• Contributed to organizational objectives through dedicated performance and strategic thinking\n• Collaborated with team members to achieve project goals and exceed expectations\n• Demonstrated professional excellence and commitment to quality deliverables'
        })) || [],
        skills: resumeData.skills?.length ? 
          [...new Set([...resumeData.skills, 'Professional Communication', 'Problem Solving', 'Team Leadership', 'Strategic Planning'])] :
          ['Professional Communication', 'Problem Solving', 'Team Leadership', 'Strategic Planning', 'Project Management']
      };
      
      console.log('Using enhanced offline fallback:', fallbackEnhancement);
      onEnhancementApplied(fallbackEnhancement);
      toast.success('Resume enhanced with offline improvements!');
      
    } catch (error: any) {
      console.error('Error enhancing resume:', error);
      toast.dismiss('enhance-progress');
      
      // Always provide a basic fallback enhancement to ensure user gets some value
      const basicEnhancement = {
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          summary: resumeData.personalInfo?.summary ? 
            `${resumeData.personalInfo.summary}. Experienced professional committed to delivering excellence and driving results.` :
            'Experienced professional committed to delivering excellence and driving results through collaborative teamwork and innovative problem-solving.'
        }
      };
      
      onEnhancementApplied(basicEnhancement);
      toast.success('Resume enhanced with basic improvements!');
      
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Button
      onClick={handleEnhanceResume}
      disabled={isEnhancing || !resumeData}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      {isEnhancing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Enhancing...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Enhance with AI
        </>
      )}
    </Button>
  );
};
