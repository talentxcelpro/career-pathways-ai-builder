
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedFileUpload } from '@/components/resume/EnhancedFileUpload';
import { ResumeScoreCard } from '@/components/resume/checker/ResumeScoreCard';
import { ATSCheckCard } from './ATSCheckCard';
import { KeywordsAnalysisCard } from './KeywordsAnalysisCard';
import { ContentAnalysisCard } from './ContentAnalysisCard';
import { VisualAnalysisCard } from './VisualAnalysisCard';
import { InsightsCard } from './InsightsCard';
import { WhatsNextCard } from './WhatsNextCard';
import { useResumeUpload } from '@/hooks/useResumeUpload';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';

interface ResumeAnalysisResults {
  overallScore: number;
  atsCheck: any;
  keywordsAnalysis: any;
  contentAnalysis: any;
  visualAnalysis: any;
  insights: any;
  resumeId?: string;
  resumeData?: any;
}

export const EnhancedResumeChecker: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<ResumeAnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { uploadResume, isUploading, progress } = useResumeUpload();
  const { performAdvancedATSAnalysis } = useAdvancedAIFeatures();

  const handleFileUpload = async (files: FileList) => {
    if (!files[0]) return;
    
    setIsAnalyzing(true);
    
    try {
      // Upload and parse resume
      const uploadResult = await uploadResume(files[0]);
      
      if (uploadResult.success && uploadResult.parsedData) {
        // Perform comprehensive analysis
        const atsAnalysis = await performAdvancedATSAnalysis(
          uploadResult.parsedData,
          undefined, // job description
          undefined, // target role
          undefined  // industry
        );

        // Generate mock analysis results (replace with real AI analysis)
        const results: ResumeAnalysisResults = {
          overallScore: uploadResult.atsScore || 75,
          atsCheck: {
            score: uploadResult.atsScore || 75,
            compatibility: uploadResult.atsScore >= 80 ? 'excellent' : uploadResult.atsScore >= 60 ? 'good' : 'needs_work',
            formatIssues: ['No major formatting issues detected'],
            recommendations: [
              'Use standard section headings',
              'Include relevant keywords from job descriptions',
              'Maintain consistent formatting throughout'
            ],
            keywordDensity: 65,
            readabilityScore: 8.2
          },
          keywordsAnalysis: {
            matchedKeywords: [
              { keyword: 'JavaScript', frequency: 3, importance: 'high' },
              { keyword: 'React', frequency: 2, importance: 'high' },
              { keyword: 'Node.js', frequency: 1, importance: 'medium' }
            ],
            missingKeywords: [
              { 
                keyword: 'TypeScript', 
                importance: 'high',
                suggestions: ['Add to skills section', 'Mention in project descriptions']
              }
            ],
            overallMatch: 72,
            industryRelevance: 85
          },
          contentAnalysis: {
            overallScore: 78,
            impactScore: 85,
            quantificationLevel: 65,
            actionVerbUsage: 80,
            accomplishmentFocus: 70,
            suggestions: [
              {
                type: 'improvement',
                section: 'Experience',
                message: 'Add more quantifiable achievements',
                priority: 'high'
              }
            ],
            strengths: ['Strong action verbs', 'Clear job progression'],
            weaknesses: ['Limited quantification', 'Missing soft skills']
          },
          visualAnalysis: {
            overallScore: 82,
            layoutScore: 85,
            readabilityScore: 90,
            professionalismScore: 80,
            spaceUtilization: 75,
            fontConsistency: 95,
            visualHierarchy: 80,
            heatmapData: [
              { section: 'Header', attentionScore: 95, viewTime: 3.2 },
              { section: 'Summary', attentionScore: 85, viewTime: 4.1 },
              { section: 'Experience', attentionScore: 78, viewTime: 8.5 },
              { section: 'Skills', attentionScore: 65, viewTime: 2.3 }
            ],
            designIssues: ['Consider improving white space usage'],
            recommendations: ['Use bullet points consistently', 'Improve section spacing']
          },
          insights: {
            industryBenchmark: {
              averageScore: 68,
              topPercentile: 88,
              yourRanking: 'Above Average'
            },
            competitiveAnalysis: {
              strengths: ['Technical Skills', 'Experience Level'],
              gaps: ['Certifications', 'Leadership Experience'],
              opportunities: ['Cloud Technologies', 'AI/ML Skills']
            },
            trendsAnalysis: {
              hotSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
              emergingKeywords: ['DevOps', 'Microservices', 'GraphQL'],
              industryTrends: ['Remote Work', 'Agile Methodologies']
            },
            recommendations: [
              {
                category: 'Skills Enhancement',
                action: 'Add cloud platform certifications',
                impact: 'high',
                effort: 'moderate'
              }
            ]
          },
          resumeId: uploadResult.resumeId,
          resumeData: uploadResult.parsedData
        };

        setAnalysisResults(results);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckAnother = () => {
    setAnalysisResults(null);
    setIsAnalyzing(false);
  };

  if (analysisResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Resume Analysis Complete!
            </h1>
            <p className="text-lg text-gray-600">
              Here's your comprehensive resume analysis with actionable insights
            </p>
          </div>

          {/* Overall Score */}
          <div className="mb-8">
            <ResumeScoreCard score={analysisResults.overallScore} />
          </div>

          {/* Analysis Cards Grid */}
          <div className="grid gap-8 mb-8">
            {/* ATS Check */}
            <ATSCheckCard result={analysisResults.atsCheck} />
            
            {/* Keywords Analysis */}
            <KeywordsAnalysisCard analysis={analysisResults.keywordsAnalysis} />
            
            {/* Content Analysis */}
            <ContentAnalysisCard analysis={analysisResults.contentAnalysis} />
            
            {/* Visual Analysis */}
            <VisualAnalysisCard analysis={analysisResults.visualAnalysis} />
            
            {/* Market Insights */}
            <InsightsCard insights={analysisResults.insights} />
          </div>

          {/* What's Next */}
          <WhatsNextCard 
            resumeData={analysisResults.resumeData}
            resumeId={analysisResults.resumeId}
            onCheckAnother={handleCheckAnother}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI-Powered Resume Checker
          </h1>
          <p className="text-lg text-gray-600">
            Get comprehensive analysis with ATS check, keyword optimization, content review, and market insights
          </p>
        </div>

        {/* Upload Interface */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <EnhancedFileUpload
              onFileSelect={handleFileUpload}
              isProcessing={isUploading || isAnalyzing}
              processingProgress={progress?.percentage || 0}
              processingStatus={
                isAnalyzing 
                  ? 'Analyzing your resume with AI...' 
                  : progress?.step || 'Processing'
              }
            />
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">ATS</span>
            </div>
            <h3 className="font-semibold mb-2">ATS Compatibility</h3>
            <p className="text-sm text-gray-600">
              Check how well your resume works with applicant tracking systems
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold">KEY</span>
            </div>
            <h3 className="font-semibold mb-2">Keywords Analysis</h3>
            <p className="text-sm text-gray-600">
              Optimize your resume with industry-relevant keywords
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold">AI</span>
            </div>
            <h3 className="font-semibold mb-2">Content Review</h3>
            <p className="text-sm text-gray-600">
              Get AI-powered suggestions to improve your content
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-orange-600 font-bold">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Market Insights</h3>
            <p className="text-sm text-gray-600">
              Compare against industry benchmarks and trends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
