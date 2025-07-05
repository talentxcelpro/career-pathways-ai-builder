import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, X, Wand2 } from "lucide-react";

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
  onDrop
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
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
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {dragActive ? 'Drop your resume here' : 'Upload your resume'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop or click to select your resume file
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, and TXT files (max 10MB)
                </p>
              </div>
              
              <Button type="button" variant="outline">
                Choose File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <File className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  File Selected
                </h3>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <span className="font-medium">{uploadedFile.name}</span>
                  <span className="text-sm">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3 justify-center">
                <Button
                  type="button"
                  onClick={onProcessResume}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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