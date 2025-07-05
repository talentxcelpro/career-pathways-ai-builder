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
      // Step 1: Validate current session
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error('Failed to get current user:', userError);
        throw new Error(`Session validation failed: ${userError?.message || 'No user found'}`);
      }
      
      console.log('Current authenticated user:', currentUser.id);
      
      // Step 2: Ensure profile exists (required for RLS)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating one...');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
            user_role: 'candidate'
          });
        
        if (createProfileError) {
          console.error('Failed to create profile:', createProfileError);
          throw new Error(`Profile creation failed: ${createProfileError.message}`);
        }
        
        // Wait for profile creation to propagate
        await new Promise(resolve => setTimeout(resolve, 200));
      } else if (profileError) {
        console.error('Profile query error:', profileError);
        throw new Error(`Profile verification failed: ${profileError.message}`);
      }
      
      // Step 3: Create upload status with retry logic
      const { data, error } = await supabase
        .from('resume_upload_status')
        .insert({
          user_id: currentUser.id,
          file_name: fileName,
          file_url: fileUrl,
          upload_status: 'uploading',
          current_step: 'upload',
          progress_percentage: 10
        })
        .select()
        .single();

      if (error) {
        console.error('Upload status creation error:', error);
        
        // Check if it's an RLS error and we should retry
        if (error.message?.includes('row-level security') && retryAttempt < 2) {
          console.log(`RLS error detected, retrying in ${(retryAttempt + 1) * 500}ms...`);
          await new Promise(resolve => setTimeout(resolve, (retryAttempt + 1) * 500));
          return createUploadStatus(fileName, fileUrl, retryAttempt + 1);
        }
        
        // Provide specific error messages
        if (error.message?.includes('row-level security')) {
          throw new Error('Database access denied. Your session may have expired. Please refresh the page and try again.');
        }
        
        throw new Error(`Database operation failed: ${error.message}`);
      }

      console.log('Upload status created successfully:', data.id);
      return data.id;
      
    } catch (error: any) {
      // If it's our custom error, re-throw it
      if (error.message?.includes('Session validation failed') || 
          error.message?.includes('Profile creation failed') ||
          error.message?.includes('Database access denied')) {
        throw error;
      }
      
      // For unexpected errors, provide context
      console.error('Unexpected error in createUploadStatus:', error);
      throw new Error(`Upload initialization failed: ${error.message}`);
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