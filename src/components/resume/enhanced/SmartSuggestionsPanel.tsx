import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  Wand2, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Star,
  Target,
  Zap,
  ArrowRight,
  Copy,
  Eye
} from 'lucide-react';
import { SmartSuggestion } from '@/hooks/useSmartSuggestions';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface SmartSuggestionsPanelProps {
  suggestions: SmartSuggestion[];
  isGenerating: boolean;
  onApplySuggestion: (suggestion: SmartSuggestion) => void;
  onGenerateMore?: (section: string) => void;
  onPreviewSuggestion?: (suggestion: SmartSuggestion) => void;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  suggestions,
  isGenerating,
  onApplySuggestion,
  onGenerateMore,
  onPreviewSuggestion
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const filterSuggestionsByTab = (tab: string) => {
    if (tab === 'all') return suggestions;
    if (tab === 'high-impact') return suggestions.filter(s => s.impact === 'high');
    if (tab === 'quick-wins') return suggestions.filter(s => s.confidence >= 90);
    return suggestions.filter(s => s.type === tab);
  };

  const handleApplySuggestion = (suggestion: SmartSuggestion) => {
    onApplySuggestion(suggestion);
    setAppliedSuggestions(prev => new Set(prev).add(suggestion.id));
    toast.success('Suggestion applied successfully!');
  };

  const handleCopySuggestion = (suggestion: SmartSuggestion) => {
    navigator.clipboard.writeText(suggestion.content);
    toast.success('Suggestion copied to clipboard');
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <Lightbulb className="h-4 w-4" />;
      case 'formatting': return <Target className="h-4 w-4" />;
      case 'keyword': return <Zap className="h-4 w-4" />;
      case 'achievement': return <Star className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const filteredSuggestions = filterSuggestionsByTab(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Smart Suggestions
            </span>
            <Badge variant="secondary">
              {suggestions.length} suggestions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {suggestions.filter(s => s.impact === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Impact</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {suggestions.filter(s => s.impact === 'medium').length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Impact</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {suggestions.filter(s => s.impact === 'low').length}
              </div>
              <div className="text-sm text-muted-foreground">Quick Wins</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions Content */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-6 pb-0">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high-impact">High Impact</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="keyword">Keywords</TabsTrigger>
                <TabsTrigger value="achievement">Achievements</TabsTrigger>
                <TabsTrigger value="quick-wins">Quick Wins</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {isGenerating ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Generating smart suggestions...</p>
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No suggestions available for this filter
                  </p>
                  {onGenerateMore && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => onGenerateMore('all')}
                    >
                      Generate More Suggestions
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-2 ${
                          appliedSuggestions.has(suggestion.id) 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(suggestion.type)}
                              <Badge 
                                variant="secondary" 
                                className={getImpactColor(suggestion.impact)}
                              >
                                {suggestion.impact.toUpperCase()}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-medium">{suggestion.title}</h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {suggestion.section} • {suggestion.confidence}% confidence
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {appliedSuggestions.has(suggestion.id) ? (
                              <Badge variant="secondary" className="bg-green-50 text-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Applied
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopySuggestion(suggestion)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {onPreviewSuggestion && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onPreviewSuggestion(suggestion)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => handleApplySuggestion(suggestion)}
                                >
                                  Apply
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.description}
                        </p>

                        <div className="bg-muted/50 rounded-lg p-3">
                          <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                            Suggested Content
                          </h5>
                          <p className="text-sm font-mono whitespace-pre-wrap">
                            {suggestion.content}
                          </p>
                        </div>

                        <div className="mt-3 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                          {suggestion.reasoning}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generate More Button */}
      {onGenerateMore && !isGenerating && (
        <Card>
          <CardContent className="text-center p-6">
            <Button 
              onClick={() => onGenerateMore('all')}
              variant="outline"
              className="w-full"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate More AI Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};