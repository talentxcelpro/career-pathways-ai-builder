
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

  const handleEnhanceResume = async () => {
    if (!resumeData) {
      toast.error('No resume data to enhance');
      return;
    }

    setIsEnhancing(true);
    
    try {
      console.log('Starting AI enhancement...');
      
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          resumeData: resumeData,
          enhancementType: 'comprehensive'
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Enhancement failed');
      }

      console.log('Enhancement successful:', data);
      
      // Apply the enhanced data
      onEnhancementApplied(data.enhancedResume);
      
      toast.success('Resume enhanced successfully!');
      
    } catch (error) {
      console.error('Error enhancing resume:', error);
      
      let errorMessage = 'Failed to enhance resume. Please try again.';
      if (error.message?.includes('network')) {
        errorMessage = 'Network connection issue. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      }
      
      toast.error(errorMessage);
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
    >
      {isEnhancing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Enhancing...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Enhance with AI
        </>
      )}
    </Button>
  );
};
