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
      const { data, error } = await supabase
        .from('ai_resume_enhancements')
        .select('*')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEnhancements(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching enhancements:', error);
      return [];
    }
  };

  const applyEnhancement = async (enhancementId: string, resumeId: string, sectionType: string) => {
    try {
      // Get the enhancement
      const { data: enhancement, error: enhancementError } = await supabase
        .from('ai_resume_enhancements')
        .select('*')
        .eq('id', enhancementId)
        .single();

      if (enhancementError) throw enhancementError;

      // Update the resume section with enhanced content
      const { error: updateError } = await supabase
        .from('resume_sections')
        .update({
          content: JSON.parse(enhancement.enhanced_content)
        })
        .eq('resume_id', resumeId)
        .eq('section_type', sectionType);

      if (updateError) throw updateError;

      // Mark enhancement as applied
      const { error: markError } = await supabase
        .from('ai_resume_enhancements')
        .update({ is_applied: true })
        .eq('id', enhancementId);

      if (markError) throw markError;

      toast({
        title: "Enhancement applied!",
        description: "Your resume has been updated with the enhanced content.",
      });

      // Refresh enhancements
      await getEnhancements(resumeId);

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
      const { error } = await supabase
        .from('ai_resume_enhancements')
        .delete()
        .eq('id', enhancementId);

      if (error) throw error;

      // Remove from local state
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