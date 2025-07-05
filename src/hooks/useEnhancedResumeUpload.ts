import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProcessingStatus {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  error?: string;
  completed: boolean;
  statusId?: string;
  resumeId?: string;
}

export const useEnhancedResumeUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    currentStep: 'upload',
    progress: 0,
    completed: false
  });

  const uploadFile = async (file: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const filePath = `resumes/${fileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    return {
      path: data.path,
      url: supabase.storage.from('resumes').getPublicUrl(data.path).data.publicUrl
    };
  };

  const createUploadStatus = async (fileName: string, fileUrl: string, retryAttempt = 0): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log(`Creating upload status for user: ${user.id} (attempt ${retryAttempt + 1})`);
    
    try {
      // Step 1: Get fresh session and validate authentication with explicit token check
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.user || !session.access_token) {
        console.error('Session validation failed:', sessionError);
        
        // Try to refresh session if it's invalid
        if (retryAttempt === 0) {
          console.log('Attempting session refresh...');
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshedSession) {
            return createUploadStatus(fileName, fileUrl, 1);
          }
        }
        
        throw new Error('Session expired or invalid. Please refresh the page and log in again.');
      }
      
      console.log('Session validated:', {
        userId: session.user.id,
        hasAccessToken: !!session.access_token,
        tokenExpiry: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown'
      });
      
      // Step 2: Session warm-up - verify database recognizes our session
      const { data: sessionTest, error: sessionTestError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .limit(1);
        
      if (sessionTestError) {
        console.log('Database session not recognized, waiting for propagation...');
        // Exponential backoff: 100ms, 300ms, 800ms
        const delay = Math.min(100 * Math.pow(2.5, retryAttempt), 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (retryAttempt < 3) {
          return createUploadStatus(fileName, fileUrl, retryAttempt + 1);
        }
        throw new Error('Database session synchronization failed. Please refresh the page.');
      }
      
      // Step 3: Ensure profile exists (required for RLS)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating one...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
            user_role: 'candidate'
          });
        
        if (createProfileError) {
          console.error('Failed to create profile:', createProfileError);
          throw new Error(`Profile setup failed: ${createProfileError.message}`);
        }
        
        // Wait for profile creation to propagate
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (profileError) {
        console.error('Profile query error:', profileError);
        throw new Error(`Profile verification failed: ${profileError.message}`);
      }
      
      console.log('Profile verified, proceeding with upload status creation...');
      
      // Step 4: Create upload status with explicit user_id
      const uploadStatusData = {
        user_id: session.user.id,
        file_name: fileName,
        file_url: fileUrl,
        upload_status: 'uploading' as const,
        current_step: 'upload' as const,
        progress_percentage: 10
      };
      
      console.log('Inserting upload status...');
      
      const { data, error } = await supabase
        .from('resume_upload_status')
        .insert(uploadStatusData)
        .select()
        .single();

      if (error) {
        console.error('Upload status creation error:', error);
        
        // Handle RLS policy violations with intelligent retry
        if (error.message?.includes('row-level security') && retryAttempt < 3) {
          console.log(`RLS policy violation, retrying after ${100 * (retryAttempt + 1)}ms...`);
          await new Promise(resolve => setTimeout(resolve, 100 * (retryAttempt + 1)));
          return createUploadStatus(fileName, fileUrl, retryAttempt + 1);
        }
        
        // Provide specific error messages based on error type
        if (error.message?.includes('row-level security')) {
          throw new Error('Permission denied. Please refresh the page and try again.');
        }
        
        if (error.code === '23505') {
          throw new Error('Upload already in progress. Please wait or refresh the page.');
        }
        
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload status created successfully:', data.id);
      return data.id;
      
    } catch (error: any) {
      // Enhanced error handling with specific recovery suggestions
      console.error('createUploadStatus error:', error);
      
      if (error.message?.includes('Session expired') || 
          error.message?.includes('Permission denied') ||
          error.message?.includes('Database session synchronization failed')) {
        throw error; // Re-throw user-friendly errors as-is
      }
      
      // For unexpected errors, provide helpful context
      throw new Error(`Upload initialization failed. Please refresh the page and try again. (${error.message})`);
    }
  };

  const updateProgress = async (statusId: string, step: string, progress: number, status: string = 'processing') => {
    await supabase.rpc('update_upload_progress', {
      status_id: statusId,
      new_status: status,
      new_step: step,
      new_progress: progress
    });

    setProcessingStatus(prev => ({
      ...prev,
      currentStep: step,
      progress,
      isProcessing: status === 'processing'
    }));
  };

  const processWithAI = async (statusId: string, fileUrl: string, fileName: string) => {
    try {
      // Step 1: Extract content
      await updateProgress(statusId, 'extract', 25);
      
      const extractResponse = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          action: 'extract_content',
          file_url: fileUrl,
          file_name: fileName,
          user_id: user?.id,
          status_id: statusId
        }
      });

      if (extractResponse.error) {
        throw new Error(`Extraction failed: ${extractResponse.error.message}`);
      }

      const parsedResumeId = extractResponse.data.parsed_resume_id;
      await updateProgress(statusId, 'optimize', 50);

      // Step 2: ATS Optimization
      const optimizeResponse = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          action: 'optimize_ats',
          parsed_resume_id: parsedResumeId,
          user_id: user?.id,
          status_id: statusId
        }
      });

      if (optimizeResponse.error) {
        throw new Error(`ATS optimization failed: ${optimizeResponse.error.message}`);
      }

      await updateProgress(statusId, 'enhance', 75);

      // Step 3: Enhancement suggestions
      const enhanceResponse = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          action: 'generate_enhancements',
          parsed_resume_id: parsedResumeId,
          user_id: user?.id,
          status_id: statusId
        }
      });

      if (enhanceResponse.error) {
        throw new Error(`Enhancement failed: ${enhanceResponse.error.message}`);
      }

      await updateProgress(statusId, 'complete', 100, 'completed');

      // Create final resume
      const resumeResponse = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          action: 'create_resume',
          parsed_resume_id: parsedResumeId,
          user_id: user?.id,
          status_id: statusId
        }
      });

      if (resumeResponse.error) {
        throw new Error(`Resume creation failed: ${resumeResponse.error.message}`);
      }

      setProcessingStatus(prev => ({
        ...prev,
        completed: true,
        resumeId: resumeResponse.data.resume_id
      }));

      toast.success('Resume processed successfully!');
      
      // Navigate to editor after a short delay
      setTimeout(() => {
        navigate(`/resume/edit/${resumeResponse.data.resume_id}`);
      }, 2000);

    } catch (error: any) {
      console.error('AI processing error:', error);
      
      // Try to update status, but don't fail if it doesn't work
      try {
        await supabase.rpc('update_upload_progress', {
          status_id: statusId,
          new_status: 'failed',
          new_step: processingStatus.currentStep,
          new_progress: processingStatus.progress,
          error_msg: error.message
        });
      } catch (updateError: any) {
        console.error('Failed to update progress status:', updateError);
        // Don't throw this error, just log it
      }

      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message
      }));

      toast.error(`Processing failed: ${error.message}`);
    }
  };

  const processResume = useCallback(async (files: FileList) => {
    if (!files || files.length === 0 || !user) {
      console.error('No files or user not authenticated:', { files: !!files, user: !!user });
      return;
    }

    console.log('User authenticated:', { userId: user.id, userEmail: user.email });

    const file = files[0];
    
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and DOCX files are supported');
      return;
    }

    console.log('Starting resume processing for user:', user.id);

    setProcessingStatus({
      isProcessing: true,
      currentStep: 'upload',
      progress: 5,
      completed: false
    });

    try {
      // Upload file
      console.log('Uploading file...');
      const { url: fileUrl } = await uploadFile(file);
      console.log('File uploaded successfully:', fileUrl);
      
      // Create upload status record
      console.log('Creating upload status...');
      const statusId = await createUploadStatus(file.name, fileUrl);
      console.log('Upload status created:', statusId);
      
      setProcessingStatus(prev => ({
        ...prev,
        statusId
      }));

      // Process with AI
      console.log('Starting AI processing...');
      await processWithAI(statusId, fileUrl, file.name);

    } catch (error: any) {
      console.error('Upload error:', error);
      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message
      }));
      
      // Provide specific error feedback
      if (error.message?.includes('Database access denied') || 
          error.message?.includes('Session validation failed') ||
          error.message?.includes('Profile creation failed')) {
        toast.error(error.message);
      } else if (error.message?.includes('row-level security')) {
        toast.error('Database access error. Please refresh the page and try again.');
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
    }
  }, [user, navigate]);

  const resetUpload = useCallback(() => {
    setProcessingStatus({
      isProcessing: false,
      currentStep: 'upload',
      progress: 0,
      completed: false
    });
  }, []);

  return {
    processingStatus,
    processResume,
    resetUpload
  };
};