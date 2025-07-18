import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";
import { OCRResumeProcessor } from "@/services/ocrResumeProcessor";
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
    'Analyzing document structure...',
    'Extracting content with AI...',
    'Parsing sections and data...',
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
        progressCallback(2, 'Configuring PDF processor...');
        await configurePDFWorker();
        console.log(`✅ PDF Worker Status: ${getPDFWorkerStatus()}`);
      }

      // Step 2: Upload file
      progressCallback(5, 'Uploading file to secure storage...');
      const fileUrl = await uploadFile(file, `resume-${Date.now()}.${file.name.split('.').pop()}`);
      console.log('File uploaded successfully:', fileUrl);
      
      // Step 3: Determine processing method
      const isImage = file.type.includes('image');
      const needsOCR = isImage || ocrMode || file.name.toLowerCase().includes('scan');
      
      progressCallback(10, needsOCR ? 'Preparing OCR processing...' : 'Preparing AI extraction...');
      
      let extractedContent;
      
      if (needsOCR) {
        // Use OCR for images and scanned documents
        progressCallback(15, 'Starting enhanced OCR processing...');
        const processor = new OCRResumeProcessor();
        extractedContent = await processor.processResumeWithOCR(file, progressCallback);
        await processor.cleanup();
      } else {
        // Use enhanced text extraction for PDFs and Word documents
        progressCallback(15, 'Starting enhanced text extraction...');
        const textExtractor = new ResumeTextExtractor();
        
        try {
          // Extract raw text
          progressCallback(30, 'Extracting text from document...');
          const rawText = await textExtractor.extractText(file);
          console.log(`✅ Text extracted: ${rawText.length} characters`);
          
          // Validate extraction quality
          const quality = textExtractor.getExtractionQuality(rawText);
          console.log(`📊 Extraction quality: ${quality.score}%, Issues: ${quality.issues.join(', ')}`);
          
          if (quality.score < 30) {
            console.warn('⚠️ Low extraction quality, falling back to OCR...');
            toast('Document extraction quality is low. Switching to OCR mode...', { 
              description: 'Using OCR for better accuracy' 
            });
            
            progressCallback(40, 'Switching to OCR processing...');
            const processor = new OCRResumeProcessor();
            extractedContent = await processor.processResumeWithOCR(file, progressCallback);
            await processor.cleanup();
          } else {
            // Process with AI extraction
            progressCallback(50, 'Processing with AI...');
            const processor = new OCRResumeProcessor();
            extractedContent = await processor.processResume(file);
            progressCallback(90, 'Finalizing extraction...');
          }
        } catch (textError) {
          console.warn('⚠️ Text extraction failed, falling back to OCR:', textError);
          toast('Text extraction failed. Switching to OCR mode...', {
            description: 'Trying alternative processing method'
          });
          
          progressCallback(40, 'Switching to OCR processing...');
          const processor = new OCRResumeProcessor();
          extractedContent = await processor.processResumeWithOCR(file, progressCallback);
          await processor.cleanup();
        }
      }
      
      console.log('Content processed successfully:', extractedContent);
      setExtractedData(extractedContent);
      
      // Generate live preview
      progressCallback(92, 'Generating live preview...');
      setLivePreview(generateLivePreview(extractedContent));
      
      // Step 4: Create enhanced resume entry in database
      progressCallback(95, 'Saving to database...');
      const { data, error } = await supabase
        .from('ai_resumes')
        .insert({
          user_id: user.id,
          title: `Enhanced Resume from ${file.name}`,
          content: extractedContent as any,
          ats_score: extractedContent.atsOptimization?.score || 75,
          template_id: null // Use null instead of string template ID
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
      toast.success('Resume processed successfully!');
      
      // Navigate to edit mode after a short delay
      setTimeout(() => {
        navigate(`/resume-builder/edit/${data.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error processing resume:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error processing resume. Please try again.';
      if (error.message?.includes('OCR')) {
        errorMessage = 'OCR processing failed. The document may be too complex or unclear. Try a higher quality scan.';
      } else if (error.message?.includes('AI extraction failed')) {
        errorMessage = 'Failed to extract resume content. The AI service may still be deploying. Please try again in a few minutes.';
      } else if (error.message?.includes('AI enhancement failed')) {
        errorMessage = 'Failed to enhance resume. The AI service may still be deploying. Please try again in a few minutes.';
      } else if (error.message?.includes('Database')) {
        errorMessage = 'Database error occurred. Please try again.';
      } else if (error.message?.includes('OpenAI API key')) {
        errorMessage = 'AI service configuration error. Please contact support.';
      } else if (error.message?.includes('template_id')) {
        errorMessage = 'Template configuration error. Using default template instead.';
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
    
    // Return plain object data for rendering in component
    return {
      personalInfo: data.personalInfo,
      experience: data.experience?.slice(0, 2),
      skills: data.skills?.technical ? Object.values(data.skills.technical).flat().slice(0, 10) : [],
      metadata: data.metadata,
      atsScore: data.atsOptimization?.score,
      totalExperience: data.experience?.length || 0
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