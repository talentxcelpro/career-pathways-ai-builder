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
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-xs rounded-2xl">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <File className="h-4 w-4 text-blue-600" />
          Resume Document
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">Upload your latest resume for direct ATS verification and recruiter search</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5">
        <div className="space-y-3">
          {resumeUrl && (
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Active Resume Linked
                    </p>
                    <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400 font-mono">
                      {getFileNameFromUrl(resumeUrl)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(resumeUrl, '_blank')}
                    className="h-7 px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/50 rounded-lg"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40 rounded-xl p-4 sm:p-5 text-center hover:border-slate-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onResumeUpload}
              className="hidden"
              id="resume-upload"
            />
            
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl flex items-center justify-center">
                <Upload className="h-4 w-4" />
              </div>
              
              <div>
                <Button 
                  size="sm"
                  disabled={uploading}
                  onClick={handleButtonClick}
                  className="h-8 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {uploading ? 'Uploading...' : resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                </Button>
                
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  PDF, DOC, or DOCX (max 50MB)
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};