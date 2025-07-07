import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIJobGeneratorButtonProps {
  formData: any;
  onContentGenerated: (field: string, content: any) => void;
  type: 'job_summary' | 'job_description' | 'key_responsibilities';
  children: React.ReactNode;
  disabled?: boolean;
}

const AIJobGeneratorButton: React.FC<AIJobGeneratorButtonProps> = ({
  formData,
  onContentGenerated,
  type,
  children,
  disabled = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!formData.job_title?.trim()) {
      toast.error('Please enter a job title first');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating AI content for:', type, 'with formData:', {
        job_title: formData.job_title,
        industry_domain: formData.industry_domain,
        employment_type: formData.employment_type,
        work_mode: formData.work_mode,
        location_city: formData.location_city,
        experience_level: formData.experience_level,
        required_skills: formData.required_skills,
        company_name: formData.company_name
      });

      const requestBody = {
        type,
        job_title: formData.job_title,
        industry_domain: formData.industry_domain || 'Technology',
        employment_type: formData.employment_type || 'full-time',
        work_mode: formData.work_mode || 'On-site',
        location_city: formData.location_city || 'Remote',
        experience_level: formData.experience_level || 'mid-level',
        required_skills: formData.required_skills || [],
        company_name: formData.company_name || 'Our Company'
      };

      console.log('Sending request to ai-job-generator with body:', requestBody);

      const { data, error } = await supabase.functions.invoke('ai-job-generator', {
        body: requestBody
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      if (!data?.content) {
        throw new Error('No content received from AI service');
      }

      onContentGenerated(type, data.content);
      toast.success(`${type.replace('_', ' ')} generated successfully!`);

    } catch (error: any) {
      console.error('AI generation failed:', error);
      
      // Provide specific error messages
      if (error.message?.includes('OpenAI API key')) {
        toast.error('AI service configuration error. Please contact support.');
      } else if (error.message?.includes('rate limit')) {
        toast.error('Too many requests. Please try again in a moment.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(error.message || 'Failed to generate content. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating || !formData.job_title?.trim()}
      className="h-8"
    >
      {isGenerating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      <span className="ml-1">{children}</span>
    </Button>
  );
};

export default AIJobGeneratorButton;