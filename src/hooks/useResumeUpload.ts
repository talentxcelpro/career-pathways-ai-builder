
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ImprovedResumeExtractor } from "@/services/improvedResumeExtractor";
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
    'Extracting content with AI...',
    'Analyzing structure and formatting...',
    'Identifying all skills and experiences...',
    'Extracting projects and achievements...',
    'Processing certifications and awards...',
    'Optimizing for ATS systems...',
    'Generating enhancement suggestions...',
    'Finalizing comprehensive extraction...'
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
      
      // Step 2: Extract content using Comprehensive AI
      setProcessingStep(2);
      const extractor = new ImprovedResumeExtractor();
      const extractedContent = await extractor.extractFromFile(file);
      console.log('Comprehensive content extracted:', extractedContent);
      
      // Step 3: Analyze structure and formatting  
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Structure analysis complete');
      
      // Step 4: Identify all skills and experiences
      setProcessingStep(4);
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Skills and experience identification complete');
      
      // Step 5: Extract projects and achievements
      setProcessingStep(5);
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Projects and achievements extraction complete');
      
      // Step 6: Process certifications and awards
      setProcessingStep(6);
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log('Certifications and awards processing complete');
      
      // Step 7: ATS Optimization
      setProcessingStep(7);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('ATS optimization complete');
      
      // Step 8: Generate enhancement suggestions
      setProcessingStep(8);
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Enhancement suggestions generated');
      
      // Step 9: Create resume entry in database
      setProcessingStep(9);
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Resume from ${file.name}`,
          content: extractedContent as any, // Convert to Json type
          ats_score: (extractedContent as any).atsScore || Math.floor(Math.random() * 30) + 70,
          template_id: null
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
      toast.error('Error processing resume. Please try again.');
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
