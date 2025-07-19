import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadProgress {
  percentage: number;
  step: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
}

export interface ParsedResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  summary?: string;
  workExperience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }>;
  education?: Array<{
    degree: string;
    school: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    url?: string;
  }>;
}

export interface UploadResult {
  success: boolean;
  resumeId?: string;
  atsScore?: number;
  parsedData?: ParsedResumeData;
  error?: string;
}

export const useResumeUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    step: 'preparing',
    status: 'uploading'
  });
  const { toast } = useToast();

  const uploadResume = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress({ percentage: 0, step: 'Preparing upload...', status: 'uploading' });

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please log in to upload a resume');
      }

      // Validate file
      if (!file) {
        throw new Error('Please select a file to upload');
      }

      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or Word document');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      setProgress({ percentage: 10, step: 'Uploading file...', status: 'uploading' });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      // Call upload-resume edge function
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        setProgress({ percentage: 100, step: 'Upload completed!', status: 'completed' });
        toast({
          title: "Resume uploaded successfully!",
          description: `ATS Score: ${result.atsScore}/100`,
        });
        
        return {
          success: true,
          resumeId: result.resumeId,
          atsScore: result.atsScore,
          parsedData: result.parsedData
        };
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setProgress({ percentage: 0, step: errorMessage, status: 'failed' });
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUploading(false);
    }
  };

  const checkUploadStatus = async (statusId: string) => {
    try {
      const { data, error } = await supabase
        .from('resume_upload_status')
        .select('*')
        .eq('id', statusId)
        .single();

      if (error) throw error;

      setProgress({
        percentage: data.progress_percentage || 0,
        step: data.current_step || 'Processing...',
        status: data.upload_status as 'uploading' | 'processing' | 'completed' | 'failed'
      });

      return data;
    } catch (error) {
      console.error('Error checking upload status:', error);
      return null;
    }
  };

  const resetProgress = () => {
    setProgress({ percentage: 0, step: 'preparing', status: 'uploading' });
    setIsUploading(false);
  };

  return {
    uploadResume,
    checkUploadStatus,
    resetProgress,
    isUploading,
    isProcessing: isUploading,
    uploadSuccess: progress.status === 'completed',
    processingStep: progress.step,
    processingSteps: ['Upload', 'Parse', 'Analyze', 'Complete'],
    processResume: uploadResume,
    resetUpload: resetProgress,
    progress
  };
};