import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type EnhancementType = 'keyword_optimization' | 'format_improvement' | 'content_enhancement' | 'ats_optimization';

export interface Enhancement {
  id: string;
  resume_id: string;
  section_type: string;
  original_content: string;
  enhanced_content: string;
  enhancement_type: EnhancementType;
  confidence_score: number;
  is_applied: boolean;
  created_at: string;
}

export const useResumeEnhancement = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const { toast } = useToast();

  const enhanceSection = async (
    resumeId: string,
    sectionType: string,
    content: any,
    enhancementType: EnhancementType = 'content_enhancement'
  ) => {
    setIsEnhancing(true);

    try {
      const response = await fetch('/api/enhance-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          sectionType,
          content,
          enhancementType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Enhancement failed');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Content enhanced!",
          description: `Confidence score: ${Math.round(result.confidenceScore * 100)}%`,
        });

        return {
          success: true,
          enhancement: result.enhancement,
          enhancedContent: result.enhancedContent,
          confidenceScore: result.confidenceScore
        };
      } else {
        throw new Error(result.error || 'Enhancement failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Enhancement failed';
      toast({
        title: "Enhancement failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsEnhancing(false);
    }
  };

  const getEnhancements = async (resumeId: string) => {
    try {
      // Using direct SQL query until types are updated
      const { data, error } = await supabase
        .rpc('get_resume_enhancements', { resume_id: resumeId });

      if (error) throw error;

      const enhancementData = (data || []).map((item: any) => ({
        id: item.id,
        resume_id: item.resume_id,
        section_type: item.section_type,
        original_content: item.original_content,
        enhanced_content: item.enhanced_content,
        enhancement_type: item.enhancement_type,
        confidence_score: item.confidence_score,
        is_applied: item.is_applied,
        created_at: item.created_at
      }));

      setEnhancements(enhancementData);
      return enhancementData;
    } catch (error) {
      console.error('Error fetching enhancements:', error);
      return [];
    }
  };

  const applyEnhancement = async (enhancementId: string, resumeId: string, sectionType: string) => {
    try {
      // Temporarily disable this functionality until types are updated
      toast({
        title: "Enhancement feature updating",
        description: "This feature will be available once the database updates complete.",
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply enhancement';
      toast({
        title: "Application failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const dismissEnhancement = async (enhancementId: string) => {
    try {
      // Temporarily disable this functionality until types are updated
      setEnhancements(prev => prev.filter(e => e.id !== enhancementId));

      toast({
        title: "Enhancement dismissed",
        description: "The suggestion has been removed.",
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to dismiss enhancement';
      toast({
        title: "Dismissal failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    }
  };

  return {
    enhanceSection,
    getEnhancements,
    applyEnhancement,
    dismissEnhancement,
    isEnhancing,
    enhancements
  };
};