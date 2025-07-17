
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

interface AIResumeEnhancerProps {
  resumeData?: any;
  onEnhancementApplied?: (enhancedData: any) => void;
}

export const AIResumeEnhancer: React.FC<AIResumeEnhancerProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [enhancedContent, setEnhancedContent] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEnhance = async () => {
    if (!resumeData) {
      toast.error('Please upload or create your resume first');
      return;
    }

    setIsEnhancing(true);
    try {
      console.log('Starting enhancement with resume data:', resumeData);
      
      // Convert resume data to text for enhancement
      const resumeText = typeof resumeData === 'string' 
        ? resumeData 
        : JSON.stringify(resumeData);

      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          text: resumeText,
          provider: 'openai'
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Enhancement failed');
      }

      setEnhancedContent(data.enhancedContent);
      toast.success('Resume enhanced successfully!');
      
      // Apply enhancement if callback provided
      if (onEnhancementApplied) {
        onEnhancementApplied({
          ...resumeData,
          enhancedContent: data.enhancedContent
        });
      }

    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error(`Enhancement failed: ${error.message}`);
      setEnhancedContent('Failed to enhance resume. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = async () => {
    if (enhancedContent) {
      await navigator.clipboard.writeText(enhancedContent);
      setCopied(true);
      toast.success('Enhanced content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyEnhancement = () => {
    if (enhancedContent && onEnhancementApplied) {
      onEnhancementApplied({
        ...resumeData,
        content: enhancedContent
      });
      toast.success('Enhancement applied to your resume!');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Resume Enhancer
          </CardTitle>
          <Badge variant="secondary">
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleEnhance}
            disabled={isEnhancing || !resumeData}
            className="flex-1"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance Resume
              </>
            )}
          </Button>
          
          {enhancedContent && (
            <Button 
              variant="outline" 
              onClick={handleCopy}
              size="icon"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {enhancedContent && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Enhanced Content
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleApplyEnhancement}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Apply Enhancement
              </Button>
            </div>
            
            <Textarea
              value={enhancedContent}
              onChange={(e) => setEnhancedContent(e.target.value)}
              className="min-h-[300px] resize-none"
              placeholder="Enhanced resume content will appear here..."
            />
          </div>
        )}

        {!resumeData && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Upload or create your resume to get AI-powered enhancements</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
