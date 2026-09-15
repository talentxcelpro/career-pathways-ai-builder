import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Copy, Loader2, TrendingUp, Lightbulb } from 'lucide-react';

interface AIPostNavigatorProps {
  onSuggestionApply: (suggestion: string) => void;
  currentContent?: string;
}

export const AIPostNavigator: React.FC<AIPostNavigatorProps> = ({
  onSuggestionApply,
  currentContent = '',
}) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const getFallbackSuggestions = (topicInput: string) => {
    const fallbackSuggestions: Record<string, string[]> = {
      'Career milestone': [
        `Excited to share that I have reached a new milestone in my career journey. ${topicInput || 'This achievement'} would not have been possible without the support of my team and network. Here is to new challenges ahead. #CareerGrowth #Professional`,
        `Reflecting on my recent ${topicInput || 'career achievement'} - it is incredible how much we can accomplish when we step out of our comfort zone. Grateful for every lesson learned along the way. #CareerDevelopment #Growth`,
        `Just hit a major ${topicInput || 'professional milestone'}. Looking back, I am grateful for the journey that got me here. What is your biggest career milestone this year? #Achievement #CareerJourney`,
      ],
      'Industry insights': [
        `The ${topicInput || 'industry'} landscape is evolving rapidly. Three trends I am watching closely: practical AI adoption, sharper customer expectations, and faster skill cycles. What trends are you noticing? #Industry #Innovation #Future`,
        `After recent industry conversations, I am excited about the direction we are heading in ${topicInput || 'our field'}. The focus on innovation and collaboration is inspiring. #IndustryTrends #Innovation`,
        `Sharing a few thoughts on the current state of ${topicInput || 'our industry'}. Today's constraints are creating tomorrow's best opportunities. How are you adapting? #Industry #Adaptation #Growth`,
      ],
      'Learning experience': [
        `Just completed a valuable ${topicInput || 'learning experience'} and came away with new clarity. Continuous learning is not only about staying relevant - it is about staying curious. #Learning #Growth`,
        `Investing in ${topicInput || 'professional development'} has been one of my best decisions this year. The skills and TalentNetwork gained are already changing how I work. #ProfessionalDevelopment #SkillBuilding`,
        `Reflecting on my recent ${topicInput || 'learning journey'} - it is amazing how much perspective comes from stepping back and learning deliberately. #Learning #PersonalGrowth`,
      ],
      'Team collaboration': [
        `Incredible things happen when diverse minds come together. Our recent ${topicInput || 'team project'} showed the power of collaboration, trust, and different perspectives. #Teamwork #Collaboration #Success`,
        `Shoutout to my team for ${topicInput || 'our recent collaborative effort'}. Projects like this remind me why great teams matter. #TeamWork #Gratitude #Success`,
        `The value of teamwork was clear during our ${topicInput || 'recent project'}. When everyone brings ownership and focus, the outcome gets better fast. #Team #Collaboration #Achievement`,
      ],
    };

    const normalizedTopic = topicInput.toLowerCase();
    const topicKey = Object.keys(fallbackSuggestions).find(key =>
      normalizedTopic.includes(key.toLowerCase())
    ) || 'Career milestone';

    return fallbackSuggestions[topicKey];
  };

  const getFallbackTips = () => [
    'Use emojis sparingly when they add clarity or warmth.',
    'Ask one specific question to encourage comments.',
    'Share concrete examples or numbers when possible.',
    'Tag relevant people or companies only when it is useful.',
    'Use 3-5 relevant hashtags to increase visibility.',
    'Keep the message concise but meaningful; aim for 100-300 words.',
    'Share your authentic experience and lessons learned.',
  ];

  const generateSuggestions = async () => {
    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      try {
        const { data: response, error } = await supabase.functions.invoke('ai-comprehensive', {
          body: {
            type: 'post-suggest',
            data: {
              topic: topic || 'Professional update',
              tone,
              platform: 'LinkedIn-style',
              userProfile: profile,
              currentContent,
            },
            userId: user.id,
          },
        });

        if (error) throw error;

        if (response?.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
          setTips(response.tips || getFallbackTips());
          toast.success('AI post suggestions generated.');
          return;
        }
      } catch (aiError) {
        console.log('AI generation failed, using fallback suggestions:', aiError);
      }

      setSuggestions(getFallbackSuggestions(topic));
      setTips(getFallbackTips());
      toast.success('Post suggestions generated.');
    } catch (error) {
      console.error('Post suggestion error:', error);
      setSuggestions(getFallbackSuggestions(topic));
      setTips(getFallbackTips());
      toast.success('Post suggestions generated.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard.');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'enthusiastic', label: 'Enthusiastic' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'educational', label: 'Educational' },
  ];

  const topicSuggestions = [
    'Career milestone',
    'Industry insights',
    'Learning experience',
    'Professional achievement',
    'Team collaboration',
    'Industry trends',
    'Personal growth',
    'Networking event',
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI Post Navigator
        </CardTitle>
        <CardDescription>
          Get Performance suggestions for engaging professional posts
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
                  className="cursor-pointer text-xs hover:bg-blue-100"
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
              Generate Post Suggestions
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              Post Suggestions:
            </h4>
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
                          aria-label="Copy post suggestion"
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
                    {tips.slice(0, 5).map((tip, index) => (
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



