import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Plus, X, Sparkles, Target } from "lucide-react";
import { ProfessionalSummary } from "@/types/enhanced-resume";

interface ProfessionalSummarySectionProps {
  data: ProfessionalSummary;
  onChange: (data: ProfessionalSummary) => void;
}

export const ProfessionalSummarySection: React.FC<ProfessionalSummarySectionProps> = ({
  data,
  onChange
}) => {
  const [newHighlight, setNewHighlight] = useState('');

  const updateContent = (content: string) => {
    onChange({
      ...data,
      content
    });
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      onChange({
        ...data,
        keyHighlights: [...(data.keyHighlights || []), newHighlight.trim()]
      });
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    const highlights = data.keyHighlights || [];
    onChange({
      ...data,
      keyHighlights: highlights.filter((_, i) => i !== index)
    });
  };

  const wordCount = data.content.split(/\s+/).filter(word => word.length > 0).length;
  const recommendedRange = { min: 50, max: 150 };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Professional Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Professional Summary *
              </label>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    wordCount < recommendedRange.min ? "destructive" : 
                    wordCount > recommendedRange.max ? "secondary" : 
                    "default"
                  }
                  className="text-xs"
                >
                  {wordCount} words
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Recommended: {recommendedRange.min}-{recommendedRange.max} words
                </div>
              </div>
            </div>
            <Textarea
              value={data.content}
              onChange={(e) => updateContent(e.target.value)}
              placeholder="Write a compelling 3-5 sentence summary highlighting your key achievements, skills, and career goals..."
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              <strong>Tips:</strong> Start with your job title or years of experience. 
              Include 2-3 key achievements with quantifiable results. 
              End with your career goals or what you bring to the role.
            </div>
          </div>

          {/* AI Enhancement Suggestion */}
          {data.content && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  AI Enhancement Available
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                Get AI suggestions to improve impact, clarity, and keyword optimization for your summary.
              </p>
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance Summary
              </Button>
            </div>
          )}
        </div>

        {/* Key Highlights */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <label className="text-sm font-medium">Key Highlights (Optional)</label>
          </div>
          
          <div className="space-y-3">
            {data.keyHighlights && data.keyHighlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.keyHighlights.map((highlight, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {highlight}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeHighlight(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Add a key achievement or highlight..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
              />
              <Button 
                onClick={addHighlight}
                disabled={!newHighlight.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Examples: "10+ years experience", "Led team of 15", "Increased revenue by 30%"
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <strong>Best Practices:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use action verbs and quantifiable achievements</li>
              <li>Tailor the summary to match job requirements</li>
              <li>Include relevant keywords from your industry</li>
              <li>Keep it concise but impactful</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};