
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker with fallback
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface AIResumeUploaderProps {
  onResumeProcessed: (parsedData: any) => void;
  userId?: string;
}

export const AIResumeUploader: React.FC<AIResumeUploaderProps> = ({
  onResumeProcessed,
  userId
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { parseResume, isParsingResume } = useAICareerMapping();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const processFile = async (file: File, retry = false) => {
    try {
      setError(null);
      setUploadProgress(25);
      setProcessingStage('Extracting text from file...');

      let resumeText = '';

      if (file.type === 'application/pdf') {
        resumeText = await extractTextFromPDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        resumeText = await extractTextFromDOCX(file);
      } else if (file.type === 'text/plain') {
        resumeText = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
      }

      if (!resumeText.trim()) {
        throw new Error('Could not extract text from the file. Please ensure the file contains readable text.');
      }

      setUploadProgress(50);
      setProcessingStage('Processing with AI...');

      const result = await parseResume.mutateAsync({
        resumeText,
        userId
      });

      setUploadProgress(100);
      setProcessingStage('Complete!');
      setRetryCount(0);

      if (result.success) {
        onResumeProcessed(result.parsedResume);
      } else {
        throw new Error(result.error || 'Failed to process resume');
      }

    } catch (error: any) {
      console.error('File processing error:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.message?.includes('Failed to send a request to the Edge Function')) {
        errorMessage = 'Connection to AI service failed. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setProcessingStage('Error processing file');
      setUploadProgress(0);
      
      // Auto-retry once for network errors
      if (!retry && retryCount < 2 && 
          (error.message?.includes('Failed to send a request') || 
           error.message?.includes('timeout') ||
           error.message?.includes('network'))) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          setProcessingStage('Retrying...');
          processFile(file, true);
        }, 2000);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      processFile(file);
    }
  }, [userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-violet-600" />
          AI Resume Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-violet-500 bg-violet-50' 
                : 'border-gray-300 hover:border-violet-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Support for PDF, DOCX, and TXT files (max 10MB)
            </p>
            <Button>
              Choose File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {uploadProgress === 100 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : isParsingResume ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            {(isParsingResume || uploadProgress > 0) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{processingStage}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
                {retryCount < 2 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => processFile(uploadedFile!, false)}
                    className="mt-2 w-full border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={() => {
                setUploadedFile(null);
                setUploadProgress(0);
                setProcessingStage('');
                setError(null);
                setRetryCount(0);
              }}
              className="w-full"
            >
              Upload Different File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
