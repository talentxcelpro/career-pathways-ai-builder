
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Copy, RefreshCw, Loader2, TrendingUp } from 'lucide-react';

interface AIPostAssistantProps {
  onSuggestionApply: (suggestion: string) => void;
  currentContent?: string;
}

export const AIPostAssistant: React.FC<AIPostAssistantProps> = ({
  onSuggestionApply,
  currentContent = ''
}) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const { data: response, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          type: 'post-suggest',
          data: {
            topic: topic || 'Professional update',
            tone,
            platform: 'LinkedIn-style',
            userProfile: profile,
            currentContent
          },
          userId: user?.id
        }
      });

      if (error) throw error;

      setSuggestions(response.suggestions || []);
      setTips(response.tips || []);
      toast.success('Post suggestions generated!');
    } catch (error) {
      console.error('Post suggestion error:', error);
      toast.error('Failed to generate post suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'educational', label: 'Educational' }
  ];

  const topicSuggestions = [
    'Career milestone',
    'Industry insights',
    'Learning experience',
    'Professional achievement',
    'Team collaboration',
    'Industry trends',
    'Personal growth',
    'Networking event'
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI Post Assistant
        </CardTitle>
        <CardDescription>
          Get AI-powered suggestions for engaging professional posts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Topic or Theme
            </label>
            <Input
              placeholder="What would you like to post about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {topicSuggestions.slice(0, 4).map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="outline"
                  className="cursor-pointer text-xs"
                  onClick={() => setTopic(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tone
            </label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Suggestions
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">AI Post Suggestions:</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">Option {index + 1}</Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(suggestion)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onSuggestionApply(suggestion)}
                        >
                          Use This
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {suggestion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {tips.length > 0 && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <TrendingUp className="h-4 w-4" />
                    Engagement Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-yellow-800">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
