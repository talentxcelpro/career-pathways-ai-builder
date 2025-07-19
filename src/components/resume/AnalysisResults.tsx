
import React from 'react';
import { AppleCard, AppleCardContent, AppleCardHeader, AppleCardTitle } from '@/components/ui/apple-card';
import { AppleButton } from '@/components/ui/apple-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComprehensiveResumeAnalysis } from '@/services/resumeAnalysisService';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Eye, 
  Target,
  Award,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: ComprehensiveResumeAnalysis;
  onReanalyze: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, onReanalyze }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const HeatmapVisualization = () => (
    <div className="grid grid-cols-2 gap-4">
      {analysis.visualAnalysis.heatmapData.map((section, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{section.section}</span>
            <span className="text-xs text-gray-500">{section.attention}% attention</span>
          </div>
          <div 
            className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{
              background: `linear-gradient(45deg, hsl(${section.attention * 1.2}, 70%, 50%), hsl(${section.attention * 1.2}, 70%, 70%))`
            }}
          >
            {section.section}
          </div>
          <div className="text-xs text-gray-600">
            {section.recommendations[0]}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <AppleCard className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, hsl(${analysis.overallScore * 1.2}, 70%, 50%), hsl(${analysis.overallScore * 1.2}, 70%, 70%))`
          }}
        />
        <AppleCardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <AppleCardTitle className="text-2xl">Overall Resume Score</AppleCardTitle>
              <p className="text-gray-600 mt-1">Your resume performance analysis</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <Badge className={getGradeColor(analysis.grade)}>
                Grade {analysis.grade}
              </Badge>
            </div>
          </div>
        </AppleCardHeader>
        <AppleCardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(analysis.subScores).map(([key, score]) => (
              <div key={key} className="text-center">
                <div className={`text-xl font-semibold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {key === 'ats' ? 'ATS' : key}
                </div>
                <Progress value={score} className="mt-2 h-2" />
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Industry Benchmark</span>
            </div>
            <p className="text-sm text-blue-700">
              Your resume scores in the <strong>{analysis.industryBenchmark.percentile}th percentile</strong> - 
              {' '}{analysis.industryBenchmark.competitiveness} compared to industry average of {analysis.industryBenchmark.averageScore}.
            </p>
          </div>
        </AppleCardContent>
      </AppleCard>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="ats" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ats">ATS Check</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="ats" className="space-y-4">
          <AppleCard>
            <AppleCardHeader>
              <AppleCardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                ATS Compatibility Analysis
              </AppleCardTitle>
            </AppleCardHeader>
            <AppleCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>ATS Readability Score</span>
                  <span className={`font-semibold ${getScoreColor(analysis.atsAnalysis.readabilityScore)}`}>
                    {analysis.atsAnalysis.readabilityScore}/100
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">Format Compatibility</h4>
                    {Object.entries(analysis.atsAnalysis.formatCompatibility).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {typeof value === 'boolean' ? (
                          <>
                            {value ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          </>
                        ) : (
                          <span className="capitalize">{key}: {Array.isArray(value) ? value.join(', ') : value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Issues Found</h4>
                    {analysis.atsAnalysis.issues.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>No ATS issues detected</span>
                      </div>
                    ) : (
                      analysis.atsAnalysis.issues.map((issue, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(issue.severity)}
                            <span className="text-sm font-medium">{issue.message}</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-6">{issue.suggestion}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </AppleCardContent>
          </AppleCard>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <AppleCard>
            <AppleCardHeader>
              <AppleCardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Keyword Optimization
              </AppleCardTitle>
            </AppleCardHeader>
            <AppleCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Keyword Match Score</span>
                  <span className={`font-semibold ${getScoreColor(analysis.keywordAnalysis.matchScore)}`}>
                    {analysis.keywordAnalysis.matchScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Matched Keywords ({analysis.keywordAnalysis.matchedKeywords.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keywordAnalysis.matchedKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Missing Keywords ({analysis.keywordAnalysis.missingKeywords.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keywordAnalysis.missingKeywords.slice(0, 8).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="border-orange-200 text-orange-700">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Skill Gaps</h4>
                    <div className="space-y-2">
                      {analysis.keywordAnalysis.skillGaps.slice(0, 3).map((gap, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{gap.skill}</div>
                          <div className="text-xs text-gray-600">{gap.suggestion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AppleCardContent>
          </AppleCard>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <AppleCard>
            <AppleCardHeader>
              <AppleCardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Content Quality Analysis
              </AppleCardTitle>
            </AppleCardHeader>
            <AppleCardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.contentQuality.grammarScore)}`}>
                      {analysis.contentQuality.grammarScore}
                    </div>
                    <div className="text-sm text-gray-600">Grammar</div>
                    <Progress value={analysis.contentQuality.grammarScore} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.contentQuality.styleScore)}`}>
                      {analysis.contentQuality.styleScore}
                    </div>
                    <div className="text-sm text-gray-600">Style</div>
                    <Progress value={analysis.contentQuality.styleScore} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(analysis.contentQuality.achievementScore)}`}>
                      {analysis.contentQuality.achievementScore}
                    </div>
                    <div className="text-sm text-gray-600">Achievements</div>
                    <Progress value={analysis.contentQuality.achievementScore} className="mt-2" />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Improvement Suggestions</h4>
                  <div className="space-y-3">
                    {analysis.contentQuality.bulletPointAnalysis.slice(0, 3).map((bullet, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Original:</span> {bullet.original}
                        </div>
                        <div className="text-sm text-green-700">
                          <span className="font-medium">Enhanced:</span> {bullet.rewriteExample}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">STAR Score:</span>
                          <Progress value={bullet.starMethodScore} className="flex-1 h-2" />
                          <span className="text-xs font-medium">{bullet.starMethodScore}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AppleCardContent>
          </AppleCard>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <AppleCard>
            <AppleCardHeader>
              <AppleCardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visual Analysis & Recruiter Attention
              </AppleCardTitle>
            </AppleCardHeader>
            <AppleCardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Document Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Layout Score</span>
                        <span className={`font-semibold ${getScoreColor(analysis.visualAnalysis.layoutScore)}`}>
                          {analysis.visualAnalysis.layoutScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Formatting Score</span>
                        <span className={`font-semibold ${getScoreColor(analysis.visualAnalysis.formattingScore)}`}>
                          {analysis.visualAnalysis.formattingScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Word Count</span>
                        <span>{analysis.visualAnalysis.lengthAnalysis.wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Page Count</span>
                        <span>{analysis.visualAnalysis.lengthAnalysis.pageCount}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">Length Recommendation</div>
                      <div className="text-sm text-blue-700">{analysis.visualAnalysis.lengthAnalysis.recommendation}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recruiter Attention Heatmap</h4>
                    <HeatmapVisualization />
                  </div>
                </div>
              </div>
            </AppleCardContent>
          </AppleCard>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <AppleCard>
            <AppleCardHeader>
              <AppleCardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Actionable Insights & Recommendations
              </AppleCardTitle>
            </AppleCardHeader>
            <AppleCardContent>
              <div className="space-y-4">
                {analysis.actionableInsights.map((insight, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 ${
                      insight.priority === 'high' ? 'border-red-200 bg-red-50' :
                      insight.priority === 'medium' ? 'border-orange-200 bg-orange-50' :
                      'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={insight.priority === 'high' ? 'destructive' : 
                                   insight.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {insight.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <span className="font-medium">{insight.category}</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Issue: </span>
                            <span className="text-sm">{insight.issue}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Solution: </span>
                            <span className="text-sm">{insight.solution}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Expected Impact: </span>
                            {insight.impact}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AppleCardContent>
          </AppleCard>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <AppleButton onClick={onReanalyze} variant="outline" size="lg">
          Run Analysis Again
        </AppleButton>
      </div>
    </div>
  );
};
