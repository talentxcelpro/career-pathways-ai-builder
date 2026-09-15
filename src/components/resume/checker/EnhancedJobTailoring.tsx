
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Target, TrendingUp, Sparkles, FileText } from 'lucide-react';

interface JobTailoringAnalysis {
  category: string;
  score: number;
  checks: Array<{
    name: string;
    passed: boolean;
    description: string;
    suggestion?: string;
  }>;
}

interface EnhancedJobTailoringProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  tailoringAnalysis?: JobTailoringAnalysis;
}

const SAMPLE_JOB_POSTS = [
  {
    title: "Senior Software Engineer - React",
    company: "TechCorp Inc.",
    description: `We are seeking a Senior Software Engineer with 5+ years of experience in React, TypeScript, and modern web development. 

Key Requirements:
- Expert in React, Redux, and TypeScript
- Experience with Node.js and REST APIs
- Strong understanding of agile methodologies
- Bachelor's degree in Computer Science or related field
- Experience with cloud platforms (AWS, Azure)
- Knowledge of testing frameworks (Jest, Cypress)

Responsibilities:
- Lead frontend development initiatives
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews and architectural decisions

We offer competitive salary, comprehensive benefits, and opportunities for professional growth in a dynamic startup environment.`
  },
  {
    title: "Marketing Manager - Digital Growth",
    company: "GrowthCo",
    description: `Marketing Manager position focused on digital growth strategies and customer acquisition.

Requirements:
- 3+ years marketing experience
- Google Analytics and Ads certification
- Experience with email marketing platforms
- Strong analytical and communication skills
- Bachelor's degree in Marketing or Business
- Social media marketing expertise
- Content creation and SEO knowledge

Key Responsibilities:
- Develop and execute digital marketing campaigns
- Analyze performance metrics and optimize ROI
- Manage social media presence and content calendar
- Collaborate with sales team on lead generation
- Create compelling marketing materials and copy

Join our fast-growing company and make a significant impact on our marketing success!`
  }
];

export const EnhancedJobTailoring: React.FC<EnhancedJobTailoringProps> = ({
  jobDescription,
  setJobDescription,
  onAnalyze,
  isAnalyzing,
  tailoringAnalysis
}) => {
  const [showSamples, setShowSamples] = useState(false);

  const useSampleJob = (sample: typeof SAMPLE_JOB_POSTS[0]) => {
    setJobDescription(sample.description);
    setShowSamples(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Job-Specific Resume Tailoring
        </CardTitle>
        <p className="text-sm text-gray-600">
          Paste the job description you're applying for and get personalized tailoring suggestions to increase your chances of getting an interview.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <Textarea
              placeholder="Paste the complete job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={onAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="flex-1 min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing Match...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Tailored Insights
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowSamples(!showSamples)}
              className="whitespace-nowrap"
            >
              <FileText className="h-4 w-4 mr-2" />
              Try Sample Job
            </Button>
          </div>

          {showSamples && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Sample Job Postings</p>
              {SAMPLE_JOB_POSTS.map((sample, index) => (
                <div key={index} className="p-3 bg-white rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{sample.title}</h4>
                      <p className="text-xs text-gray-600">{sample.company}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => useSampleJob(sample)}
                    >
                      Use This
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {sample.description.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {tailoringAnalysis && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Job Match Analysis</h4>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className={`text-2xl font-bold ${getScoreColor(tailoringAnalysis.score)}`}>
                  {tailoringAnalysis.score}%
                </span>
              </div>
            </div>
            
            <Progress value={tailoringAnalysis.score} className="h-3" />
            
            <div className="grid gap-4">
              {tailoringAnalysis.checks.map((check, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded border bg-white">
                  <div className={`w-2 h-2 rounded-full mt-2 ${check.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm">{check.name}</h5>
                      <Badge variant={check.passed ? "default" : "destructive"} className="text-xs">
                        {check.passed ? "Match" : "Gap"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                    {!check.passed && check.suggestion && (
                      <div className="p-2 bg-blue-50 rounded text-sm text-blue-800 border-l-4 border-blue-400">
                        💡 {check.suggestion}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-2">Ready to Optimize Your Resume?</h5>
              <p className="text-sm text-blue-800 mb-3">
                Use our AI-powered resume builder to automatically incorporate these insights and create a perfectly tailored resume.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Build Optimized Resume
              </Button>
            </div>
          </div>
        )}
        
        {!tailoringAnalysis && jobDescription && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Click "Get Tailored Insights" to analyze how well your resume matches this job</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
