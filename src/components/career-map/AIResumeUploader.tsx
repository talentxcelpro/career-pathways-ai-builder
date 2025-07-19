
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

  const processFile = async (file: File) => {
    try {
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

      setUploadProgress(50);
      setProcessingStage('Processing with AI...');

      const result = await parseResume.mutateAsync({
        resumeText,
        userId
      });

      setUploadProgress(100);
      setProcessingStage('Complete!');

      if (result.success) {
        onResumeProcessed(result.parsedResume);
      }

    } catch (error) {
      console.error('File processing error:', error);
      setProcessingStage('Error processing file');
      setUploadProgress(0);
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

            <Button 
              variant="outline" 
              onClick={() => {
                setUploadedFile(null);
                setUploadProgress(0);
                setProcessingStage('');
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
