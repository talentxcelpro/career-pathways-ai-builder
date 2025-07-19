
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle, Lightbulb, Target, Zap } from 'lucide-react';

interface ContentSuggestion {
  id: string;
  type: 'improvement' | 'addition' | 'replacement';
  section: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  originalText?: string;
  suggestedText?: string;
}

interface GrammarIssue {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  text: string;
  suggestion: string;
  position: { start: number; end: number };
  severity: 'error' | 'warning' | 'suggestion';
}

interface ContentIntelligencePanelProps {
  grammarIssues: GrammarIssue[];
  suggestions: Record<string, ContentSuggestion[]>;
  industryKeywords: string[];
  onApplySuggestion: (suggestion: ContentSuggestion) => void;
}

export const ContentIntelligencePanel: React.FC<ContentIntelligencePanelProps> = ({
  grammarIssues,
  suggestions,
  industryKeywords,
  onApplySuggestion
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');

  const allSuggestions = Object.values(suggestions).flat();
  const highImpactSuggestions = allSuggestions.filter(s => s.impact === 'high');
  const grammarErrors = grammarIssues.filter(g => g.severity === 'error');
  const styleWarnings = grammarIssues.filter(g => g.severity === 'warning');

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Content Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="suggestions" className="text-xs">
              Suggestions
              {highImpactSuggestions.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {highImpactSuggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="grammar" className="text-xs">
              Grammar
              {grammarErrors.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                  {grammarErrors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="keywords" className="text-xs">
              Keywords
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <ScrollArea className="h-96">
              {allSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Great! No suggestions at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getImpactColor(suggestion.impact)}>
                              {suggestion.impact}
                            </Badge>
                            <span className="text-sm font-medium">{suggestion.section}</span>
                          </div>
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-gray-600">{suggestion.description}</p>
                        </div>
                      </div>
                      {suggestion.originalText && suggestion.suggestedText && (
                        <div className="bg-gray-50 rounded p-2 text-xs">
                          <div className="mb-1">
                            <span className="font-medium text-red-600">Current:</span>
                            <p className="text-gray-700">{suggestion.originalText}</p>
                          </div>
                          <div>
                            <span className="font-medium text-green-600">Suggested:</span>
                            <p className="text-gray-700">{suggestion.suggestedText}</p>
                          </div>
                        </div>
                      )}
                      <Button
                        size="sm"
                        onClick={() => onApplySuggestion(suggestion)}
                        className="w-full"
                      >
                        Apply Suggestion
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="grammar" className="space-y-4">
            <ScrollArea className="h-96">
              {grammarIssues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Perfect! No grammar issues found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grammarIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {issue.type}
                            </Badge>
                          </div>
                          <div className="bg-gray-50 rounded p-2 text-xs">
                            <div className="mb-1">
                              <span className="font-medium text-red-600">Issue:</span>
                              <p className="text-gray-700">{issue.text}</p>
                            </div>
                            <div>
                              <span className="font-medium text-green-600">Suggestion:</span>
                              <p className="text-gray-700">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        Fix Issue
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Industry Keywords
                </h4>
                <div className="flex flex-wrap gap-1">
                  {industryKeywords.slice(0, 15).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Keyword Optimization Tips</h4>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Include relevant keywords naturally in your experience descriptions</li>
                  <li>• Use industry-specific terminology</li>
                  <li>• Match keywords from job postings you're targeting</li>
                  <li>• Avoid keyword stuffing - maintain readability</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
