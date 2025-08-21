import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, CheckCircle, X } from "lucide-react";

interface ResumeUploadSectionProps {
  resumeUrl: string;
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploading: boolean;
}

export const ResumeUploadSection: React.FC<ResumeUploadSectionProps> = ({ 
  resumeUrl, 
  onResumeUpload, 
  uploading 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const segments = url.split('/');
      const fileName = segments[segments.length - 1];
      // Remove any query parameters
      return fileName.split('?')[0];
    } catch {
      return 'resume.pdf';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Resume
        </CardTitle>
        <CardDescription>Upload your latest resume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resumeUrl && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Resume uploaded successfully
                    </p>
                    <p className="text-xs text-green-600">
                      {getFileNameFromUrl(resumeUrl)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(resumeUrl, '_blank')}
                    className="text-green-700 border-green-300 hover:bg-green-100"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onResumeUpload}
              className="hidden"
              id="resume-upload"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              
              <div>
                <Button 
                  variant="outline" 
                  className="cursor-pointer" 
                  disabled={uploading}
                  onClick={handleButtonClick}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                </Button>
                
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX (max 50MB)
                </p>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Drag and drop your resume here, or click to browse</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};