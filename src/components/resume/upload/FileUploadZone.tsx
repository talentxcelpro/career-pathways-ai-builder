
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, X, File } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadZoneProps {
  onFileSelect: (files: FileList | null) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
  isProcessing: boolean;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FileUploadZone = ({
  onFileSelect,
  uploadedFile,
  onRemoveFile,
  isProcessing,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}: FileUploadZoneProps) => {
  const { uploading } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
  });

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {uploadedFile ? (
        <div className="space-y-4">
          <File className="h-12 w-12 mx-auto text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">{uploadedFile.name}</h3>
            <p className="text-sm text-gray-600">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="flex justify-center space-x-2">
            <Button onClick={onRemoveFile} variant="outline" size="sm">
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
            <Button 
              onClick={() => onFileSelect(uploadedFile ? [uploadedFile] as any : null)} 
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Resume'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="h-12 w-12 mx-auto text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900">Drop your resume here</h3>
            <p className="text-sm text-gray-600">or click to browse files</p>
          </div>
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) => onFileSelect(e.target.files)}
            className="hidden"
            id="resume-upload"
            disabled={uploading || isProcessing}
          />
          <label htmlFor="resume-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </span>
            </Button>
          </label>
          <p className="text-xs text-gray-500">
            Supported formats: PDF, DOCX • Max size: 10MB
          </p>
        </div>
      )}
    </div>
  );
};
