import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, CheckCircle, AlertTriangle, TrendingUp, Eye, Download, Sparkles } from "lucide-react";

const AIResumeAnalyzer = () => {
  const [analysisData] = useState({
    overallScore: 85,
    atsScore: 78,
    strengths: [
      'Strong technical skills section with relevant keywords',
      'Quantified achievements in work experience',
      'Clean, professional formatting',
      'Relevant education and certifications',
      'Active GitHub and portfolio links'
    ],
    improvements: [
      'Add more industry-specific keywords for ATS optimization',
      'Include soft skills with specific examples',
      'Optimize section ordering for better impact',
      'Add metrics to more achievements',
      'Consider adding a professional summary'
    ],
    keywordOptimization: {
      present: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Git'],
      missing: ['AWS', 'Docker', 'Kubernetes', 'GraphQL', 'CI/CD'],
      overused: ['Responsible for', 'Worked on']
    },
    industryComparison: {
      topPerformers: 92,
      average: 73,
      yourScore: 85,
      percentile: 78
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 60) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">TalentXcel AI Resume Analyzer</h2>
            <p className="text-muted-foreground">Get instant feedback to optimize your resume with TalentXcel AI</p>
          </div>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload New Resume
        </Button>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">Overall Score</span>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(analysisData.overallScore)}`}>
              {analysisData.overallScore}
            </div>
            <Progress value={analysisData.overallScore} className="h-3" />
            <Badge variant={getScoreVariant(analysisData.overallScore)}>
              Excellent Resume
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span className="font-medium">ATS Compatibility</span>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(analysisData.atsScore)}`}>
              {analysisData.atsScore}
            </div>
            <Progress value={analysisData.atsScore} className="h-3" />
            <Badge variant={getScoreVariant(analysisData.atsScore)}>
              Good Compatibility
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">Industry Percentile</span>
            </div>
            <div className="text-4xl font-bold text-green-600">
              {analysisData.industryComparison.percentile}th
            </div>
            <Progress value={analysisData.industryComparison.percentile} className="h-3" />
            <Badge variant="default">
              Above Average
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="strengths" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strengths" className="space-y-4">
              <div className="space-y-3">
                {analysisData.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">{strength}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="improvements" className="space-y-4">
              <div className="space-y-3">
                {analysisData.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm">{improvement}</span>
                      <Button variant="link" size="sm" className="h-auto p-0 ml-2">
                        Fix this
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="keywords" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-green-600">Present Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.keywordOptimization.present.map((keyword, index) => (
                      <Badge key={index} variant="default">{keyword}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-yellow-600">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.keywordOptimization.missing.map((keyword, index) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Overused Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.keywordOptimization.overused.map((phrase, index) => (
                      <Badge key={index} variant="destructive">{phrase}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="benchmark" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisData.industryComparison.topPerformers}
                    </div>
                    <div className="text-sm text-muted-foreground">Top 10% Average</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisData.industryComparison.yourScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Your Score</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {analysisData.industryComparison.average}
                    </div>
                    <div className="text-sm text-muted-foreground">Industry Average</div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm">
                    Your resume scores higher than {analysisData.industryComparison.percentile}% of resumes in your field. 
                    With a few optimizations, you could reach the top 10% benchmark of {analysisData.industryComparison.topPerformers}.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Auto-Optimize Resume
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline">
          Schedule Review Call
        </Button>
      </div>
    </div>
  );
};

export default AIResumeAnalyzer;