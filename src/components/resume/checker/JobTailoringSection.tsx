
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target, TrendingUp } from 'lucide-react';

interface JobTailoringData {
  matchScore: number;
  keywords: string[];
  suggestions: string[];
}

interface JobTailoringSectionProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onUseSample: () => void;
  tailoringData?: JobTailoringData;
}

export const JobTailoringSection: React.FC<JobTailoringSectionProps> = ({
  jobDescription,
  setJobDescription,
  onAnalyze,
  isAnalyzing,
  onUseSample,
  tailoringData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Resume Tailoring
        </CardTitle>
        <p className="text-sm text-gray-600">
          Paste the job you're applying for and our checker will give you job-specific resume tailoring suggestions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button 
              onClick={onAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Get Tailored Insights'
              )}
            </Button>
            <Button variant="outline" onClick={onUseSample}>
              Use a Sample Job Post
            </Button>
          </div>
        </div>

        {tailoringData && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Job Match Score</h4>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-bold text-green-600">{tailoringData.matchScore}%</span>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Key Skills to Highlight</h5>
              <div className="flex flex-wrap gap-2">
                {tailoringData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Tailoring Suggestions</h5>
              <ul className="space-y-2">
                {tailoringData.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {!tailoringData && jobDescription && (
          <p className="text-sm text-gray-500 text-center py-4">
            Paste a job description above to get tailored insights
          </p>
        )}
      </CardContent>
    </Card>
  );
};
