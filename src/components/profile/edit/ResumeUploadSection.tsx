import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>Upload your latest resume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resumeUrl && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Resume uploaded successfully
              </p>
              <a 
                href={resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View current resume
              </a>
            </div>
          )}
          <div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onResumeUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload">
              <Button variant="outline" className="cursor-pointer" disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX (max 50MB)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};