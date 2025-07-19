
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
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
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsExtracting(true);
    setProgress(0);
    setStatus('Uploading file...');
    setExtractionError(null);
    setLastFile(file);

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

      if (extractionData.success) {
        toast.success('Resume extracted successfully!');
        onExtractionComplete(extractionData);
      } else {
        // Handle extraction failure with user-friendly message
        const errorMessage = extractionData.errors?.[0] || 'Failed to extract resume content';
        setExtractionError(errorMessage);
        toast.error('Extraction failed. Please try again or create manually.');
      }

    } catch (error) {
      console.error('Extraction failed:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setExtractionError(errorMessage);
      toast.error('Failed to process resume. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRetry = () => {
    if (lastFile) {
      processFile(lastFile);
    }
  };

  const handleStartFromScratch = () => {
    setExtractionError(null);
    setLastFile(null);
    onExtractionComplete({
      success: true,
      resume: {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        selectedTemplate: 'modern-professional'
      },
      confidence: 1,
      extractionNotes: ['Started with blank resume']
    });
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

  if (extractionError) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Extraction Failed</h3>
          <p className="text-muted-foreground mb-6">{extractionError}</p>
          
          <div className="space-y-3">
            {lastFile && (
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again with Same File
              </Button>
            )}
            
            <Button variant="outline" onClick={() => setExtractionError(null)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Different File
            </Button>
            
            <Button variant="secondary" onClick={handleStartFromScratch} className="w-full">
              Start from Scratch
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Tips for better extraction:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use a clear, well-formatted resume</li>
              <li>• Ensure the file isn't password-protected</li>
              <li>• Try converting to PDF if using DOC format</li>
              <li>• Make sure text is selectable (not just images)</li>
            </ul>
          </div>
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
            <p className="text-xs text-muted-foreground">Smart parsing</p>
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

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={handleStartFromScratch}>
            Or start from scratch without uploading
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
