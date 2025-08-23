import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Target, Download, Copy } from 'lucide-react';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';
import { toast } from 'sonner';

interface JDTailorModuleProps {
  onResult: (message: string) => void;
  userProfile?: any;
}

export const JDTailorModule: React.FC<JDTailorModuleProps> = ({ onResult, userProfile }) => {
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [company, setCompany] = useState('');
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const { optimizeForSpecificJob, isOptimizing } = useAdvancedAIFeatures();

  const handleOptimize = async () => {
    if (!resumeContent.trim() || !jobDescription.trim()) {
      toast.error('Please provide both resume content and job description.');
      return;
    }

    try {
      const result = await optimizeForSpecificJob(
        { content: resumeContent },
        jobDescription,
        targetRole || 'Software Engineer',
        'Technology',
        'moderate'
      );

      if (result) {
        setOptimizationResult(result);
        onResult(`Resume tailored successfully! Match score improved to ${result.matchScore}%. Ready for download.`);
      }
    } catch (error) {
      toast.error('Tailoring failed. Please try again.');
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const downloadTailoredResume = () => {
    if (!optimizationResult?.optimizedContent) return;
    
    const element = document.createElement('a');
    const file = new Blob([optimizationResult.optimizedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tailored-resume-${company || 'company'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Resume downloaded!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          JD Resume Tailor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Role & Company */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google, Microsoft"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Resume Content */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Resume Content</label>
          <textarea
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
            placeholder="Paste your current resume content here..."
            className="w-full h-32 p-3 border rounded-md resize-none"
          />
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            className="w-full h-32 p-3 border rounded-md resize-none"
          />
        </div>

        {/* Tailor Button */}
        <Button 
          onClick={handleOptimize} 
          disabled={isOptimizing || !resumeContent.trim() || !jobDescription.trim()}
          className="w-full"
        >
          {isOptimizing ? 'Tailoring Resume...' : 'Tailor Resume to JD'}
        </Button>

        {/* Results */}
        {optimizationResult && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Tailored Resume Ready</h4>
              <Badge variant="default">
                Match Score: {optimizationResult.matchScore}%
              </Badge>
            </div>

            {/* Performance Metrics */}
            {optimizationResult.performanceMetrics && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {optimizationResult.performanceMetrics.keywordMatchRate || 85}%
                  </div>
                  <div className="text-xs text-muted-foreground">Keyword Match</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {optimizationResult.performanceMetrics.skillAlignment || 92}%
                  </div>
                  <div className="text-xs text-muted-foreground">Skill Alignment</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {optimizationResult.performanceMetrics.experienceRelevance || 88}%
                  </div>
                  <div className="text-xs text-muted-foreground">Experience Match</div>
                </div>
              </div>
            )}

            {/* Optimized Content Preview */}
            <div className="space-y-2">
              <h4 className="font-medium">Tailored Resume Preview</h4>
              <div className="p-4 border rounded-md bg-background max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {optimizationResult.optimizedContent?.substring(0, 500)}
                  {optimizationResult.optimizedContent?.length > 500 && '...'}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(optimizationResult.optimizedContent)}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Content
              </Button>
              <Button onClick={downloadTailoredResume} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            </div>

            {/* Changes Summary */}
            {optimizationResult.changesSummary && (
              <div className="space-y-2">
                <h4 className="font-medium">Key Changes Made</h4>
                <ul className="space-y-1">
                  {optimizationResult.changesSummary.slice(0, 3).map((change: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};