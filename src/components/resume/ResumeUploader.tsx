
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCw, Activity } from 'lucide-react';
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
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      console.log('Testing Edge Function connection...');
      
      const { data, error } = await supabase.functions.invoke('extract-resume', {
        method: 'GET'
      });

      if (error) {
        console.error('Health check failed:', error);
        toast.error('Connection test failed: ' + error.message);
      } else {
        console.log('Health check passed:', data);
        toast.success('Connection test successful!');
      }
    } catch (error: any) {
      console.error('Health check error:', error);
      toast.error('Connection test failed: ' + error.message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const processFile = async (file: File) => {
    setIsExtracting(true);
    setProgress(0);
    setStatus('Uploading file...');
    setExtractionError(null);
    setLastFile(file);

    try {
      console.log('🚀 Starting file processing for:', file.name);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded successfully:', uploadData.path);
      setProgress(25);
      setStatus('Extracting content with AI...');

      // Call our extraction edge function with detailed logging
      console.log('📞 Calling extract-resume function...');
      const { data: extractionData, error: extractionError } = await supabase.functions
        .invoke('extract-resume', {
          body: { 
            filePath: uploadData.path,
            fileName: file.name,
            fileType: file.type
          }
        });

      console.log('📥 Function response received:', { extractionData, extractionError });

      if (extractionError) {
        console.error('❌ Function invocation error:', extractionError);
        throw new Error(`Function call failed: ${extractionError.message}`);
      }

      setProgress(75);
      setStatus('Optimizing and finalizing...');

      // Clean up temporary file
      try {
        await supabase.storage
          .from('resumes')
          .remove([uploadData.path]);
        console.log('🗑️ Temporary file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temporary file:', cleanupError);
      }

      setProgress(100);
      setStatus('Complete!');

      if (extractionData?.success) {
        console.log('✅ Extraction successful:', extractionData);
        toast.success('Resume extracted successfully!');
        onExtractionComplete(extractionData);
      } else {
        console.error('❌ Extraction failed:', extractionData);
        const errorMessage = extractionData?.error || 'Failed to extract resume content';
        setExtractionError(errorMessage);
        toast.error('Extraction failed: ' + errorMessage);
      }

    } catch (error: any) {
      console.error('💥 Processing failed:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setExtractionError(errorMessage);
      toast.error('Failed to process resume: ' + errorMessage);
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
      suggestions: ['Started with blank resume']
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
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
            <Button onClick={testConnection} variant="outline" className="w-full" disabled={isTestingConnection}>
              <Activity className="h-4 w-4 mr-2" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            
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
            <h4 className="font-medium mb-2">Troubleshooting tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check that the file is a valid PDF, DOC, or DOCX</li>
              <li>• Ensure the file isn't password-protected</li>
              <li>• Try the connection test button above</li>
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
            <p>Supports PDF, DOC, DOCX, and TXT files</p>
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

        <div className="mt-6 text-center space-y-2">
          <Button variant="ghost" onClick={handleStartFromScratch}>
            Or start from scratch without uploading
          </Button>
          
          <Button variant="ghost" size="sm" onClick={testConnection} disabled={isTestingConnection}>
            <Activity className="h-4 w-4 mr-2" />
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
