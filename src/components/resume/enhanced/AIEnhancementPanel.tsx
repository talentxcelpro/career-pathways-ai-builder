import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wand2, 
  Target, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Brain,
  Zap
} from "lucide-react";
import { useAIResumeEnhancements } from "@/hooks/useAIResumeEnhancements";
import { toast } from 'sonner';

interface AIEnhancementPanelProps {
  resumeData: any;
  onDataUpdate: (updatedData: any) => void;
  atsScore?: number;
}

export const AIEnhancementPanel: React.FC<AIEnhancementPanelProps> = ({
  resumeData,
  onDataUpdate,
  atsScore = 0
}) => {
  const { 
    generateSmartTitles, 
    isGeneratingTitles,
    adjustTone,
    isAdjustingTone,
    optimizeKeywords,
    isOptimizingKeywords
  } = useAIResumeEnhancements();

  const [selectedEnhancement, setSelectedEnhancement] = useState<string>('');
  const [enhancementResults, setEnhancementResults] = useState<any>(null);

  const handleGlobalEnhancement = async (type: 'ats' | 'professional' | 'achievements') => {
    setSelectedEnhancement(type);
    
    try {
      toast.loading(`Applying ${type} enhancement...`, { id: 'enhancement' });
      
      // Simulate comprehensive enhancement
      const enhancedData = { ...resumeData };
      
      switch (type) {
        case 'ats':
          const keywordResults = await optimizeKeywords(resumeData);
          if (keywordResults) {
            // Apply ATS optimizations
            if (keywordResults.optimizedSections.summary) {
              enhancedData.personalInfo.summary = keywordResults.optimizedSections.summary;
            }
            if (keywordResults.optimizedSections.skills) {
              enhancedData.skills = keywordResults.optimizedSections.skills.split(',').map(s => s.trim());
            }
            setEnhancementResults(keywordResults);
          }
          break;
          
        case 'professional':
          const professionalResults = await adjustTone(
            JSON.stringify(resumeData), 
            'professional', 
            'resume'
          );
          if (professionalResults) {
            try {
              const adjustedData = JSON.parse(professionalResults.adjustedContent);
              Object.assign(enhancedData, adjustedData);
              setEnhancementResults(professionalResults);
            } catch {
              enhancedData.personalInfo.summary = professionalResults.adjustedContent;
              setEnhancementResults(professionalResults);
            }
          }
          break;
          
        case 'achievements':
          // Focus on quantifiable achievements
          enhancedData.experience = enhancedData.experience.map((exp: any) => ({
            ...exp,
            description: exp.description + '\n• Achieved measurable results and exceeded targets'
          }));
          break;
      }
      
      onDataUpdate(enhancedData);
      toast.success(`${type} enhancement applied successfully!`, { id: 'enhancement' });
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error(`Failed to apply ${type} enhancement`, { id: 'enhancement' });
    } finally {
      setSelectedEnhancement('');
    }
  };

  const handleSmartTitles = async () => {
    try {
      const titleResults = await generateSmartTitles(resumeData);
      if (titleResults) {
        setEnhancementResults(titleResults);
        toast.success('Smart title suggestions generated!');
      }
    } catch (error) {
      console.error('Smart titles failed:', error);
      toast.error('Failed to generate smart titles');
    }
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getATSScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* ATS Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ATS Compatibility Score
              </CardTitle>
              <CardDescription>
                How well your resume works with Applicant Tracking Systems
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getATSScoreColor(atsScore)}`}>
                {atsScore}/100
              </div>
              <div className={`text-sm ${getATSScoreColor(atsScore)}`}>
                {getATSScoreText(atsScore)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={atsScore} className="h-3" />
        </CardContent>
      </Card>

      {/* AI Enhancement Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Enhancements
          </CardTitle>
          <CardDescription>
            Apply intelligent improvements to your resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quick">Quick Fixes</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleGlobalEnhancement('ats')}
                  disabled={selectedEnhancement === 'ats' || isOptimizingKeywords}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Target className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">ATS Optimize</div>
                    <div className="text-xs text-muted-foreground">
                      Improve keyword matching
                    </div>
                  </div>
                  {selectedEnhancement === 'ats' && (
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3 w-3 animate-pulse" />
                      Optimizing...
                    </div>
                  )}
                </Button>

                <Button
                  onClick={() => handleGlobalEnhancement('professional')}
                  disabled={selectedEnhancement === 'professional' || isAdjustingTone}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Sparkles className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Professional Tone</div>
                    <div className="text-xs text-muted-foreground">
                      Enhance language & clarity
                    </div>
                  </div>
                  {selectedEnhancement === 'professional' && (
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3 w-3 animate-pulse" />
                      Enhancing...
                    </div>
                  )}
                </Button>

                <Button
                  onClick={() => handleGlobalEnhancement('achievements')}
                  disabled={selectedEnhancement === 'achievements'}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <TrendingUp className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Impact Focus</div>
                    <div className="text-xs text-muted-foreground">
                      Highlight achievements
                    </div>
                  </div>
                  {selectedEnhancement === 'achievements' && (
                    <div className="flex items-center gap-1 text-xs">
                      <Zap className="h-3 w-3 animate-pulse" />
                      Focusing...
                    </div>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={handleSmartTitles}
                  disabled={isGeneratingTitles}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Smart Resume Titles
                </Button>
                
                <Button
                  onClick={() => handleGlobalEnhancement('ats')}
                  disabled={isOptimizingKeywords}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Deep Keyword Analysis
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {enhancementResults && (
                <div className="space-y-4">
                  <h3 className="font-medium">Enhancement Results</h3>
                  
                  {enhancementResults.atsScore && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>ATS Score Improvement</span>
                      <Badge variant="secondary">+{enhancementResults.atsScore}%</Badge>
                    </div>
                  )}
                  
                  {enhancementResults.recommendations && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recommendations</h4>
                      {enhancementResults.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{rec.suggestion || rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {enhancementResults.improvementTips && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Improvement Tips</h4>
                      {enhancementResults.improvementTips.map((tip: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};