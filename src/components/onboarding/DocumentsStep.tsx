import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';

interface DocumentsStepProps {
  data: {
    resumeUrl: string | null;
  };
  updateData: (updates: any) => void;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ data, updateData }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  const { uploadFile } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadFile(file, `resume-${user.id}-${Date.now()}.${file.name.split('.').pop()}`);
      updateData({ resumeUrl: fileUrl });
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Upload Resume (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your resume to get AI-powered insights and personalized recommendations
        </p>
        
        {data.resumeUrl ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">Resume uploaded successfully!</p>
              <p className="text-sm text-green-700 dark:text-green-300">You can update it anytime from your profile</p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <p className="font-medium mb-1">Upload your resume</p>
                <p className="text-sm text-muted-foreground">PDF or Word document (max 10MB)</p>
              </div>
              
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              
              <Button asChild disabled={isUploading}>
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </label>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => updateData({ resumeUrl: 'skipped' })}>
                Skip for now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
