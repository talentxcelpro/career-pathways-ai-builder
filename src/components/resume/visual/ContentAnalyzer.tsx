
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, TrendingUp, Lightbulb, Target } from "lucide-react";

interface SectionData {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
}

interface ContentAnalyzerProps {
  sections: SectionData[];
  template: string;
}

export const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({
  sections,
  template
}) => {
  // Calculate ATS Score
  const calculateATSScore = () => {
    let score = 0;
    const maxScore = 100;

    // Personal info check (20 points)
    const personalSection = sections.find(s => s.type === 'personal');
    if (personalSection?.content?.fullName) score += 5;
    if (personalSection?.content?.email) score += 5;
    if (personalSection?.content?.phone) score += 5;
    if (personalSection?.content?.title) score += 5;

    // Summary check (20 points)
    const summarySection = sections.find(s => s.type === 'summary');
    if (summarySection?.content && summarySection.content.length > 50) score += 20;

    // Experience check (30 points)
    const experienceSection = sections.find(s => s.type === 'experience');
    if (experienceSection?.content?.length > 0) score += 15;
    if (experienceSection?.content?.length >= 2) score += 15;

    // Skills check (20 points)
    const skillsSection = sections.find(s => s.type === 'skills');
    if (skillsSection?.content?.length > 0) score += 10;
    if (skillsSection?.content?.length >= 5) score += 10;

    // Education check (10 points)
    const educationSection = sections.find(s => s.type === 'education');
    if (educationSection?.content?.length > 0) score += 10;

    return Math.min(score, maxScore);
  };

  const atsScore = calculateATSScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getSuggestions = () => {
    const suggestions = [];
    
    const personalSection = sections.find(s => s.type === 'personal');
    if (!personalSection?.content?.fullName) {
      suggestions.push({ type: 'error', text: 'Add your full name' });
    }
    if (!personalSection?.content?.email) {
      suggestions.push({ type: 'error', text: 'Add your email address' });
    }

    const summarySection = sections.find(s => s.type === 'summary');
    if (!summarySection?.content || summarySection.content.length < 50) {
      suggestions.push({ type: 'warning', text: 'Add a professional summary (50+ characters)' });
    }

    const experienceSection = sections.find(s => s.type === 'experience');
    if (!experienceSection?.content || experienceSection.content.length === 0) {
      suggestions.push({ type: 'error', text: 'Add at least one work experience' });
    }

    const skillsSection = sections.find(s => s.type === 'skills');
    if (!skillsSection?.content || skillsSection.content.length < 5) {
      suggestions.push({ type: 'info', text: 'Add at least 5 relevant skills' });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  const keywordSuggestions = [
    'Project Management',
    'Leadership',
    'Communication',
    'Problem Solving',
    'Team Collaboration',
    'Strategic Planning'
  ];

  return (
    <div className="p-4 space-y-4">
      {/* ATS Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            ATS Compatibility Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
              {atsScore}%
            </div>
            <p className="text-sm text-muted-foreground">
              {getScoreStatus(atsScore)}
            </p>
          </div>
          
          <Progress value={atsScore} className="mb-4" />
          
          <div className="text-xs text-muted-foreground">
            This score indicates how well your resume will perform in Applicant Tracking Systems (ATS).
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suggestions.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Great! No major issues found.</span>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className={`w-4 h-4 mt-0.5 ${
                    suggestion.type === 'error' ? 'text-red-500' : 
                    suggestion.type === 'warning' ? 'text-yellow-500' : 
                    'text-blue-500'
                  }`} />
                  <span className="text-sm">{suggestion.text}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keyword Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Consider adding these popular keywords to improve your resume's visibility:
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {keywordSuggestions.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground">
                {keyword}
              </Badge>
            ))}
          </div>
          
          <Button size="sm" variant="outline" className="w-full">
            Get AI Keyword Suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Content Length Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Content Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total Sections:</span>
              <span>{sections.filter(s => s.isVisible).length}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Summary Length:</span>
              <span className={
                sections.find(s => s.type === 'summary')?.content?.length > 100 
                  ? 'text-green-600' : 'text-yellow-600'
              }>
                {sections.find(s => s.type === 'summary')?.content?.length || 0} characters
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Work Experiences:</span>
              <span>{sections.find(s => s.type === 'experience')?.content?.length || 0}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Skills Listed:</span>
              <span>{sections.find(s => s.type === 'skills')?.content?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button size="sm" variant="outline" className="w-full">
          AI Content Suggestions
        </Button>
        <Button size="sm" variant="outline" className="w-full">
          Industry-Specific Tips
        </Button>
        <Button size="sm" variant="outline" className="w-full">
          Export Analysis Report
        </Button>
      </div>
    </div>
  );
};
