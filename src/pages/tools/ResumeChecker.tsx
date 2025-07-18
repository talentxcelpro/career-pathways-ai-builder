
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from "@/contexts/AuthContext";
import { useResumeUpload } from "@/hooks/useResumeUpload";
import { ProcessingSteps } from '@/components/resume/checker/ProcessingSteps';
import { ResumeScoreCard } from '@/components/resume/checker/ResumeScoreCard';
import { ScoreBreakdown } from '@/components/resume/checker/ScoreBreakdown';
import { JobTailoringSection } from '@/components/resume/checker/JobTailoringSection';
import { ResumePreview } from '@/components/resume/checker/ResumePreview';
import { toast } from 'sonner';
import { Upload, FileCheck, ArrowLeft, Sparkles } from 'lucide-react';

interface ResumeAnalysisResult {
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
  resumeData: any;
}

interface JobTailoringData {
  matchScore: number;
  keywords: string[];
  suggestions: string[];
}

const ResumeChecker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProcessing, processingStep, processingSteps, processResume } = useResumeUpload();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [tailoringData, setTailoringData] = useState<JobTailoringData | undefined>();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setSelectedFile(file);
    
    // Simulate processing and analysis
    await processResume(files);
    
    // Mock analysis result - in real implementation, this would come from AI processing
    setTimeout(() => {
      const mockResult: ResumeAnalysisResult = {
        overallScore: 75,
        atsScore: 85,
        contentScore: 70,
        sectionsScore: 90,
        designScore: 65,
        issues: {
          quantifyImpact: 2,
          repetition: 0,
          spelling: 0,
          fileFormat: file.type !== 'application/pdf',
          design: true
        },
        resumeData: {
          name: 'Your Name',
          email: 'email@example.com',
          phone: 'Phone Number',
          experience: [
            {
              title: 'Software Engineer',
              company: 'Tech Company',
              duration: '2020-2023',
              description: 'Developed and maintained web applications'
            }
          ]
        }
      };
      setAnalysisResult(mockResult);
    }, 3000);
  };

  const handleJobAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }
    
    setIsAnalyzingJob(true);
    
    // Mock job analysis - in real implementation, this would use AI
    setTimeout(() => {
      const mockTailoringData: JobTailoringData = {
        matchScore: 78,
        keywords: ['React', 'JavaScript', 'Node.js', 'AWS', 'Agile'],
        suggestions: [
          'Add more specific examples of React projects',
          'Include cloud experience with AWS',
          'Mention Agile/Scrum methodologies',
          'Quantify your impact with metrics'
        ]
      };
      setTailoringData(mockTailoringData);
      setIsAnalyzingJob(false);
      toast.success('Job analysis completed!');
    }, 2000);
  };

  const handleUseSample = () => {
    const sampleJob = `We are looking for a Senior Software Engineer to join our team. 

Requirements:
- 5+ years of experience in web development
- Strong knowledge of React, JavaScript, and Node.js
- Experience with cloud platforms (AWS preferred)
- Familiarity with Agile development methodologies
- Strong problem-solving skills and attention to detail

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews and technical discussions`;
    
    setJobDescription(sampleJob);
  };

  const handleBuildResume = () => {
    if (analysisResult) {
      navigate('/resume-builder/new');
    } else {
      navigate('/resume-builder');
    }
  };

  // Processing view
  if (isProcessing && selectedFile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <ProcessingSteps 
          steps={processingSteps}
          currentStep={processingStep}
          fileName={selectedFile.name}
        />
      </div>
    );
  }

  // Results view
  if (analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/resume-builder')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resume Builder
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Resume Analysis
            </h1>
            <p className="text-gray-600">
              Complete analysis powered by TalentXcel AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Scores and Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Score */}
              <ResumeScoreCard score={analysisResult.overallScore} />
              
              {/* Score Breakdown */}
              <ScoreBreakdown 
                atsScore={analysisResult.atsScore}
                contentScore={analysisResult.contentScore}
                sectionsScore={analysisResult.sectionsScore}
                designScore={analysisResult.designScore}
                issues={analysisResult.issues}
              />
              
              {/* Job Tailoring */}
              <JobTailoringSection
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                onAnalyze={handleJobAnalysis}
                isAnalyzing={isAnalyzingJob}
                onUseSample={handleUseSample}
                tailoringData={tailoringData}
              />
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleBuildResume} className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Build with TalentXcel
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Check Another Resume
                </Button>
              </div>
            </div>

            {/* Right Column - Resume Preview */}
            <div className="lg:col-span-1">
              <ResumePreview data={analysisResult.resumeData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Upload view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/resume-builder')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resume Builder
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileCheck className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              TalentXcel Resume Checker
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Get your free AI-powered resume analysis in seconds
          </p>
          <p className="text-gray-500">
            Upload your resume and get detailed feedback on ATS compatibility, content quality, and more
          </p>
        </div>

        {/* Upload Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
            <CardDescription>
              PDF & DOCX only. Max 2MB file size.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop your resume here or choose a file
              </h3>
              <p className="text-gray-500 mb-4">
                PDF & DOCX formats supported
              </p>
              <Button>
                Choose File
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                🔒 Privacy guaranteed - Your resume is analyzed securely and never stored
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">ATS Compatibility</h3>
            <p className="text-gray-600 text-sm">Check if your resume passes applicant tracking systems</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600 text-sm">Get intelligent suggestions to improve your resume</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Instant Results</h3>
            <p className="text-gray-600 text-sm">Get your detailed report in under 30 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeChecker;
