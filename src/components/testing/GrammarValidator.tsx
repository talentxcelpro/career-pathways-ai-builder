import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, AlertCircle } from "lucide-react";

interface GrammarIssue {
  type: 'grammar' | 'tone' | 'style' | 'readability';
  severity: 'low' | 'medium' | 'high';
  message: string;
  context: string;
  suggestion: string;
}

export function GrammarValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  const runGrammarValidation = async () => {
    setIsValidating(true);
    setValidationProgress(0);
    setGrammarIssues([]);
    setOverallScore(null);

    // Simulate grammar validation process
    const mockIssues: GrammarIssue[] = [
      {
        type: 'tone',
        severity: 'medium',
        message: 'Inconsistent professional tone detected',
        context: 'Resume summary section',
        suggestion: 'Maintain consistent professional language throughout'
      },
      {
        type: 'grammar',
        severity: 'low',
        message: 'Minor punctuation inconsistency',
        context: 'Job description bullet points',
        suggestion: 'Use consistent punctuation in lists'
      },
      {
        type: 'readability',
        severity: 'low',
        message: 'Some sentences could be more concise',
        context: 'Cover letter body',
        suggestion: 'Consider shorter, more impactful sentences'
      }
    ];

    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setValidationProgress(i);
    }

    setGrammarIssues(mockIssues);
    setOverallScore(87); // Mock score
    setIsValidating(false);
  };

  const getIssueIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getIssueVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Grammar & Tone Validator
          </CardTitle>
          <Button
            onClick={runGrammarValidation}
            disabled={isValidating}
            size="sm"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isValidating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing grammar and tone...</span>
              <span>{validationProgress}%</span>
            </div>
            <Progress value={validationProgress} />
          </div>
        )}

        {overallScore !== null && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Overall Quality Score</span>
            <Badge variant={overallScore >= 90 ? 'default' : overallScore >= 70 ? 'outline' : 'destructive'}>
              {overallScore}%
            </Badge>
          </div>
        )}

        {grammarIssues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Issues Found ({grammarIssues.length})</h4>
            {grammarIssues.map((issue, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIssueIcon(issue.severity)}
                    <span className="font-medium capitalize">{issue.type}</span>
                  </div>
                  <Badge variant={getIssueVariant(issue.severity)}>
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-sm">{issue.message}</p>
                <div className="text-xs bg-muted p-2 rounded">
                  <strong>Context:</strong> {issue.context}
                </div>
                <div className="text-xs bg-green-50 p-2 rounded">
                  <strong>Suggestion:</strong> {issue.suggestion}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isValidating && grammarIssues.length === 0 && overallScore === null && (
          <div className="text-center py-4 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            <p>No validation results yet. Run validation to begin.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}