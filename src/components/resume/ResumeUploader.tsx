
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { ExtractionResult } from '@/types/resume';

interface ResumeUploaderProps {
  onExtractionComplete: (result: ExtractionResult) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onExtractionComplete,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');

  const processFile = async (file: File) => {
    setIsExtracting(true);
    setProgress(0);
    setStatus('Uploading file...');

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setProgress(25);
      setStatus('Extracting content with AI...');

      // Call our extraction edge function
      const { data: extractionData, error: extractionError } = await supabase.functions
        .invoke('extract-resume', {
          body: { 
            filePath: uploadData.path,
            fileName: file.name,
            fileType: file.type
          }
        });

      if (extractionError) throw extractionError;

      setProgress(75);
      setStatus('Optimizing and finalizing...');

      // Clean up temporary file
      await supabase.storage
        .from('resumes')
        .remove([uploadData.path]);

      setProgress(100);
      setStatus('Complete!');

      toast.success('Resume extracted successfully!');
      onExtractionComplete(extractionData);

    } catch (error) {
      console.error('Extraction failed:', error);
      toast.error('Failed to extract resume. Please try again.');
      onExtractionComplete({
        success: false,
        confidence: 0,
        errors: [error.message || 'Unknown error occurred']
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (isExtracting) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <FileText className="h-16 w-16 mx-auto text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Processing Your Resume</h3>
          <p className="text-muted-foreground mb-6">{status}</p>
          <Progress value={progress} className="w-full mb-4" />
          <p className="text-sm text-muted-foreground">{progress}% complete</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
          <p className="text-muted-foreground mb-4">
            Drag & drop your resume here, or click to select
          </p>
          <Button variant="outline">
            Choose File
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Supports PDF, DOC, and DOCX files</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">AI Extraction</p>
            <p className="text-xs text-muted-foreground">95%+ accuracy</p>
          </div>
          <div className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">ATS Optimized</p>
            <p className="text-xs text-muted-foreground">Beat ATS systems</p>
          </div>
          <div className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Fast Processing</p>
            <p className="text-xs text-muted-foreground">Under 30 seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
