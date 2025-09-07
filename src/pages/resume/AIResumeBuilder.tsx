import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Zap, MessageSquare, FileText, Download, Eye, Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThreePaneResumeBuilder } from '@/components/resume/enhanced/ThreePaneResumeBuilder';
import ConversationalResumeBuilder from '@/components/resume/ConversationalResumeBuilder';
import { UnifiedResumeInterface } from '@/components/resume/enhanced/UnifiedResumeInterface';
import { createEmptyEditorResume } from '@/types/editor-resume';
import { useLocation } from 'react-router-dom';

interface ATSMetrics {
  overallScore: number;
  keywordDensity: number;
  formatting: number;
  sections: number;
  suggestions: string[];
}

const AIResumeBuilder = () => {
  const location = useLocation();
  const [builderMode, setBuilderMode] = useState<'guided' | 'freestyle' | 'chat'>('guided');
  const [atsScore, setAtsScore] = useState<ATSMetrics>({
    overallScore: 0,
    keywordDensity: 0,
    formatting: 100,
    sections: 80,
    suggestions: []
  });
  const [resumeData, setResumeData] = useState(() => {
    // Initialize with data from upload parser if available
    const parsedData = location.state?.parsedData;
    if (parsedData) {
      const editorResume = createEmptyEditorResume();
      // Map parsed data to editor resume format
      editorResume.personalInfo = {
        ...editorResume.personalInfo,
        ...parsedData.personalInfo
      };
      editorResume.experience = parsedData.experience || [];
      editorResume.education = parsedData.education || [];
      editorResume.skills = parsedData.skills || [];
      return editorResume;
    }
    return createEmptyEditorResume();
  });

  // Simulate real-time ATS scoring
  useEffect(() => {
    const calculateAtsScore = () => {
      let score = 0;
      let keywordDensity = 0;
      const suggestions: string[] = [];

      // Basic scoring logic
      if (resumeData.personalInfo.fullName) score += 10;
      if (resumeData.personalInfo.email) score += 10;
      if (resumeData.personalInfo.phone) score += 5;
      if (resumeData.personalInfo.summary) score += 20;
      
      if (resumeData.experience?.length > 0) {
        score += 25;
        keywordDensity = resumeData.experience.length * 10;
      } else {
        suggestions.push('Add work experience to improve ATS score');
      }

      if (resumeData.education?.length > 0) {
        score += 15;
      } else {
        suggestions.push('Add education background');
      }

      const skillsArray = Array.isArray(resumeData.skills) ? resumeData.skills : [];
      if (skillsArray.length > 0) {
        score += 15;
        keywordDensity += skillsArray.length * 2;
      } else {
        suggestions.push('Add relevant skills');
      }

      if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length < 100) {
        suggestions.push('Expand professional summary (aim for 100+ characters)');
      }

      if (skillsArray.length < 8) {
        suggestions.push('Add more skills (8+ recommended)');
      }

      setAtsScore({
        overallScore: Math.min(score, 100),
        keywordDensity: Math.min(keywordDensity, 100),
        formatting: 100,
        sections: 80,
        suggestions
      });
    };

    calculateAtsScore();
  }, [resumeData]);

  const handleDataChange = (newData: any) => {
    setResumeData(newData);
  };

  const handleSave = async () => {
    // Implement save functionality
    console.log('Saving resume:', resumeData);
  };

  const handleExport = (format: string) => {
    // Implement export functionality
    console.log('Exporting as:', format);
  };

  return (
    <>
      <Helmet>
        <title>AI Resume Builder | Real-time ATS Scoring | TalentXcel</title>
        <meta 
          name="description" 
          content="Build your resume with AI assistance. Real-time ATS scoring, smart suggestions, and multiple building modes. Get hired faster." 
        />
        <link rel="canonical" href="https://talentxcel.in/builder" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  AI Resume Builder
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time ATS optimization • Smart suggestions • Multiple templates
                </p>
              </div>

              {/* ATS Score Widget */}
              <Card className="min-w-[200px]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">ATS Score</span>
                    <Badge variant={atsScore.overallScore >= 80 ? "default" : "secondary"}>
                      {atsScore.overallScore}%
                    </Badge>
                  </div>
                  <Progress value={atsScore.overallScore} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {atsScore.suggestions.length} suggestions available
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" onClick={() => handleExport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Builder Mode Selector */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Tabs value={builderMode} onValueChange={(value) => setBuilderMode(value as any)}>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="guided" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Guided
                </TabsTrigger>
                <TabsTrigger value="freestyle" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Freestyle
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Builder Interface */}
        <div className="flex-1">
          {builderMode === 'guided' && (
            <div className="max-w-7xl mx-auto">
              <ThreePaneResumeBuilder 
                data={resumeData}
                onChange={handleDataChange}
                onSave={handleSave}
              />
            </div>
          )}

          {builderMode === 'freestyle' && (
            <div className="max-w-7xl mx-auto">
              <UnifiedResumeInterface
                mode="create"
                initialData={resumeData}
                onDataChange={handleDataChange}
              />
            </div>
          )}

          {builderMode === 'chat' && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    AI Resume Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ConversationalResumeBuilder />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ATS Insights Sidebar */}
        <div className="fixed right-4 top-1/2 -translate-y-1/2 w-80 z-20">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                ATS Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Keyword Density</span>
                  <span className="text-sm font-medium">{atsScore.keywordDensity}%</span>
                </div>
                <Progress value={atsScore.keywordDensity} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Formatting</span>
                  <span className="text-sm font-medium">{atsScore.formatting}%</span>
                </div>
                <Progress value={atsScore.formatting} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Section Structure</span>
                  <span className="text-sm font-medium">{atsScore.sections}%</span>
                </div>
                <Progress value={atsScore.sections} className="h-2" />
              </div>

              {/* Suggestions */}
              {atsScore.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Suggestions</h4>
                  <div className="space-y-2">
                    {atsScore.suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded text-muted-foreground">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  <Zap className="h-3 w-3 mr-2" />
                  AI Enhance Section
                </Button>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  <FileText className="h-3 w-3 mr-2" />
                  Generate Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AIResumeBuilder;