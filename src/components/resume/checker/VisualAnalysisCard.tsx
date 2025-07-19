
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Eye, Layout, Palette, Type, AlignJustify, Monitor } from 'lucide-react';

interface VisualAnalysis {
  overallScore: number;
  layoutScore: number;
  readabilityScore: number;
  professionalismScore: number;
  spaceUtilization: number;
  fontConsistency: number;
  visualHierarchy: number;
  heatmapData: Array<{
    section: string;
    attentionScore: number;
    viewTime: number;
  }>;
  designIssues: string[];
  recommendations: string[];
}

interface VisualAnalysisCardProps {
  analysis: VisualAnalysis;
}

export const VisualAnalysisCard: React.FC<VisualAnalysisCardProps> = ({ analysis }) => {
  const getAttentionColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-indigo-500" />
          Visual & Layout Analysis
          <Badge variant="secondary" className="ml-auto">
            {analysis.overallScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Visual Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Layout</span>
            </div>
            <Progress value={analysis.layoutScore} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.layoutScore}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Typography</span>
            </div>
            <Progress value={analysis.fontConsistency} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.fontConsistency}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlignJustify className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Spacing</span>
            </div>
            <Progress value={analysis.spaceUtilization} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.spaceUtilization}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Readability</span>
            </div>
            <Progress value={analysis.readabilityScore} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.readabilityScore}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">Professionalism</span>
            </div>
            <Progress value={analysis.professionalismScore} className="h-2" />
            <span className="text-xs text-gray-600">{analysis.professionalismScore}%</span>
          </div>
        </div>

        {/* Recruiter Attention Heatmap */}
        <div className="space-y-3">
          <h4 className="font-medium text-indigo-600 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Recruiter Attention Heatmap
          </h4>
          <div className="space-y-2">
            {analysis.heatmapData.map((section, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">{section.section}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getAttentionColor(section.attentionScore)}`}
                    style={{ width: `${section.attentionScore}%` }}
                  />
                </div>
                <div className="w-16 text-xs text-gray-600">
                  {section.viewTime}s avg
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Design Issues */}
        {analysis.designIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Design Issues:</h4>
            <ul className="space-y-1">
              {analysis.designIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Visual Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600">Visual Improvements:</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Design Tips */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <h5 className="font-medium text-indigo-800 mb-2">Visual Design Tips:</h5>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• Use consistent fonts and font sizes throughout</li>
            <li>• Maintain proper white space for better readability</li>
            <li>• Ensure adequate contrast between text and background</li>
            <li>• Keep the design clean and professional</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
