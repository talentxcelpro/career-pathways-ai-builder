import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { enhanceSection, generateSummary, suggestBullets } from "@/services/resumeEnhancementService";
import { toast } from "sonner";

interface InlineAIEnhancerProps {
  content: string;
  type: 'section' | 'summary' | 'bullets';
  onEnhanced: (enhancedContent: string) => void;
  label?: string;
  size?: 'sm' | 'default';
}

export const InlineAIEnhancer: React.FC<InlineAIEnhancerProps> = ({
  content,
  type,
  onEnhanced,
  label = "Enhance",
  size = 'sm'
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!content || !content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setIsEnhancing(true);
    toast.loading('AI is enhancing your content...', { id: 'ai-enhance' });

    try {
      let enhanced = '';
      
      switch (type) {
        case 'summary':
          enhanced = await generateSummary(content);
          break;
        case 'bullets':
          enhanced = await suggestBullets(content);
          break;
        case 'section':
        default:
          enhanced = await enhanceSection(content);
          break;
      }

      toast.dismiss('ai-enhance');
      toast.success('Content enhanced successfully!');
      onEnhanced(enhanced);
    } catch (error: any) {
      console.error('Enhancement error:', error);
      toast.dismiss('ai-enhance');
      
      if (error.message?.includes('Rate limit')) {
        toast.error('Rate limit reached. Please try again in a moment.');
      } else if (error.message?.includes('credits')) {
        toast.error('AI credits exhausted. Please add credits to continue.');
      } else {
        toast.error('Failed to enhance content. Please try again.');
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Button
      onClick={handleEnhance}
      disabled={isEnhancing}
      size="sm"
      variant="ghost"
      className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
    >
      {isEnhancing ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Enhancing...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3 h-3" />
          <span className="text-xs">{label}</span>
        </>
      )}
    </Button>
  );
};
