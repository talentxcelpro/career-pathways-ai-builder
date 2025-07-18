import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EnhancedResumeProcessor } from "@/services/resume-enhancer/EnhancedResumeProcessor";
import { ResumeTextExtractor } from "@/services/resumeTextExtractor";
import { configurePDFWorker, getPDFWorkerStatus } from "@/utils/pdfWorkerConfig";
import { toast } from "sonner";

export const useEnhancedResumeUpload = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [ocrMode, setOcrMode] = useState(false);
  const [livePreview, setLivePreview] = useState<any>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  const { uploadFile } = useFileUpload({
    bucket: 'resumes',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]
  });

  const processingSteps = [
    'Initializing upload...',
    'Uploading file to secure storage...',
    'Extracting text content...',
    'Enhanced AI parsing...',
    'Mapping data structures...',
    'Optimizing for ATS systems...',
    'Generating enhancement suggestions...',
    'Finalizing enhanced resume...'
  ];

  const progressCallback = useCallback((progress: number, status: string) => {
    setProcessingProgress(progress);
    setProcessingStatus(status);
    
    // Update step based on progress
    const step = Math.floor((progress / 100) * processingSteps.length);
    setProcessingStep(Math.min(step, processingSteps.length - 1));
  }, [processingSteps.length]);

  const processResume = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, text file, or image');
      return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingProgress(0);
    setProcessingStatus('Starting processing...');
    setLivePreview(null);
    
    try {
      // Step 1: Configure PDF worker for PDF files
      if (file.type === 'application/pdf') {
        progressCallback(5, 'Configuring PDF processor...');
        await configurePDFWorker();
        console.log(`✅ PDF Worker Status: ${getPDFWorkerStatus()}`);
      }

      // Step 2: Upload file
      progressCallback(10, 'Uploading file to secure storage...');
      const fileUrl = await uploadFile(file, `resume-${Date.now()}.${file.name.split('.').pop()}`);
      console.log('File uploaded successfully:', fileUrl);
      
      // Step 3: Extract text content
      progressCallback(20, 'Extracting text content...');
      const extractor = new ResumeTextExtractor();
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        extractedText = await extractor.extractFromPDF(file);
      } else if (file.type.includes('word')) {
        extractedText = await extractor.extractFromWord(file);
      } else if (file.type === 'text/plain') {
        extractedText = await extractor.extractFromText(file);
      } else if (file.type.includes('image')) {
        extractedText = await extractor.extractFromImage(file);
      }

      console.log('✅ Text extracted:', { textLength: extractedText.length });
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Unable to extract sufficient text from the resume. Please try a different file format.');
      }

      // Step 4: Enhanced AI parsing
      progressCallback(40, 'Processing with enhanced AI parsing...');
      
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          text: extractedText,
          fileName: file.name,
          fileType: file.type,
          userId: user.id
        }
      });

      if (parseError) {
        console.error('❌ AI parsing error:', parseError);
        throw new Error(`AI parsing failed: ${parseError.message}`);
      }

      if (!parseResult.success) {
        console.error('❌ AI parsing failed:', parseResult.error);
        throw new Error(`AI parsing failed: ${parseResult.error}`);
      }

      const extractedContent = parseResult.data;
      console.log('✅ Enhanced AI parsing completed:', {
        personalInfo: !!extractedContent.personalInfo?.fullName,
        experienceCount: extractedContent.experience?.length || 0,
        educationCount: extractedContent.education?.length || 0,
        skillsCount: extractedContent.skills?.technical?.length || 0
      });

      setExtractedData(extractedContent);
      
      // Step 5: Generate live preview
      progressCallback(70, 'Generating live preview...');
      const preview = generateLivePreview(extractedContent);
      setLivePreview(preview);
      console.log('✅ Live preview generated:', preview);
      
      // Step 6: Optimize for ATS
      progressCallback(85, 'Optimizing for ATS systems...');
      
      // Step 7: Create enhanced resume entry in database
      progressCallback(95, 'Saving to database...');
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Enhanced Resume from ${file.name}`,
          content: extractedContent as any,
          ats_score: extractedContent.atsOptimization?.score || 85,
          template_id: null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      console.log('Resume created in database:', data);
      
      progressCallback(100, 'Processing complete!');
      setUploadSuccess(true);
      toast.success('Resume processed successfully with enhanced AI parsing!');
      
      // Navigate to edit mode after a short delay
      setTimeout(() => {
        navigate(`/resume-builder/edit/${data.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing resume:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error processing resume. Please try again.';
      if (error.message?.includes('text')) {
        errorMessage = 'Unable to extract text from the file. Please ensure the file is readable and try again.';
      } else if (error.message?.includes('AI parsing failed')) {
        errorMessage = 'AI parsing failed. The document may be too complex. Please try a simpler format.';
      } else if (error.message?.includes('Database')) {
        errorMessage = 'Database error occurred. Please try again.';
      } else if (error.message?.includes('OpenAI API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStatus('');
    }
  };

  const generateLivePreview = (data: any) => {
    if (!data) return null;
    
    console.log('🎯 Generating live preview from data:', {
      hasPersonalInfo: !!data.personalInfo,
      experienceCount: data.experience?.length || 0,
      educationCount: data.education?.length || 0,
      skillsCount: data.skills?.technical?.length || 0
    });
    
    // Return structured preview data for rendering
    return {
      personalInfo: {
        fullName: data.personalInfo?.fullName || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        summary: data.personalInfo?.summary || ''
      },
      experience: data.experience?.slice(0, 3).map((exp: any) => ({
        title: exp.title || '',
        company: exp.company || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || exp.current ? 'Present' : '',
        description: exp.description || exp.achievements?.join('; ') || ''
      })) || [],
      skills: data.skills?.technical?.slice(0, 10).map((skill: any) => 
        typeof skill === 'string' ? skill : skill.skill
      ) || [],
      education: data.education?.slice(0, 2).map((edu: any) => ({
        degree: edu.degree || '',
        school: edu.school || '',
        endDate: edu.endDate || ''
      })) || [],
      metadata: data.metadata,
      atsScore: data.atsOptimization?.score || 0,
      totalExperience: data.experience?.length || 0,
      totalEducation: data.education?.length || 0
    };
  };

  const resetUpload = () => {
    setIsProcessing(false);
    setUploadSuccess(false);
    setProcessingStep(0);
    setProcessingProgress(0);
    setProcessingStatus('');
    setLivePreview(null);
    setExtractedData(null);
  };

  const toggleOCR = () => {
    setOcrMode(!ocrMode);
  };

  return {
    isProcessing,
    uploadSuccess,
    processingStep,
    processingSteps,
    processingProgress,
    processingStatus,
    ocrMode,
    livePreview,
    extractedData,
    processResume,
    resetUpload,
    toggleOCR
  };
};
