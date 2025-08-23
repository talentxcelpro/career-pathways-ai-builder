import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';
import { toast } from 'sonner';

interface ATSScanModuleProps {
  onResult: (message: string) => void;
  userProfile?: any;
}

export const ATSScanModule: React.FC<ATSScanModuleProps> = ({ onResult, userProfile }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { performAdvancedATSAnalysis, isAnalyzing } = useAdvancedAIFeatures();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setResumeText(content);
        toast.success('Resume uploaded successfully!');
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please upload or paste your resume content first.');
      return;
    }

    try {
      const result = await performAdvancedATSAnalysis(
        { content: resumeText },
        jobDescription || undefined,
        userProfile?.title || 'Software Engineer',
        userProfile?.industry || 'Technology'
      );

      if (result) {
        setAnalysisResult(result);
        onResult(`ATS Analysis Complete! Score: ${result.overallScore}/100. Analysis ready for review.`);
      }
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          ATS Resume Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Resume (PDF/DOCX/TXT)</label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
            />
            <Upload className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Resume Text Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Or Paste Resume Content</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            className="w-full h-32 p-3 border rounded-md resize-none"
          />
        </div>

        {/* Job Description (Optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Description (Optional)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job description for targeted analysis..."
            className="w-full h-24 p-3 border rounded-md resize-none"
          />
        </div>

        {/* Analyze Button */}
        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || !resumeText.trim()}
          className="w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
        </Button>

        {/* Results */}
        {analysisResult && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Analysis Complete</span>
            </div>

            {/* Overall Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ATS Score</span>
                <Badge variant={analysisResult.overallScore >= 80 ? 'default' : 'destructive'}>
                  {analysisResult.overallScore}/100
                </Badge>
              </div>
              <Progress value={analysisResult.overallScore} className="w-full" />
            </div>

            {/* Key Issues */}
            {analysisResult.issues && analysisResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Key Issues
                </h4>
                <ul className="space-y-1">
                  {analysisResult.issues.slice(0, 3).map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysisResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Improvement Suggestions</h4>
                <ul className="space-y-1">
                  {analysisResult.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {analysisResult.keywordAnalysis && (
              <div className="space-y-2">
                <h4 className="font-medium">Keywords Analysis</h4>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.keywordAnalysis.missing?.slice(0, 6).map((keyword: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};