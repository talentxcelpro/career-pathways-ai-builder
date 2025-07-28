import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  FileText,
  Sparkles,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface JobDescriptionMatcherProps {
  resumeData: any;
  onSuggestionsGenerated?: (suggestions: any) => void;
}

export const JobDescriptionMatcher: React.FC<JobDescriptionMatcherProps> = ({
  resumeData,
  onSuggestionsGenerated
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { invokeAITool } = useAIService();

  const handleAnalyzeMatch = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await invokeAITool({
        toolSlug: 'job-matcher',
        inputData: {
          jobDescription,
          resumeContent: resumeData,
          analysisType: 'comprehensive'
        },
        category: 'analysis'
      });

      if (result.success) {
        setAnalysis(result.data);
        onSuggestionsGenerated?.(result.data.suggestions);
      }
    } catch (error) {
      console.error('Job match analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderSkillGaps = () => {
    if (!analysis?.skillGaps) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Skills to Highlight or Add</h3>
        <div className="grid gap-3">
          {analysis.skillGaps.map((gap: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={gap.priority === 'high' ? 'destructive' : 
                              gap.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {gap.priority} priority
                    </Badge>
                    <span className="text-sm font-medium">{gap.skill}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {gap.suggestion}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Add
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderKeywordOptimization = () => {
    if (!analysis?.keywords) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Keyword Optimization</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Missing Keywords</span>
              <span>{analysis.keywords.missing?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.keywords.missing?.map((keyword: string, index: number) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Present Keywords</span>
              <span>{analysis.keywords.present?.length || 0}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.keywords.present?.map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImprovementSuggestions = () => {
    if (!analysis?.improvements) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Improvement Recommendations</h3>
        <div className="space-y-3">
          {analysis.improvements.map((improvement: any, index: number) => (
            <Card key={index} className="p-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {improvement.type === 'critical' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  {improvement.type === 'recommended' && (
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                  )}
                  {improvement.type === 'enhancement' && (
                    <Sparkles className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{improvement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {improvement.description}
                  </p>
                  {improvement.example && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <span className="font-medium">Example: </span>
                      {improvement.example}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  Apply
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Job Description Matcher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Paste Job Description
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here to get tailored suggestions..."
              rows={6}
              className="text-sm"
            />
          </div>
          
          <Button 
            onClick={handleAnalyzeMatch} 
            disabled={isAnalyzing || !jobDescription.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Match...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Analyze Job Match
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4">
            {/* Match Score Overview */}
            <Card className="p-4">
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold ${getMatchScoreColor(analysis.matchScore)}`}>
                  {analysis.matchScore}%
                </div>
                <p className="text-sm text-muted-foreground">Job Match Score</p>
                <Progress value={analysis.matchScore} className="w-full" />
              </div>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
                <TabsTrigger value="keywords" className="text-xs">Keywords</TabsTrigger>
                <TabsTrigger value="improvements" className="text-xs">Suggestions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="skills" className="mt-4">
                <ScrollArea className="h-[300px]">
                  {renderSkillGaps()}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="keywords" className="mt-4">
                <ScrollArea className="h-[300px]">
                  {renderKeywordOptimization()}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="improvements" className="mt-4">
                <ScrollArea className="h-[300px]">
                  {renderImprovementSuggestions()}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Enter a job description to get personalized optimization suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};