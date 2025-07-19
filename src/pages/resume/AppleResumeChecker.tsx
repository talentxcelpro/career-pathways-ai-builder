
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { AppleCard, AppleCardContent, AppleCardHeader, AppleCardTitle } from '@/components/ui/apple-card';
import { AppleButton } from '@/components/ui/apple-button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Eye,
  Award,
  Download,
  RefreshCw
} from 'lucide-react';
import { ResumeAnalysisService, ComprehensiveResumeAnalysis } from '@/services/resumeAnalysisService';
import { AnalysisResults } from '@/components/resume/AnalysisResults';
import { JobDescriptionInput } from '@/components/resume/JobDescriptionInput';

interface UploadedFile {
  file: File;
  content?: string;
  processing: boolean;
}

export default function AppleResumeChecker() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [analysis, setAnalysis] = useState<ComprehensiveResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile({ file, processing: true });
    
    try {
      // Extract text content from file
      const text = await extractTextFromFile(file);
      setUploadedFile({ file, content: text, processing: false });
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for analysis`,
      });
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Upload failed",
        description: "Could not process the file. Please try again.",
        variant: "destructive"
      });
      setUploadedFile(null);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simulate text extraction - in real implementation, use PDF.js, mammoth.js, etc.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Mock extraction - replace with actual extraction logic
        const mockContent = `
        John Doe
        Senior Software Engineer
        john.doe@email.com | (555) 123-4567 | San Francisco, CA
        
        PROFESSIONAL SUMMARY
        Experienced software engineer with 8+ years developing scalable web applications. 
        Led teams of 5+ engineers and increased system performance by 40%.
        
        EXPERIENCE
        Senior Software Engineer | TechCorp | 2020-Present
        • Led development of microservices architecture serving 1M+ users
        • Implemented CI/CD pipeline reducing deployment time by 60%
        • Mentored 3 junior developers and improved team productivity by 25%
        
        Software Engineer | StartupXYZ | 2018-2020
        • Developed React-based dashboard increasing user engagement by 35%
        • Optimized database queries improving response time by 50%
        
        EDUCATION
        Bachelor of Science in Computer Science | University of Technology | 2018
        
        SKILLS
        JavaScript, React, Node.js, Python, AWS, Docker, MongoDB, PostgreSQL
        `;
        resolve(mockContent);
      };
      reader.readAsText(file);
    });
  };

  const handleAnalysis = async (jobDescription?: string, jobTitle?: string, industry?: string, company?: string) => {
    if (!uploadedFile?.content) {
      toast({
        title: "No resume uploaded",
        description: "Please upload a resume first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const result = await ResumeAnalysisService.analyzeResume(
        uploadedFile.content,
        jobDescription,
        industry
      );
      
      setAnalysis(result);
      setAnalysisProgress(100);
      
      toast({
        title: "Analysis completed!",
        description: `Your resume scored ${result.overallScore}/100`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  const handleReanalyze = () => {
    setAnalysis(null);
    setAnalysisProgress(0);
  };

  const downloadReport = () => {
    if (!analysis) return;
    
    // Create downloadable report
    const report = `
Resume Analysis Report
======================

Overall Score: ${analysis.overallScore}/100
Grade: ${analysis.grade}

Sub-Scores:
- ATS Compatibility: ${analysis.subScores.ats}/100
- Keywords: ${analysis.subScores.keywords}/100
- Content Quality: ${analysis.subScores.content}/100
- Format: ${analysis.subScores.format}/100
- Achievements: ${analysis.subScores.achievements}/100

Industry Benchmark: ${analysis.industryBenchmark.percentile}th percentile

Key Insights:
${analysis.actionableInsights.map(insight => 
  `- ${insight.category}: ${insight.issue}\n  Solution: ${insight.solution}\n  Impact: ${insight.impact}`
).join('\n\n')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative">
              <Brain className="w-8 h-8 text-blue-600" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Resume Checker
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get comprehensive ATS analysis, keyword optimization, and actionable insights to make your resume stand out
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            {[
              { icon: Target, title: 'ATS Optimization', desc: 'Beat applicant tracking systems' },
              { icon: Award, title: 'Keyword Analysis', desc: 'Match job requirements' },
              { icon: TrendingUp, title: 'Content Quality', desc: 'Improve impact & clarity' },
              { icon: Eye, title: 'Visual Insights', desc: 'Recruiter attention heatmap' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-xl bg-white/50 border border-gray-200"
              >
                <feature.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-xs text-gray-600">{feature.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!uploadedFile && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              {/* Upload Section */}
              <AppleCard className="overflow-hidden">
                <AppleCardHeader className="text-center">
                  <AppleCardTitle className="text-2xl">Upload Your Resume</AppleCardTitle>
                  <p className="text-gray-600">Support for PDF, DOC, DOCX, and TXT files</p>
                </AppleCardHeader>
                <AppleCardContent>
                  <div
                    {...getRootProps()}
                    className={`
                      relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                      transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50
                      ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <motion.div
                      animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                      className="space-y-4"
                    >
                      <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                        </p>
                        <p className="text-gray-500 mt-2">
                          or <span className="text-blue-600 font-medium">browse files</span>
                        </p>
                      </div>
                      <div className="flex justify-center gap-2">
                        {['PDF', 'DOC', 'DOCX', 'TXT'].map(format => (
                          <Badge key={format} variant="secondary" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </AppleCardContent>
              </AppleCard>
            </motion.div>
          )}

          {uploadedFile && !analysis && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* File Info */}
              <AppleCard className="max-w-2xl mx-auto">
                <AppleCardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{uploadedFile.file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(uploadedFile.file.size / 1024).toFixed(1)} KB • Ready for analysis
                      </div>
                    </div>
                    {uploadedFile.processing ? (
                      <div className="animate-spin">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </AppleCardContent>
              </AppleCard>

              {/* Job Description Input */}
              <JobDescriptionInput 
                onAnalyze={handleAnalysis}
                isAnalyzing={isAnalyzing}
              />

              {/* Analysis Progress */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-2xl mx-auto"
                >
                  <AppleCard>
                    <AppleCardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">Analyzing Your Resume</div>
                          <div className="text-gray-600">AI is examining content, format, and optimization opportunities</div>
                        </div>
                        <div className="space-y-2">
                          <Progress value={analysisProgress} className="h-3" />
                          <div className="text-sm text-gray-500">{Math.round(analysisProgress)}% Complete</div>
                        </div>
                      </div>
                    </AppleCardContent>
                  </AppleCard>
                </motion.div>
              )}
            </motion.div>
          )}

          {analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Action Bar */}
              <div className="flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Analysis Complete
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {uploadedFile?.file.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <AppleButton variant="outline" onClick={downloadReport} size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download Report
                  </AppleButton>
                  <AppleButton variant="outline" onClick={() => setUploadedFile(null)} size="sm">
                    New Resume
                  </AppleButton>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="max-w-6xl mx-auto">
                <AnalysisResults analysis={analysis} onReanalyze={handleReanalyze} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
