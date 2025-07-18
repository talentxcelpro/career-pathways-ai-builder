
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Upload, 
  FileCheck, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  TrendingUp,
  FileText,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { ResumeScoreCard } from '@/components/resume/checker/ResumeScoreCard';
import { ScoreBreakdown } from '@/components/resume/checker/ScoreBreakdown';
import { JobTailoringSection } from '@/components/resume/checker/JobTailoringSection';
import { ResumePreview } from '@/components/resume/checker/ResumePreview';
import { ProcessingSteps } from '@/components/resume/checker/ProcessingSteps';

interface ResumeAnalysis {
  overallScore: number;
  atsScore: number;
  contentScore: number;
  sectionsScore: number;
  designScore: number;
  issues: {
    quantifyImpact: number;
    repetition: number;
    spelling: number;
    fileFormat: boolean;
    design: boolean;
  };
  strengths: string[];
  improvements: string[];
  extractedData: any;
  jobTailoring?: {
    matchScore: number;
    keywords: string[];
    suggestions: string[];
  };
}

const ResumeChecker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);

  const processingSteps = [
    'Uploading your resume...',
    'Parsing resume content...',
    'Analyzing experience and skills...',
    'Checking ATS compatibility...',
    'Calculating scores...',
    'Generating recommendations...'
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    
    if (!uploadedFile) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      toast.error('Please upload a PDF or DOCX file only');
      return;
    }
    
    // Validate file size (2MB)
    if (uploadedFile.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    
    setFile(uploadedFile);
    processResume(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024
  });

  const processResume = async (file: File) => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    try {
      // Simulate processing steps
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Mock analysis results - in real implementation, this would call your AI service
      const mockAnalysis: ResumeAnalysis = {
        overallScore: 73,
        atsScore: 100,
        contentScore: 65,
        sectionsScore: 85,
        designScore: 45,
        issues: {
          quantifyImpact: 2,
          repetition: 0,
          spelling: 0,
          fileFormat: file.type !== 'application/pdf',
          design: true
        },
        strengths: [
          'ATS parsing successful at 100%',
          'All essential sections present',
          'Professional contact information',
          'No spelling or grammar errors'
        ],
        improvements: [
          'Add quantifiable achievements to experience bullets',
          'Use PDF format for better ATS compatibility',
          'Consider a more modern resume design',
          'Include more specific technical skills'
        ],
        extractedData: {
          name: 'Sample User',
          email: 'user@example.com',
          phone: '+1-234-567-8900',
          experience: [
            {
              title: 'Software Engineer',
              company: 'Tech Corp',
              duration: '2020-2023',
              description: 'Developed web applications and collaborated with team members'
            }
          ]
        }
      };
      
      setAnalysis(mockAnalysis);
      toast.success('Resume analysis completed!');
    } catch (error) {
      console.error('Resume processing error:', error);
      toast.error('Failed to process resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeJobTailoring = async () => {
    if (!jobDescription.trim() || !analysis) return;
    
    setIsAnalyzingJob(true);
    try {
      // Mock job tailoring analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const jobTailoring = {
        matchScore: 78,
        keywords: ['React', 'JavaScript', 'Node.js', 'AWS', 'Agile'],
        suggestions: [
          'Add "React" to your skills section',
          'Mention "Agile methodology" in your experience',
          'Include specific AWS services you\'ve used',
          'Quantify your JavaScript development experience'
        ]
      };
      
      setAnalysis(prev => prev ? { ...prev, jobTailoring } : null);
      toast.success('Job tailoring analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze job description');
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  const useSampleJobPost = () => {
    const sampleJob = `Software Engineer - Frontend
    
We are looking for a skilled Frontend Developer to join our team. The ideal candidate will have:

• 3+ years of experience with React and JavaScript
• Experience with modern frontend frameworks and libraries
• Knowledge of responsive design and CSS preprocessors
• Familiarity with version control systems (Git)
• Experience with Agile development methodologies
• Understanding of web performance optimization
• Bachelor's degree in Computer Science or related field

Nice to have:
• Experience with TypeScript
• Knowledge of Node.js and backend technologies
• AWS cloud platform experience
• Experience with testing frameworks (Jest, Cypress)`;

    setJobDescription(sampleJob);
  };

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ProcessingSteps 
          steps={processingSteps} 
          currentStep={processingStep}
          fileName={file?.name || ''}
        />
      </div>
    );
  }

  if (!file || !analysis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resume Checker
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Is your resume good enough?
          </p>
          <p className="text-gray-600">
            A free and fast AI resume checker doing 16 crucial checks to ensure your resume is ready to perform and get you interview callbacks.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your resume here or choose a file
              </h3>
              <p className="text-gray-600 mb-4">
                PDF & DOCX only. Max 2MB file size.
              </p>
              <Button size="lg" className="mb-4">
                Upload Your Resume
              </Button>
              <p className="text-sm text-gray-500">
                Privacy guaranteed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resume Analysis Report
        </h1>
        <p className="text-gray-600">
          {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score */}
          <ResumeScoreCard score={analysis.overallScore} />
          
          {/* Score Breakdown */}
          <ScoreBreakdown 
            atsScore={analysis.atsScore}
            contentScore={analysis.contentScore}
            sectionsScore={analysis.sectionsScore}
            designScore={analysis.designScore}
            issues={analysis.issues}
          />
          
          {/* Job Tailoring */}
          <JobTailoringSection
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onAnalyze={analyzeJobTailoring}
            isAnalyzing={isAnalyzingJob}
            onUseSample={useSampleJobPost}
            tailoringData={analysis.jobTailoring}
          />
          
          {/* Detailed Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">{improvement}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <ResumePreview data={analysis.extractedData} />
          
          {/* Actions */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Button className="w-full" size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Build an ATS-friendly Resume
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Download Improved Resume
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeChecker;
