
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface FileUploadStepProps {
  onNext: () => void;
  onBack: () => void;
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  canGoBack: boolean;
  canGoNext: boolean;
}

export const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onNext,
  onBack,
  onFileUpload,
  uploadedFile,
  canGoBack,
  canGoNext
}) => {
  const [error, setError] = useState<string>('');
  
  const handleFileDrop = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
        setError('');
      }
    }
  };

  const { dragActive, handleDrag, handleDrop } = useDragAndDrop(handleFileDrop);

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, Word document, or image file.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
        setError('');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600">
          Choose your resume file to get started with AI-powered enhancement
        </p>
      </div>

      {!uploadedFile ? (
        <Card 
          className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : error 
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
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
                  {dragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                </h3>
                
                {error ? (
                  <p className="text-red-600 mb-4">{error}</p>
                ) : (
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                )}
                
                <div className="flex justify-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <FileText className="h-4 w-4" />
                    <span>DOCX</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    <Image className="h-4 w-4" />
                    <span>JPG/PNG</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="pointer-events-none">
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  File Selected Successfully!
                </h3>
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{uploadedFile.name}</span>
                  <span className="text-sm">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Choose Different File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={!canGoBack}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
