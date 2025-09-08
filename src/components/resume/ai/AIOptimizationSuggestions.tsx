import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Lightbulb, Target, Zap, ArrowRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationSuggestion {
  id: string;
  type: 'summary' | 'experience' | 'skills' | 'projects' | 'education';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'keywords' | 'formatting' | 'content' | 'ats';
  originalText?: string;
  suggestedText: string;
  explanation: string;
}

interface AIOptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
  onApplySuggestion?: (suggestion: OptimizationSuggestion) => void;
  onApplyAll?: (suggestions: OptimizationSuggestion[]) => void;
}

export const AIOptimizationSuggestions: React.FC<AIOptimizationSuggestionsProps> = ({
  suggestions,
  onApplySuggestion,
  onApplyAll
}) => {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const handleApplySuggestion = (suggestion: OptimizationSuggestion) => {
    onApplySuggestion?.(suggestion);
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    toast.success('Suggestion applied successfully!');
  };

  const handleApplyAll = () => {
    onApplyAll?.(suggestions);
    setAppliedSuggestions(new Set(suggestions.map(s => s.id)));
    toast.success(`Applied ${suggestions.length} suggestions!`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'keywords': return <Target className="h-4 w-4" />;
      case 'formatting': return <Zap className="h-4 w-4" />;
      case 'content': return <Lightbulb className="h-4 w-4" />;
      case 'ats': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.type]) {
      acc[suggestion.type] = [];
    }
    acc[suggestion.type].push(suggestion);
    return acc;
  }, {} as Record<string, OptimizationSuggestion[]>);

  const sectionTitles = {
    summary: 'Professional Summary',
    experience: 'Work Experience',
    skills: 'Skills',
    projects: 'Projects',
    education: 'Education'
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Great Job!</h3>
          <p className="text-muted-foreground text-center">
            Your resume looks good! No optimization suggestions at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Optimization Suggestions</h2>
          <p className="text-muted-foreground">
            {suggestions.length} suggestions to improve your resume
          </p>
        </div>
        <Button 
          onClick={handleApplyAll}
          disabled={appliedSuggestions.size === suggestions.length}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Apply All Suggestions
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {suggestions.filter(s => s.impact === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">High Impact</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {suggestions.filter(s => s.impact === 'medium').length}
          </div>
          <div className="text-sm text-muted-foreground">Medium Impact</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {suggestions.filter(s => s.impact === 'low').length}
          </div>
          <div className="text-sm text-muted-foreground">Low Impact</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {appliedSuggestions.size}
          </div>
          <div className="text-sm text-muted-foreground">Applied</div>
        </Card>
      </div>

      {/* Suggestions by Section */}
      <Tabs defaultValue={Object.keys(groupedSuggestions)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {Object.keys(groupedSuggestions).map((type) => (
            <TabsTrigger key={type} value={type}>
              {sectionTitles[type as keyof typeof sectionTitles]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedSuggestions).map(([type, sectionSuggestions]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {sectionSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className={appliedSuggestions.has(suggestion.id) ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getCategoryIcon(suggestion.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {suggestion.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact.toUpperCase()} IMPACT
                      </Badge>
                      {appliedSuggestions.has(suggestion.id) && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Before/After Comparison */}
                  {suggestion.originalText && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-red-600 mb-2">Current:</div>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                          {suggestion.originalText}
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-green-600 mb-2">Suggested:</div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm relative">
                      {suggestion.suggestedText}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => copyToClipboard(suggestion.suggestedText)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Why this helps:</div>
                    <div className="text-sm text-blue-700">{suggestion.explanation}</div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleApplySuggestion(suggestion)}
                      disabled={appliedSuggestions.has(suggestion.id)}
                      variant={appliedSuggestions.has(suggestion.id) ? "outline" : "default"}
                    >
                      {appliedSuggestions.has(suggestion.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        'Apply Suggestion'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};