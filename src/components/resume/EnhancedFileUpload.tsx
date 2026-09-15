import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Image, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { PDFWorkerStatus } from './PDFWorkerStatus';
import { configurePDFWorker } from '@/utils/pdfWorkerConfig';
import { toast } from 'sonner';

interface EnhancedFileUploadProps {
  onFileSelect: (files: FileList) => void;
  isProcessing: boolean;
  processingProgress: number;
  processingStatus: string;
  className?: string;
}

export const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFileSelect,
  isProcessing,
  processingProgress,
  processingStatus,
  className
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPreparingPDF, setIsPreparingPDF] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Pre-configure PDF worker if needed
    if (file.type === 'application/pdf' && !isProcessing) {
      setIsPreparingPDF(true);
      toast('Preparing PDF processor...', { description: 'Setting up optimal extraction' });
      
      try {
        await configurePDFWorker();
        toast.success('PDF processor ready!');
      } catch (error) {
        console.warn('PDF worker setup failed:', error);
        toast('PDF processor setup incomplete', { 
          description: 'Processing will continue with fallback method' 
        });
      } finally {
        setIsPreparingPDF(false);
      }
    }

    // Create FileList-like object
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => index === 0 ? file : null,
      [Symbol.iterator]: function* () { yield file; }
    } as FileList;

    onFileSelect(fileList);
  }, [onFileSelect, isProcessing]);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'image/*': ['.jpg', '.jpeg', '.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isProcessing || isPreparingPDF
  });

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const getUploadAreaClassName = () => {
    let baseClass = "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ";
    
    if (isProcessing || isPreparingPDF) {
      baseClass += "border-gray-300 bg-gray-50 cursor-not-allowed ";
    } else if (isDragReject) {
      baseClass += "border-red-400 bg-red-50 ";
    } else if (isDragAccept || isDragActive) {
      baseClass += "border-primary bg-primary/5 ";
    } else {
      baseClass += "border-gray-300 hover:border-primary hover:bg-primary/5 ";
    }
    
    return baseClass;
  };

  if (isProcessing) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 bg-primary rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Processing Your Resume</h3>
              <p className="text-muted-foreground">{processingStatus}</p>
            </div>
            
            <div className="space-y-2">
              <Progress value={processingProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {processingProgress.toFixed(0)}% Complete
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI extraction and enhancement in progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* PDF Worker Status */}
      <PDFWorkerStatus />
      
      {/* File Upload Area */}
      <Card>
        <CardContent className="p-0">
          <div {...getRootProps()} className={getUploadAreaClassName()}>
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                {isPreparingPDF ? (
                  <div className="relative">
                    <Upload className="h-12 w-12 text-primary animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-4 w-4 bg-primary rounded-full animate-ping"></div>
                    </div>
                  </div>
                ) : (
                  <Upload className="h-12 w-12 text-primary" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {isPreparingPDF ? 'Preparing PDF Processor...' : 'Upload Your Resume'}
                </h3>
                
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop your file here!</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">
                      {isPreparingPDF 
                        ? 'Setting up optimal PDF extraction...'
                        : 'Drag & drop your resume here, or click to browse'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, Word documents, and images (max 10MB)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  <FileText className="h-3 w-3" />
                  PDF
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <FileText className="h-3 w-3" />
                  DOCX
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  <Image className="h-3 w-3" />
                  Images
                </span>
              </div>
              
              {!isDragActive && !isPreparingPDF && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  disabled={isProcessing || isPreparingPDF}
                >
                  Choose File
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Features Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="font-medium text-sm">Smart Extraction</h4>
                <p className="text-xs text-muted-foreground">AI-powered content parsing</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-medium text-sm">ATS Optimization</h4>
                <p className="text-xs text-muted-foreground">Automatic formatting for ATS</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <div>
                <h4 className="font-medium text-sm">Enhancement Tools</h4>
                <p className="text-xs text-muted-foreground">AI-powered improvements</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};