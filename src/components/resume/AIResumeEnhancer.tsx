
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

  // Constants for direct fetch fallback
  const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

  const handleEnhance = async () => {
    if (!resumeData) {
      toast.error('Please upload or create your resume first');
      return;
    }

    setIsEnhancing(true);
    try {
      console.log('Starting enhancement with resume data:', resumeData);
      
      // Convert resume data to text for enhancement
      let resumeText = '';
      
      if (typeof resumeData === 'string') {
        resumeText = resumeData;
      } else if (resumeData && typeof resumeData === 'object') {
        // Convert structured resume data to text
        resumeText = JSON.stringify(resumeData, null, 2);
      } else {
        throw new Error('Invalid resume data format - data is null or undefined');
      }

      console.log('Resume text length:', resumeText.length);

      if (!resumeText || resumeText.trim() === '' || resumeText === 'null' || resumeText === '{}') {
        throw new Error('Resume content is empty. Please add some content to your resume first.');
      }

      const requestBody = {
        text: resumeText,
        provider: 'openai'
      };

      console.log('Attempting enhancement with Supabase client...');

      // First try with Supabase client
      let { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: requestBody
      });

      // If Supabase client fails, try direct fetch
      if (error && error.message?.includes('Failed to send a request')) {
        console.log('Supabase client failed, trying direct fetch...');
        
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/enhance-resume`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apikey': SUPABASE_ANON_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          data = await response.json();
          error = null;
          console.log('Direct fetch successful');
        } catch (fetchError) {
          console.error('Direct fetch also failed:', fetchError);
          throw new Error(`Network request failed: ${fetchError.message}`);
        }
      }

      if (error) {
        console.error('Enhancement error:', error);
        throw new Error(`Enhancement failed: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No response from enhancement service');
      }

      if (!data.success) {
        console.error('Enhancement failed with data:', data);
        throw new Error(data.error || 'Enhancement failed');
      }

      if (!data.enhancedContent) {
        throw new Error('No enhanced content returned from service');
      }

      console.log('Enhancement successful, content length:', data.enhancedContent.length);
      setEnhancedContent(data.enhancedContent);
      toast.success('Resume enhanced successfully!');
      
      // Apply enhancement if callback provided
      if (onEnhancementApplied) {
        onEnhancementApplied({
          ...resumeData,
          enhancedContent: data.enhancedContent
        });
      }

    } catch (error: any) {
      console.error('Enhancement failed with error:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(`Enhancement failed: ${errorMessage}`);
      setEnhancedContent(`Enhancement failed: ${errorMessage}. Please try again or check your internet connection.`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = async () => {
    if (enhancedContent) {
      try {
        await navigator.clipboard.writeText(enhancedContent);
        setCopied(true);
        toast.success('Enhanced content copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      }
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
        {resumeData && (
          <p className="text-sm text-muted-foreground">
            Resume data detected: {typeof resumeData === 'object' ? Object.keys(resumeData).length + ' sections' : 'text content'}
          </p>
        )}
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
              {onEnhancementApplied && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleApplyEnhancement}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Apply Enhancement
                </Button>
              )}
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
            <p className="text-xs mt-2">The AI will help optimize your resume for ATS systems and improve professional presentation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
