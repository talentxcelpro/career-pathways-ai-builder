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
      const extractedText = await extractor.extractText(file);

      console.log('✅ Text extracted:', { textLength: extractedText.length });
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Unable to extract sufficient text from the resume. Please try a different file format.');
      }

      // Step 4: Create initial resume entry
      progressCallback(30, 'Creating resume entry...');
      const { data: resumeEntry, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: `Resume from ${file.name}`,
          content: { raw_text: extractedText },
          is_public: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (resumeError) {
        console.error('❌ Resume entry creation error:', resumeError);
        throw new Error(`Failed to create resume entry: ${resumeError.message}`);
      }

      console.log('✅ Resume entry created:', resumeEntry.id);

      // Step 5: Comprehensive AI extraction
      progressCallback(50, 'Processing with comprehensive AI extraction...');
      
      const { data: extractionResult, error: extractionError } = await supabase.functions.invoke('comprehensive-resume-extractor', {
        body: {
          text: extractedText,
          fileName: file.name,
          fileType: file.type,
          userId: user.id,
          resumeId: resumeEntry.id,
          industryType: 'general', // Can be enhanced with industry detection
          extractionLevel: 'comprehensive'
        }
      });

      if (extractionError) {
        console.error('❌ Comprehensive extraction error:', extractionError);
        throw new Error(`Comprehensive extraction failed: ${extractionError.message}`);
      }

      if (!extractionResult.success) {
        console.error('❌ Comprehensive extraction failed:', extractionResult.error);
        throw new Error(`Comprehensive extraction failed: ${extractionResult.error}`);
      }

      const extractedContent = extractionResult.data;
      console.log('✅ Comprehensive extraction completed:', {
        personalInfo: !!extractedContent.personalInfo?.fullName,
        experienceCount: extractedContent.experience?.length || 0,
        educationCount: extractedContent.education?.length || 0,
        skillsCount: extractedContent.technicalSkills?.programmingLanguages?.length || 0,
        overallConfidence: extractedContent.qualityAssessment?.overallQuality || 0.88
      });

      setExtractedData(extractedContent);
      
      // Step 6: Generate enhanced live preview
      progressCallback(75, 'Generating enhanced preview...');
      const preview = generateEnhancedPreview(extractedContent);
      setLivePreview(preview);
      console.log('✅ Enhanced preview generated:', preview);
      
      // Step 7: Update resume with structured content
      progressCallback(85, 'Updating resume with structured content...');
      
      // Convert comprehensive data to resume builder format
      const resumeBuilderContent = mapToResumeBuilderFormat(extractedContent);
      
      const { error: updateError } = await supabase
        .from('resumes')
        .update({
          content: resumeBuilderContent,
          completion_percentage: extractedContent.qualityAssessment?.completenessScore * 100 || 85,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeEntry.id);
      
      if (updateError) {
        console.error('❌ Resume update error:', updateError);
        throw new Error(`Failed to update resume: ${updateError.message}`);
      }
      
      console.log('✅ Resume updated with structured content');

      // Step 8: Create content blocks for detailed editing
      progressCallback(95, 'Creating content blocks...');
      await createContentBlocks(extractedContent, resumeEntry.id);
      
      const data = resumeEntry;
      
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

  const generateEnhancedPreview = (data: any) => {
    if (!data) return null;
    
    console.log('🎯 Generating enhanced preview from comprehensive data:', {
      hasPersonalInfo: !!data.personalInfo,
      experienceCount: data.experience?.length || 0,
      educationCount: data.education?.length || 0,
      technicalSkillsCount: data.technicalSkills?.programmingLanguages?.length || 0,
      overallConfidence: data.qualityAssessment?.overallQuality || 0.88
    });
    
    // Return enhanced preview data for rendering
    return {
      personalInfo: {
        fullName: data.personalInfo?.fullName || '',
        professionalTitle: data.personalInfo?.professionalTitle || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        summary: data.personalInfo?.summary || '',
        linkedin: data.personalInfo?.linkedin || '',
        github: data.personalInfo?.github || ''
      },
      experience: data.experience?.slice(0, 3).map((exp: any) => ({
        title: exp.jobTitle || '',
        company: exp.company || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || 'Present',
        description: exp.description || '',
        achievements: exp.achievements?.slice(0, 3) || [],
        technologies: exp.technologies?.slice(0, 5) || []
      })) || [],
      skills: {
        technical: [
          ...(data.technicalSkills?.programmingLanguages?.slice(0, 5).map((s: any) => s.skill) || []),
          ...(data.technicalSkills?.frameworks?.slice(0, 3).map((s: any) => s.skill) || []),
          ...(data.technicalSkills?.tools?.slice(0, 3).map((s: any) => s.skill) || [])
        ],
        soft: data.softSkills?.slice(0, 5).map((s: any) => s.skill) || []
      },
      education: data.education?.slice(0, 2).map((edu: any) => ({
        degree: edu.degree || '',
        school: edu.institution || '',
        endDate: edu.endDate || '',
        gpa: edu.gpa || '',
        honors: edu.honors || ''
      })) || [],
      projects: data.projects?.slice(0, 2).map((proj: any) => ({
        title: proj.title || '',
        description: proj.description || '',
        technologies: proj.technologies?.slice(0, 3) || []
      })) || [],
      certifications: data.certifications?.slice(0, 3).map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.issueDate || ''
      })) || [],
      metadata: data.extractionMetadata,
      qualityAssessment: data.qualityAssessment,
      atsScore: data.qualityAssessment?.atsCompatibility * 100 || 85,
      totalExperience: data.experience?.length || 0,
      totalEducation: data.education?.length || 0,
      totalProjects: data.projects?.length || 0,
      totalCertifications: data.certifications?.length || 0,
      extractionConfidence: data.qualityAssessment?.overallQuality || 0.88
    };
  };

  const mapToResumeBuilderFormat = (data: any) => {
    // Convert comprehensive extraction data to resume builder format
    return {
      personalInfo: {
        fullName: data.personalInfo?.fullName || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        summary: data.personalInfo?.summary || '',
        linkedin: data.personalInfo?.linkedin || '',
        github: data.personalInfo?.github || '',
        website: data.personalInfo?.website || ''
      },
      experience: data.experience?.map((exp: any) => ({
        id: crypto.randomUUID(),
        title: exp.jobTitle || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.endDate === 'Present' || exp.endDate === '',
        description: exp.description || '',
        achievements: exp.achievements || [],
        technologies: exp.technologies || []
      })) || [],
      education: data.education?.map((edu: any) => ({
        id: crypto.randomUUID(),
        degree: edu.degree || '',
        school: edu.institution || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        gpa: edu.gpa || '',
        honors: edu.honors || ''
      })) || [],
      skills: {
        technical: [
          ...(data.technicalSkills?.programmingLanguages || []),
          ...(data.technicalSkills?.frameworks || []),
          ...(data.technicalSkills?.databases || []),
          ...(data.technicalSkills?.tools || []),
          ...(data.technicalSkills?.cloudPlatforms || [])
        ].map((skill: any) => ({
          skill: skill.skill || skill,
          proficiency: skill.proficiency || 'intermediate',
          category: skill.category || 'general'
        })),
        soft: data.softSkills?.map((s: any) => s.skill || s) || [],
        languages: data.languages || []
      },
      projects: data.projects?.map((proj: any) => ({
        id: crypto.randomUUID(),
        title: proj.title || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        achievements: proj.achievements || [],
        url: proj.url || '',
        github: proj.github || ''
      })) || [],
      certifications: data.certifications?.map((cert: any) => ({
        id: crypto.randomUUID(),
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.issueDate || '',
        url: cert.verificationUrl || ''
      })) || [],
      awards: data.awards?.map((award: any) => ({
        id: crypto.randomUUID(),
        name: award.name || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || ''
      })) || [],
      extractionMetadata: data.extractionMetadata,
      qualityAssessment: data.qualityAssessment,
      enhancementSuggestions: data.enhancementSuggestions || []
    };
  };

  const createContentBlocks = async (data: any, resumeId: string) => {
    const contentBlocks = [];

    // Personal info block
    if (data.personalInfo) {
      contentBlocks.push({
        resume_id: resumeId,
        section_type: 'personal_info',
        title: data.personalInfo.fullName,
        description: data.personalInfo.summary,
        raw_content: JSON.stringify(data.personalInfo),
        enhanced_content: data.personalInfo.summary,
        extraction_confidence: data.personalInfo.extractionConfidence || 0.95,
        order_index: 0
      });
    }

    // Experience blocks
    data.experience?.forEach((exp: any, index: number) => {
      contentBlocks.push({
        resume_id: resumeId,
        section_type: 'experience',
        title: exp.jobTitle,
        company: exp.company,
        description: exp.description,
        raw_content: JSON.stringify(exp),
        enhanced_content: exp.description,
        keywords: exp.keywords || [],
        achievements_data: { achievements: exp.achievements },
        technical_skills: { technologies: exp.technologies },
        extraction_confidence: exp.extractionConfidence || 0.90,
        order_index: index
      });
    });

    // Education blocks
    data.education?.forEach((edu: any, index: number) => {
      contentBlocks.push({
        resume_id: resumeId,
        section_type: 'education',
        title: edu.degree,
        company: edu.institution,
        description: `${edu.fieldOfStudy || ''} ${edu.gpa ? `(GPA: ${edu.gpa})` : ''}`.trim(),
        raw_content: JSON.stringify(edu),
        enhanced_content: edu.description || edu.fieldOfStudy,
        extraction_confidence: edu.extractionConfidence || 0.85,
        order_index: index
      });
    });

    // Skills block
    if (data.technicalSkills) {
      contentBlocks.push({
        resume_id: resumeId,
        section_type: 'skills',
        title: 'Technical Skills',
        description: 'Technical skills and competencies',
        raw_content: JSON.stringify(data.technicalSkills),
        technical_skills: data.technicalSkills,
        extraction_confidence: data.technicalSkills.extractionConfidence || 0.88,
        order_index: 0
      });
    }

    // Insert content blocks
    if (contentBlocks.length > 0) {
      const { error } = await supabase
        .from('resume_content_blocks')
        .insert(contentBlocks);

      if (error) {
        console.error('❌ Failed to create content blocks:', error);
      } else {
        console.log('✅ Created content blocks:', contentBlocks.length);
      }
    }
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
