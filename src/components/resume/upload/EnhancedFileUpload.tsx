import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Image, CheckCircle, ArrowRight, AlertCircle, Zap, Eye, FileDown } from "lucide-react";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useAIResumeProcessor } from "@/hooks/useAIResumeProcessor";
import { toast } from "sonner";

interface EnhancedFileUploadProps {
  onFileProcessed: (extractedData: any, file: File) => void;
  onError: (error: string) => void;
  className?: string;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFileProcessed,
  onError,
  className = ""
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [extractedPreview, setExtractedPreview] = useState<any>(null);

  const { processResumeFile } = useAIResumeProcessor();

  const handleFileDrop = useCallback(async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        await processFile(file);
      }
    }
  }, []);

  const { dragActive, handleDrag, handleDrop } = useDragAndDrop(handleFileDrop);

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Please upload a PDF, Word document, text file, or image file.';
      setError(errorMsg);
      onError(errorMsg);
      return false;
    }

    if (file.size > maxSize) {
      const errorMsg = 'File size must be less than 10MB.';
      setError(errorMsg);
      onError(errorMsg);
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setError('');
    setProcessingProgress(0);

    try {
      setProcessingStep('Analyzing file format...');
      setProcessingProgress(10);

      // Simulate processing steps for user feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessingStep('Extracting text content...');
      setProcessingProgress(30);

      const result = await processResumeFile(file, (progress, status) => {
        setProcessingProgress(30 + (progress * 0.6));
        setProcessingStep(status);
      });

      setProcessingStep('Finalizing extraction...');
      setProcessingProgress(95);

      if (result.success && result.extractedData) {
        setExtractedPreview(result.extractedData);
        setProcessingProgress(100);
        setProcessingStep('Processing complete!');
        
        setTimeout(() => {
          onFileProcessed(result.extractedData, file);
          toast.success('Resume processed successfully!');
        }, 500);
      } else {
        throw new Error(result.error || 'Failed to process resume');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMsg);
      onError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        await processFile(file);
      }
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setIsProcessing(false);
    setProcessingStep('');
    setProcessingProgress(0);
    setError('');
    setExtractedPreview(null);
  };

  if (isProcessing) {
    return (
      <Card className={`border-2 ${className}`}>
        <CardContent className="p-8">
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Your Resume
              </h3>
              <p className="text-gray-600 mb-4">{processingStep}</p>
              
              <div className="space-y-2">
                <Progress value={processingProgress} className="w-full" />
                <p className="text-sm text-gray-500">{processingProgress}% complete</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <FileText className="h-5 w-5" />
              <span className="font-medium">{uploadedFile?.name}</span>
              <span className="text-sm">
                ({uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(1) : '0'} MB)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (extractedPreview && uploadedFile) {
    return (
      <Card className={`border-2 border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Resume Processed Successfully!
              </h3>
              
              <div className="flex items-center justify-center space-x-2 text-green-700 mb-4">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{uploadedFile.name}</span>
                <span className="text-sm">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            </div>

            {/* Extracted Data Preview */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Extracted Information Preview
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {extractedPreview.personalInfo?.fullName && (
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <p className="text-gray-900">{extractedPreview.personalInfo.fullName}</p>
                  </div>
                )}
                
                {extractedPreview.personalInfo?.email && (
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{extractedPreview.personalInfo.email}</p>
                  </div>
                )}
                
                {extractedPreview.experience?.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600">Experience:</span>
                    <p className="text-gray-900">{extractedPreview.experience.length} positions found</p>
                  </div>
                )}
                
                {extractedPreview.skills?.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600">Skills:</span>
                    <p className="text-gray-900">{extractedPreview.skills.length} skills identified</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-3">
              <Button 
                variant="outline"
                onClick={resetUpload}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Upload Different File
              </Button>
              
              <Button 
                onClick={() => onFileProcessed(extractedPreview, uploadedFile)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue with Extracted Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
        dragActive 
          ? 'border-blue-500 bg-blue-50' 
          : error 
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      } ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('enhanced-file-input')?.click()}
    >
      <CardContent className="p-12 text-center">
        <div className="space-y-6">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            error ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {error ? (
              <AlertCircle className="h-8 w-8 text-red-600" />
            ) : (
              <Upload className="h-8 w-8 text-blue-600" />
            )}
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${
              error ? 'text-red-900' : 'text-gray-900'
            }`}>
              {dragActive ? 'Drop your resume here' : 'Upload & Parse Resume with AI'}
            </h3>
            
            {error ? (
              <p className="text-red-600 mb-4">{error}</p>
            ) : (
              <p className="text-gray-600 mb-4">
                Advanced AI extraction for PDF, DOCX, TXT, and image files
              </p>
            )}
            
            <div className="flex justify-center space-x-3 mb-6 flex-wrap gap-2">
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <FileText className="h-4 w-4" />
                <span>DOCX</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                <FileText className="h-4 w-4" />
                <span>TXT</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                <Image className="h-4 w-4" />
                <span>JPG/PNG</span>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="pointer-events-none">
            <FileDown className="mr-2 h-4 w-4" />
            Choose File or Drag & Drop
          </Button>
        </div>
      </CardContent>

      <input
        id="enhanced-file-input"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
      />
    </Card>
  );
};