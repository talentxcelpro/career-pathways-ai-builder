
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Copy, RefreshCw, Loader2, TrendingUp, Lightbulb } from 'lucide-react';

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

  // Fallback suggestions when AI is not available
  const getFallbackSuggestions = (topic: string, tone: string) => {
    const fallbackSuggestions = {
      'Career milestone': [
        `🎉 Excited to share that I've reached a new milestone in my career journey! ${topic || 'This achievement'} wouldn't have been possible without the support of my amazing team and network. Here's to new challenges ahead! #CareerGrowth #Professional`,
        `Reflecting on my recent ${topic || 'career achievement'} - it's incredible how much we can accomplish when we step out of our comfort zone. Grateful for every lesson learned along the way. #CareerDevelopment #Growth`,
        `Just hit a major ${topic || 'professional milestone'}! Looking back, I'm amazed at the journey that got me here. Thank you to everyone who believed in me and helped me grow. What's your biggest career milestone this year? #Achievement #CareerJourney`
      ],
      'Industry insights': [
        `The ${topic || 'industry'} landscape is evolving rapidly. Here are three key trends I'm seeing that will shape our future: 1) [Trend 1] 2) [Trend 2] 3) [Trend 3]. What trends are you noticing? #Industry #Innovation #Future`,
        `After attending recent industry events, I'm excited about the direction we're heading in ${topic || 'our field'}. The focus on innovation and collaboration is inspiring. What innovations are you most excited about? #IndustryTrends #Innovation`,
        `Sharing some thoughts on the current state of ${topic || 'our industry'}. The challenges we face today are creating opportunities for tomorrow's solutions. How are you adapting to these changes? #Industry #Adaptation #Growth`
      ],
      'Learning experience': [
        `Just completed an amazing ${topic || 'learning experience'} and I'm buzzing with new ideas! The key takeaway: continuous learning isn't just about staying relevant—it's about staying curious. What's the last thing you learned that changed your perspective? #Learning #Growth`,
        `Investing in ${topic || 'professional development'} has been one of my best decisions this year. The skills and connections I've gained are invaluable. Never stop learning! #ProfessionalDevelopment #SkillBuilding #LifelongLearning`,
        `Reflecting on my recent ${topic || 'learning journey'} - it's amazing how much clarity comes from stepping back and gaining new perspectives. Education truly is a lifelong journey. #Learning #PersonalGrowth #Education`
      ],
      'Team collaboration': [
        `Incredible things happen when diverse minds come together! Our recent ${topic || 'team project'} showcased the power of collaboration and different perspectives. Proud to work with such talented people. #Teamwork #Collaboration #Success`,
        `Shoutout to my amazing team for ${topic || 'our recent collaborative effort'}! It's projects like these that remind me why I love what I do. Great teams make the impossible possible. #TeamWork #Gratitude #Success`,
        `The magic of teamwork was on full display during our ${topic || 'recent project'}. When everyone brings their A-game, extraordinary things happen. Grateful for such dedicated colleagues! #Team #Collaboration #Achievement`
      ]
    };

    const topicKey = Object.keys(fallbackSuggestions).find(key => 
      topic.toLowerCase().includes(key.toLowerCase().replace(' ', ''))
    ) || 'Career milestone';

    return fallbackSuggestions[topicKey as keyof typeof fallbackSuggestions] || fallbackSuggestions['Career milestone'];
  };

  const getFallbackTips = () => [
    "Use emojis sparingly but effectively to make your post more engaging",
    "Ask questions to encourage comments and start conversations",
    "Share specific examples or numbers when possible to add credibility",
    "Tag relevant people or companies when appropriate",
    "Use 3-5 relevant hashtags to increase visibility",
    "Keep your message concise but meaningful - aim for 100-300 words",
    "Share your authentic experience and lessons learned"
  ];

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

      // Try AI generation first
      try {
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

        if (response?.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
          setTips(response.tips || getFallbackTips());
          toast.success('AI post suggestions generated!');
          return;
        }
      } catch (aiError) {
        console.log('AI generation failed, using fallback suggestions:', aiError);
      }

      // Fallback to template-based suggestions
      const fallbackSuggestions = getFallbackSuggestions(topic, tone);
      const fallbackTips = getFallbackTips();

      setSuggestions(fallbackSuggestions);
      setTips(fallbackTips);
      toast.success('Post suggestions generated!');

    } catch (error) {
      console.error('Post suggestion error:', error);
      // Even if there's an error, provide fallback suggestions
      const fallbackSuggestions = getFallbackSuggestions(topic, tone);
      setSuggestions(fallbackSuggestions);
      setTips(getFallbackTips());
      toast.success('Post suggestions generated!');
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
