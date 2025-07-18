
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EnhancedResumeProcessor } from "@/services/resume-enhancer/EnhancedResumeProcessor";
import { toast } from "sonner";

export const useResumeUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const { uploadFile } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
  });

  const processingSteps = [
    'Uploading file...',
    'Advanced text extraction...',
    'AI-powered parsing with NLP...',
    'Structure analysis & validation...',
    'ATS optimization & scoring...',
    'Generating enhancement suggestions...',
    'Finalizing enhanced resume...'
  ];

  const processResume = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setIsProcessing(true);
    setProcessingStep(0);
    
    try {
      // Step 1: Upload file
      setProcessingStep(1);
      const fileUrl = await uploadFile(file, `resume-${Date.now()}.${file.name.split('.').pop()}`);
      console.log('File uploaded successfully:', fileUrl);
      
      // Step 2: Enhanced AI Processing
      setProcessingStep(2);
      const processor = new EnhancedResumeProcessor();
      const result = await processor.processResume(file, {
        targetRole: 'software_engineer',
        enhancementLevel: 'comprehensive'
      });
      console.log('Enhanced content processed:', result);
      
      // Step 3: Advanced structure analysis (built into processor)
      setProcessingStep(3);
      console.log('Structure analysis complete');
      
      // Step 4: ATS Optimization (built into processor) 
      setProcessingStep(4);
      console.log('ATS optimization complete - Score:', result.enhancementScore.atsCompatibility);
      
      // Step 5: Generate enhancement suggestions (built into processor)
      setProcessingStep(5);
      console.log('Enhancement suggestions generated:', result.recommendations.length);
      
      // Step 6: Create enhanced resume entry in database
      setProcessingStep(6);
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Enhanced Resume from ${file.name}`,
          content: result.enhancedContent as any, // Convert to Json type
          ats_score: result.enhancementScore.atsCompatibility || 75,
          template_id: null // Use null instead of string to avoid UUID errors
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      console.log('Resume created in database:', data);
      setUploadSuccess(true);
      toast.success('Resume processed successfully!');
      
      // Navigate to edit mode after a short delay
      setTimeout(() => {
        navigate(`/resume-builder/edit/${data.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing resume:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error processing resume. Please try again.';
      if (error.message?.includes('AI extraction failed')) {
        errorMessage = 'Failed to extract resume content. The AI service may still be deploying. Please try again in a few minutes.';
      } else if (error.message?.includes('AI enhancement failed')) {
        errorMessage = 'Failed to enhance resume. The AI service may still be deploying. Please try again in a few minutes.';
      } else if (error.message?.includes('Database')) {
        errorMessage = 'Database error occurred. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setIsProcessing(false);
    setUploadSuccess(false);
    setProcessingStep(0);
  };

  return {
    isProcessing,
    uploadSuccess,
    processingStep,
    processingSteps,
    processResume,
    resetUpload
  };
};
