import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Target, 
  TrendingUp, 
  Plus,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw
} from "lucide-react";
import { toast } from 'sonner';

interface KeywordAnalyzerProps {
  resumeData: any;
  onKeywordSuggestion: (keyword: string) => void;
}

export const KeywordAnalyzer: React.FC<KeywordAnalyzerProps> = ({ 
  resumeData, 
  onKeywordSuggestion 
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordAnalysis, setKeywordAnalysis] = useState<any>(null);

  // Extract keywords from resume
  const resumeKeywords = useMemo(() => {
    const allText = extractResumeText(resumeData).toLowerCase();
    const skills = resumeData.skills || [];
    
    // Common professional keywords
    const professionalKeywords = [
      'leadership', 'management', 'teamwork', 'communication', 'problem-solving',
      'project management', 'strategic planning', 'data analysis', 'customer service',
      'innovation', 'collaboration', 'results-driven', 'cross-functional',
      'agile', 'scrum', 'methodology', 'process improvement', 'stakeholder',
      'budget', 'revenue', 'growth', 'optimization', 'efficiency'
    ];
    
    // Technical keywords (common across industries)
    const technicalKeywords = [
      'software', 'development', 'programming', 'database', 'system',
      'application', 'integration', 'architecture', 'framework', 'platform',
      'cloud', 'security', 'network', 'server', 'infrastructure'
    ];
    
    const allKeywords = [...professionalKeywords, ...technicalKeywords, ...skills];
    
    return allKeywords.filter(keyword => 
      allText.includes(keyword.toLowerCase())
    );
  }, [resumeData]);

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate keyword analysis
      const jobKeywords = extractKeywordsFromJobDescription(jobDescription);
      const matchedKeywords = jobKeywords.filter(keyword => 
        resumeKeywords.includes(keyword.toLowerCase())
      );
      const missingKeywords = jobKeywords.filter(keyword => 
        !resumeKeywords.includes(keyword.toLowerCase())
      );

      const analysis = {
        jobKeywords,
        matchedKeywords,
        missingKeywords,
        matchRate: jobKeywords.length > 0 ? 
          Math.round((matchedKeywords.length / jobKeywords.length) * 100) : 0,
        suggestions: generateKeywordSuggestions(missingKeywords)
      };

      setKeywordAnalysis(analysis);
      toast.success('Keyword analysis completed!');
    } catch (error) {
      console.error('Keyword analysis error:', error);
      toast.error('Failed to analyze keywords');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    toast.success(`Copied "${keyword}" to clipboard`);
  };

  const addKeywordToResume = (keyword: string) => {
    onKeywordSuggestion(keyword);
    toast.success(`Added "${keyword}" as a suggestion`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Keyword Analyzer
        </CardTitle>
        <CardDescription>
          Compare your resume against job descriptions to find missing keywords
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Job Description Input */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Job Description</label>
            <p className="text-xs text-gray-500 mt-1">
              Paste the job description you're applying for to analyze keyword matches
            </p>
          </div>
          <Textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button 
            onClick={analyzeJobDescription}
            disabled={isAnalyzing || !jobDescription.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Analyze Keywords
              </>
            )}
          </Button>
        </div>

        {/* Current Resume Keywords */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Resume Keywords</h4>
            <Badge variant="outline">{resumeKeywords.length} keywords</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {resumeKeywords.length > 0 ? (
              resumeKeywords.slice(0, 15).map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No keywords detected. Add skills and experience to improve keyword coverage.
              </p>
            )}
          </div>
          {resumeKeywords.length > 15 && (
            <p className="text-xs text-gray-500">
              +{resumeKeywords.length - 15} more keywords...
            </p>
          )}
        </div>

        {/* Analysis Results */}
        {keywordAnalysis && (
          <>
            <Separator />
            
            {/* Match Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Keyword Match Rate</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {keywordAnalysis.matchRate}%
                  </div>
                  <p className="text-xs text-gray-500">
                    {keywordAnalysis.matchedKeywords.length} of {keywordAnalysis.jobKeywords.length} keywords
                  </p>
                </div>
              </div>
              <Progress value={keywordAnalysis.matchRate} className="h-2" />
              
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  {keywordAnalysis.matchRate >= 70 
                    ? "Excellent keyword match! Your resume aligns well with this job."
                    : keywordAnalysis.matchRate >= 50
                    ? "Good match. Consider adding some missing keywords to improve your chances."
                    : "Low keyword match. Focus on incorporating more relevant keywords from the job description."
                  }
                </AlertDescription>
              </Alert>
            </div>

            {/* Matched Keywords */}
            {keywordAnalysis.matchedKeywords.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Matched Keywords</h4>
                  <Badge variant="outline" className="text-green-600">
                    {keywordAnalysis.matchedKeywords.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywordAnalysis.matchedKeywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="default" className="text-xs bg-green-100 text-green-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {keywordAnalysis.missingKeywords.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium">Missing Keywords</h4>
                  <Badge variant="outline" className="text-orange-600">
                    {keywordAnalysis.missingKeywords.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {keywordAnalysis.missingKeywords.slice(0, 10).map((keyword: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">{keyword}</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyKeyword(keyword)}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addKeywordToResume(keyword)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {keywordAnalysis.missingKeywords.length > 10 && (
                  <p className="text-xs text-gray-500">
                    +{keywordAnalysis.missingKeywords.length - 10} more missing keywords...
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions
const extractResumeText = (resumeData: any): string => {
  let text = '';
  
  if (resumeData.personalInfo?.summary) {
    text += resumeData.personalInfo.summary + ' ';
  }
  
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach((exp: any) => {
      text += `${exp.title || exp.position || ''} `;
      text += `${exp.description || ''} `;
    });
  }
  
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    text += resumeData.skills.join(' ') + ' ';
  }
  
  if (resumeData.projects && Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach((project: any) => {
      text += `${project.title || ''} `;
      text += `${project.description || ''} `;
    });
  }
  
  return text;
};

const extractKeywordsFromJobDescription = (jobDescription: string): string[] => {
  // Simple keyword extraction - in a real app, this would use NLP
  const text = jobDescription.toLowerCase();
  
  // Common job-related keywords to look for
  const keywordPatterns = [
    // Skills
    'python', 'javascript', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes',
    'machine learning', 'data analysis', 'project management', 'agile', 'scrum',
    
    // Soft skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'strategic', 'creative', 'innovative', 'collaborative', 'detail oriented',
    
    // Experience levels
    'senior', 'junior', 'lead', 'principal', 'architect', 'manager', 'director',
    
    // Common requirements
    'bachelor', 'master', 'degree', 'certification', 'experience', 'years'
  ];
  
  const foundKeywords = keywordPatterns.filter(keyword => 
    text.includes(keyword)
  );
  
  // Also extract words that appear multiple times (likely important)
  const matchResult = text.match(/\b[a-z]+\b/g);
  const words: string[] = matchResult ? matchResult : [];
  const wordCount: Record<string, number> = {};
  
  words.forEach((word: string) => {
    if (word.length > 3) { // Only consider words longer than 3 characters
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  const frequentWords = Object.entries(wordCount)
    .filter(([_, count]) => count >= 2)
    .map(([word, _]) => word)
    .slice(0, 10);
  
  return [...new Set([...foundKeywords, ...frequentWords])];
};

const generateKeywordSuggestions = (missingKeywords: string[]): string[] => {
  // Generate contextual suggestions based on missing keywords
  return missingKeywords.slice(0, 5);
};