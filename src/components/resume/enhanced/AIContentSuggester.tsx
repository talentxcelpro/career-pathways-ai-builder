import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  RefreshCw, 
  Check, 
  Copy, 
  Wand2, 
  Target,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

interface AIContentSuggesterProps {
  sectionType: string;
  currentContent: any;
  onApplySuggestion: (content: any) => void;
}

export const AIContentSuggester: React.FC<AIContentSuggesterProps> = ({ 
  sectionType, 
  currentContent, 
  onApplySuggestion 
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const { enhanceResume } = useAIService();

  const generateSuggestions = async (enhancementType = 'general') => {
    setIsGenerating(true);
    try {
      const mockResumeData = {
        personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        settings: { templateId: 'modern', colorScheme: 'blue', fontFamily: 'Inter', fontSize: 14, spacing: 'normal' as const, sectionOrder: [] },
        metadata: { title: 'Test Resume', version: 1 },
        [sectionType]: currentContent
      };
      
      const result = await enhanceResume(
        mockResumeData,
        { 
          sections: [sectionType],
          enhancementType: enhancementType === 'general' || enhancementType === 'achievements' ? 'professional' : enhancementType as 'professional' | 'ats' | 'creative' | 'technical'
        }
      );

      if (result.success && result.data) {
        const newSuggestions = Array.isArray(result.data.suggestions) 
          ? result.data.suggestions 
          : [result.data];
        setSuggestions(newSuggestions);
        toast.success('AI suggestions generated!');
      } else {
        toast.error('Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Error generating suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomSuggestion = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a custom prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const mockResumeData = {
        personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
        experience: [],
        education: [],
        skills: [],
        settings: { templateId: 'modern', colorScheme: 'blue', fontFamily: 'Inter', fontSize: 14, spacing: 'normal' as const, sectionOrder: [] },
        metadata: { title: 'Test Resume', version: 1 },
        [sectionType]: currentContent
      };
      
      const result = await enhanceResume(
        mockResumeData,
        { 
          sectionType: sectionType as 'summary' | 'experience' | 'skills' | 'education' | 'all', 
          enhancementType: 'professional' as 'professional' | 'ats' | 'creative' | 'technical' as 'professional' | 'achievements' | 'ats' | 'creative' | 'technical'
        }
      );

      if (result.success && result.data) {
        const newSuggestion = {
          ...result.data,
          type: 'custom',
          prompt: customPrompt
        };
        setSuggestions([newSuggestion, ...suggestions]);
        setCustomPrompt('');
        toast.success('Custom suggestion generated!');
      } else {
        toast.error('Failed to generate custom suggestion');
      }
    } catch (error) {
      console.error('Error generating custom suggestion:', error);
      toast.error('Error generating custom suggestion');
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    onApplySuggestion(suggestion.content || suggestion);
    toast.success('Suggestion applied!');
  };

  const copySuggestion = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getSuggestionTypes = () => {
    const baseTypes = [
      { key: 'professional', label: 'Professional Tone', icon: <Sparkles className="h-4 w-4" /> },
      { key: 'achievements', label: 'Achievement Focus', icon: <Target className="h-4 w-4" /> },
      { key: 'ats', label: 'ATS Optimization', icon: <TrendingUp className="h-4 w-4" /> }
    ];

    const sectionSpecificTypes: Record<string, any[]> = {
      summary: [
        { key: 'compelling', label: 'Compelling Summary', icon: <MessageSquare className="h-4 w-4" /> }
      ],
      experience: [
        { key: 'impact', label: 'Impact Metrics', icon: <TrendingUp className="h-4 w-4" /> },
        { key: 'action_verbs', label: 'Action Verbs', icon: <Wand2 className="h-4 w-4" /> }
      ]
    };

    return [...baseTypes, ...(sectionSpecificTypes[sectionType] || [])];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          AI Content Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Enhancement Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Enhancements:</p>
          <div className="flex flex-wrap gap-2">
            {getSuggestionTypes().map(type => (
              <Button
                key={type.key}
                variant="outline"
                size="sm"
                onClick={() => generateSuggestions(type.key)}
                disabled={isGenerating}
              >
                {type.icon}
                <span className="ml-1">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Custom Request:</p>
          <div className="flex gap-2">
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Tell AI how to improve this section..."
              rows={2}
              className="flex-1"
            />
            <Button
              onClick={generateCustomSuggestion}
              disabled={isGenerating || !customPrompt.trim()}
              size="sm"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Generate All Button */}
        <Button 
          onClick={() => generateSuggestions('general')} 
          disabled={isGenerating}
          className="w-full"
          variant="default"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate All Suggestions'}
        </Button>

        {/* Suggestions Display */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Suggestions:</p>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.type || 'General'}
                      </Badge>
                      {suggestion.score && (
                        <Badge variant="outline" className="text-xs">
                          Score: {suggestion.score}/100
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySuggestion(
                          typeof suggestion.content === 'string' 
                            ? suggestion.content 
                            : JSON.stringify(suggestion.content)
                        )}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    {suggestion.title && (
                      <p className="font-medium">{suggestion.title}</p>
                    )}
                    
                    {typeof suggestion.content === 'string' ? (
                      <p className="text-muted-foreground">{suggestion.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {Object.entries(suggestion.content || {}).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium capitalize">{key}:</span>
                            <span className="ml-2 text-muted-foreground">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {suggestion.improvements && (
                      <div className="mt-2">
                        <p className="font-medium text-xs text-blue-600">Improvements:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {suggestion.improvements.map((improvement: string, i: number) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {suggestions.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No suggestions yet. Click the buttons above to get AI-powered content suggestions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};