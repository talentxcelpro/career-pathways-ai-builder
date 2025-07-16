import React, { useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, File, X, FileText, Image, 
  CheckCircle, AlertCircle, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppleInspiredFileUploadProps {
  onFileSelect: (files: FileList | null) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
  className?: string;
}

export const AppleInspiredFileUpload: React.FC<AppleInspiredFileUploadProps> = ({
  onFileSelect,
  uploadedFile,
  onRemoveFile,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  }, [onFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    // Only set dragActive to false if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setIsDragOver(false);
    onFileSelect(e.dataTransfer.files);
  }, [onFileSelect]);

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (file.type.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-300 cursor-pointer group relative overflow-hidden",
          "bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl",
          dragActive || isDragOver
            ? "border-blue-500 bg-blue-50/80 shadow-blue-500/20" 
            : uploadedFile 
              ? "border-green-400 bg-green-50/80 shadow-green-500/20" 
              : "border-gray-300 hover:border-gray-400 hover:shadow-lg"
        )}
        onClick={uploadedFile ? undefined : handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Animated Background Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          (dragActive || isDragOver) && "opacity-100"
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse"></div>
        </div>

        <CardContent className="relative p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          
          {!uploadedFile ? (
            <div className="space-y-6">
              <div className={cn(
                "mx-auto w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                "bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-blue-500/25",
                dragActive && "scale-110 shadow-blue-500/40"
              )}>
                <Upload className="h-10 w-10 text-white" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {dragActive ? 'Drop your resume here' : 'Upload Your Resume'}
                </h3>
                <p className="text-gray-600 text-lg">
                  Drag and drop your file or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, TXT, and images up to 10MB
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { label: 'PDF', color: 'bg-red-100 text-red-700' },
                  { label: 'Word', color: 'bg-blue-100 text-blue-700' },
                  { label: 'Images', color: 'bg-green-100 text-green-700' },
                  { label: 'Text', color: 'bg-purple-100 text-purple-700' }
                ].map((format) => (
                  <Badge 
                    key={format.label} 
                    variant="secondary" 
                    className={cn("text-xs font-medium", format.color)}
                  >
                    {format.label}
                  </Badge>
                ))}
              </div>
              
              <Button 
                type="button" 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Choose File
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center">
                {getFileIcon(uploadedFile)}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">File Selected</h3>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <span className="font-semibold text-gray-900">{uploadedFile.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {getFileSize(uploadedFile.size)} • {uploadedFile.type.split('/').pop()?.toUpperCase()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {uploadedFile.type.includes('image') && (
                    <Badge className="bg-blue-100 text-blue-700">OCR Ready</Badge>
                  )}
                  <Badge className="bg-green-100 text-green-700">AI Processing</Badge>
                  <Badge className="bg-purple-100 text-purple-700">ATS Optimized</Badge>
                </div>
              </div>
              
              <div className="flex justify-center space-x-3">
                <Button
                  type="button"
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Process Resume
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onRemoveFile}
                  className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <FileText className="h-4 w-4" />, text: "Smart Parsing" },
          { icon: <Sparkles className="h-4 w-4" />, text: "AI Enhancement" },
          { icon: <CheckCircle className="h-4 w-4" />, text: "ATS Optimized" },
          { icon: <Image className="h-4 w-4" />, text: "OCR Support" }
        ].map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="p-1 bg-blue-100 rounded-md text-blue-600">
              {feature.icon}
            </div>
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};