
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

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:type/subtype;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const useResumeUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    step: 'preparing',
    status: 'uploading'
  });
  const { toast } = useToast();

  const uploadResume = async (file: File): Promise<UploadResult> => {
    console.log('🚀 Starting resume upload process...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    setIsUploading(true);
    setProgress({ percentage: 10, step: 'Preparing upload...', status: 'uploading' });

    try {
      // Check authentication first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('❌ Authentication error:', userError);
        throw new Error('Authentication failed. Please log in and try again.');
      }
      
      if (!user) {
        throw new Error('Please log in to upload a resume');
      }
      
      console.log('✅ User authenticated:', user.id);

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

      setProgress({ percentage: 25, step: 'Converting file...', status: 'uploading' });

      // Convert file to base64
      console.log('🔄 Converting file to base64...');
      const fileBase64 = await fileToBase64(file);
      
      setProgress({ percentage: 50, step: 'Uploading to server...', status: 'processing' });

      // Prepare JSON payload
      const payload = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: fileBase64,
        userId: user.id
      };

      console.log('📤 Calling upload-resume edge function...', {
        fileName: payload.fileName,
        fileType: payload.fileType,
        fileSize: payload.fileSize,
        userId: payload.userId
      });

      // Call upload-resume edge function with timeout
      const uploadPromise = supabase.functions.invoke('upload-resume', {
        body: payload
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout - please try again')), 30000);
      });

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

      console.log('📨 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Upload error from edge function:', error);
        throw new Error(error.message || 'Upload failed - please try again');
      }

      if (!data) {
        throw new Error('No response from server - please try again');
      }

      if (data.success) {
        setProgress({ percentage: 100, step: 'Upload completed!', status: 'completed' });
        
        console.log('✅ Upload successful:', {
          resumeId: data.resumeId,
          atsScore: data.atsScore
        });
        
        toast({
          title: "Resume uploaded successfully!",
          description: `ATS Score: ${data.atsScore}/100`,
        });
        
        return {
          success: true,
          resumeId: data.resumeId,
          atsScore: data.atsScore,
          parsedData: data.parsedData
        };
      } else {
        throw new Error(data.error || 'Upload failed - server error');
      }

    } catch (error) {
      console.error('💥 Upload failed with error:', error);
      
      let errorMessage = 'Upload failed - please try again';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
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

  const resetProgress = () => {
    setProgress({ percentage: 0, step: 'preparing', status: 'uploading' });
    setIsUploading(false);
  };

  return {
    uploadResume,
    resetProgress,
    isUploading,
    isProcessing: isUploading,
    uploadSuccess: progress.status === 'completed',
    processingStep: progress.step,
    processingSteps: ['Preparing', 'Converting', 'Uploading', 'Processing', 'Analyzing', 'Complete'],
    processResume: uploadResume,
    resetUpload: resetProgress,
    progress
  };
};
