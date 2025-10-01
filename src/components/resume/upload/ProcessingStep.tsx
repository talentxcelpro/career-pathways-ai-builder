import React, { useEffect, useState } from 'react';
import { ProcessingSteps } from '@/components/resume/checker/ProcessingSteps';
import { EnhancedResumeExtractor, EnhancedParsingResult } from '@/utils/enhancedResumeExtraction';
import { ParsingFeedback } from './ParsingFeedback';
import { EmptyDataGuidance } from './EmptyDataGuidance';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProcessingStepProps {
  onProcessingComplete: (data: any) => void;
  uploadedFile: File | null;
  selectedTemplate: string;
  onRetryProcessing?: () => void;
  onUploadNew?: () => void;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  onProcessingComplete,
  uploadedFile,
  selectedTemplate,
  onRetryProcessing,
  onUploadNew
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showEmptyDataGuidance, setShowEmptyDataGuidance] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [currentProgress, setCurrentProgress] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [extractionMethod, setExtractionMethod] = useState('standard');

  const processingSteps = [
    'Validating file...',
    'Extracting text content...',
    'Advanced text extraction...',
    'AI-powered parsing with NLP...',
    'Structure analysis & validation...',
    'ATS optimization & scoring...',
    'Generating enhancement suggestions...',
    'Finalizing enhanced resume...'
  ];

  useEffect(() => {
    if (uploadedFile) {
      processResume();
    }
  }, [uploadedFile]);

  const processResume = async () => {
    if (!uploadedFile) return;

    try {
      setProcessingError(null);
      console.log('🚀 Starting enhanced resume parsing...');
      
      // Use the new enhanced parser with progress tracking
      const result: EnhancedParsingResult = await EnhancedResumeExtractor.parseResumeWithFallbacks(
        uploadedFile,
        (step: string, progress: number) => {
          setCurrentProgress(step);
          const stepIndex = Math.floor((progress / 100) * (processingSteps.length - 1));
          setCurrentStep(stepIndex);
        }
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to parse resume');
      }

      console.log('✅ Enhanced parsing completed successfully');
      
      // Store raw extraction details for guidance
      setExtractedText(result.data!.raw_text);
      setExtractionMethod(result.data!.key_metrics.extraction_method || 'standard');
      
      // Check if data is meaningful
      const hasData = result.data!.structured_resume.name.trim() || 
                     result.data!.structured_resume.email.trim() ||
                     result.data!.structured_resume.work_experience.length > 0 ||
                     result.data!.structured_resume.education.length > 0;
      
      if (!hasData) {
        setShowEmptyDataGuidance(true);
        setProcessingComplete(true);
        // Still pass the data for debugging but show guidance
        const emptyDataResult = {
          enhancedContent: {
            personalInfo: {
              fullName: '',
              email: '',
              phone: '',
              location: '',
              linkedin: '',
              github: '',
              portfolio: ''
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            certifications: [],
            projects: [],
            languages: []
          },
          isEmpty: true,
          extractedText: result.data!.raw_text,
          extractionMethod: result.data!.key_metrics.extraction_method
        };
        setParsedData(emptyDataResult);
        onProcessingComplete(emptyDataResult);
        return;
      }
      
      // Transform the parsed data to match expected format
      const transformedData = {
        enhancedContent: {
          personalInfo: {
            fullName: result.data!.structured_resume.name,
            email: result.data!.structured_resume.email,
            phone: result.data!.structured_resume.phone,
            location: result.data!.structured_resume.location,
            linkedin: result.data!.structured_resume.linkedin,
            github: result.data!.structured_resume.github,
            portfolio: result.data!.structured_resume.portfolio
          },
          summary: result.data!.structured_resume.summary,
          experience: result.data!.structured_resume.work_experience.map((exp, index) => ({
            id: `exp-${index}`,
            title: exp.title,
            company: exp.company,
            location: exp.location,
            startDate: exp.duration.split('-')[0]?.trim() || '',
            endDate: exp.duration.split('-')[1]?.trim() || 'Present',
            current: exp.duration.toLowerCase().includes('present') || exp.duration.toLowerCase().includes('current'),
            description: exp.description,
            achievements: exp.achievements || []
          })),
          education: result.data!.structured_resume.education.map((edu, index) => ({
            id: `edu-${index}`,
            degree: edu.degree,
            school: edu.institution,
            location: edu.location,
            startDate: edu.duration.split('-')[0]?.trim() || '',
            endDate: edu.duration.split('-')[1]?.trim() || '',
            gpa: ''
          })),
          skills: Object.values(result.data!.structured_resume.skills).flat().map((skill, index) => ({
            id: `skill-${index}`,
            name: skill,
            category: 'technical' as const,
            level: 'intermediate' as const
          })),
          certifications: result.data!.structured_resume.certifications,
          projects: result.data!.structured_resume.projects,
          languages: result.data!.structured_resume.languages
        },
        enhancementScore: {
          atsCompatibility: result.data!.ats_compatibility?.score || 0,
          readabilityScore: result.data!.content_quality?.overall_score || 0,
          keywordDensity: result.data!.ats_compatibility?.keyword_density || 0,
          formatConsistency: result.data!.ats_compatibility?.format_score || 0
        },
        recommendations: [
          'Add more quantified achievements to work experience',
          'Include relevant keywords for your target role',
          'Consider adding a skills section if missing',
          'Ensure consistent date formatting throughout'
        ],
        aiEnhancements: {
          contentImprovements: [],
          structuralSuggestions: [],
          atsOptimizations: []
        },
        selectedTemplate: selectedTemplate,
        rawExtractedText: result.data!.raw_text,
        processingMetrics: {
          confidenceScore: result.data!.key_metrics.confidence_score,
          processingTime: Date.now(),
          extractionMethod: result.data!.key_metrics.extraction_method || 'ai-enhanced',
          yearsExperience: result.data!.key_metrics.years_experience,
          completenessPercentage: result.data!.key_metrics.completeness_percentage
        },
        fieldConfidence: result.data!.field_confidence,
        atsCompatibility: result.data!.ats_compatibility,
        contentQuality: result.data!.content_quality
      };

      setParsedData(transformedData);
      setProcessingComplete(true);
      // Call completion handler immediately - wizard will handle navigation
      setTimeout(() => onProcessingComplete(transformedData), 100);

    } catch (error) {
      console.error('❌ Resume processing failed:', error);
      setProcessingError(error.message);
      
      // Create fallback data structure for graceful degradation
      const fallbackData = {
        enhancedContent: {
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            portfolio: ''
          },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          certifications: [],
          projects: [],
          languages: []
        },
        enhancementScore: {
          atsCompatibility: 0,
          readabilityScore: 0,
          keywordDensity: 0,
          formatConsistency: 0
        },
        recommendations: [
          'Unable to parse resume automatically',
          'Please manually enter your information',
          'Consider using a different file format or ensure the file is text-based'
        ],
        error: error.message,
        processingMetrics: {
          confidenceScore: 0,
          extractionMethod: 'failed'
        }
      };

      setParsedData(fallbackData);
      onProcessingComplete(fallbackData);
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Show empty data guidance
  if (processingComplete && showEmptyDataGuidance && parsedData) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Resume Processed, But No Data Found
            </h3>
            <p className="text-gray-600 mb-4">
              We processed your file successfully, but couldn't extract meaningful resume content.
            </p>
          </div>
        </div>
        
        <EmptyDataGuidance 
          extractedText={extractedText}
          extractionMethod={extractionMethod}
          onRetry={() => {
            setShowEmptyDataGuidance(false);
            setProcessingComplete(false);
            setProcessingError(null);
            setCurrentStep(0);
            processResume();
          }}
          onUploadNew={() => {
            onUploadNew?.();
          }}
        />
      </div>
    );
  }

  // Show feedback form after successful parsing
  if (processingComplete && !processingError && !showEmptyDataGuidance && showFeedback && parsedData) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Resume Processed Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your resume has been parsed using advanced AI. Help us improve by providing feedback.
            </p>
          </div>
        </div>
        
        <ParsingFeedback 
          resumeData={parsedData}
          onFeedbackSubmitted={() => setShowFeedback(false)}
        />

        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowFeedback(false)}
          >
            Skip Feedback
          </Button>
        </div>
      </div>
    );
  }

  // Show processing indicator while waiting for navigation
  if (processingComplete && !processingError && !showEmptyDataGuidance) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Parsing Complete!
          </h3>
          <p className="text-gray-600 mb-4">
            Preparing your resume...
          </p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (processingError) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Processing Error
          </h3>
          <p className="text-gray-600 mb-4">
            {processingError}
          </p>
          <Button 
            onClick={() => {
              setProcessingError(null);
              setCurrentStep(0);
              processResume();
            }}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProcessingSteps
        steps={processingSteps}
        currentStep={currentStep}
        fileName={uploadedFile?.name || 'resume'}
      />
      {currentProgress && (
        <div className="text-center">
          <p className="text-sm text-gray-600">{currentProgress}</p>
        </div>
      )}
    </div>
  );
};