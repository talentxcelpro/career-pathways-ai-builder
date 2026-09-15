import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Wand2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from 'sonner';

interface FileUploadZoneProps {
  onFileSelect: (files: FileList | null) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
  onProcessResume: () => void;
  isProcessing: boolean;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  error?: string;
  processingProgress?: number;
  processingStatus?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  uploadedFile,
  onRemoveFile,
  onProcessResume,
  isProcessing,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  error,
  processingProgress = 0,
  processingStatus = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string>('');

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Please upload a PDF, DOCX, or TXT file.`;
    }

    if (file.size > maxSize) {
      return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 10MB limit.`;
    }

    if (file.size < 100) {
      return 'File appears to be empty or corrupted.';
    }

    return null;
  };

  const handleClick = () => {
    if (!isProcessing) {
      setValidationError('');
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const error = validateFile(file);
      
      if (error) {
        setValidationError(error);
        toast.error(error);
        return;
      }
      
      setValidationError('');
      onFileSelect(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Upload Zone */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : uploadedFile 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={uploadedFile ? undefined : handleClick}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <CardContent className="p-8 text-center">
          <input
            ref={fileInputRef}
            id="resume-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          
          {!uploadedFile ? (
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                validationError || error ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                {validationError || error ? (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <Upload className="h-8 w-8 text-blue-600" />
                )}
              </div>
              
              <div>
                <h3 className={`text-lg font-medium mb-2 ${
                  validationError || error ? 'text-red-900' : 'text-gray-900'
                }`}>
                  {dragActive ? 'Drop your resume here' : 'Upload your resume'}
                </h3>
                
                {validationError || error ? (
                  <p className="text-red-600 mb-4 text-sm">
                    {validationError || error}
                  </p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Drag and drop or click to select your resume file
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>✓ Supports PDF, DOC, DOCX, and TXT files</p>
                      <p>✓ Maximum file size: 10MB</p>
                      <p>✓ AI-powered content extraction</p>
                    </div>
                  </>
                )}
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                disabled={isProcessing}
                className="transition-all duration-200"
              >
                Choose File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                {isProcessing ? (
                  <Wand2 className="h-8 w-8 text-blue-600 animate-spin" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isProcessing ? 'Processing Resume...' : 'File Selected'}
                </h3>
                
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
                  <span className="font-medium">{uploadedFile.name}</span>
                  <span className="text-sm">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-600 text-center">
                      {processingStatus || 'Processing...'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 justify-center">
                <Button
                  type="button"
                  onClick={onProcessResume}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  {isProcessing ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Extract Content
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRemoveFile}
                  disabled={isProcessing}
                  className="transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};