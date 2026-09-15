import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Wand2, FileText, Image, Video, Sparkles, TrendingUp, Target } from 'lucide-react';
import { useAIContentAssistant } from '@/hooks/useAIContentAssistant';

export const AIContentAssistant: React.FC = () => {
  const {
    contentSuggestions,
    generateContent,
    optimizeContent,
    analyzePerformance,
    isGenerating
  } = useAIContentAssistant();

  return (
    <div className="space-y-6">
      {/* Content Generation Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Generate Post</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered professional posts
            </p>
            <Button 
              onClick={() => generateContent({ type: 'post' })}
              disabled={isGenerating}
              className="w-full"
              size="sm"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-secondary/30 hover:border-secondary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Image className="h-8 w-8 mx-auto mb-3 text-secondary" />
            <h3 className="font-semibold mb-2">Visual Content</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create engaging visuals
            </p>
            <Button 
              variant="secondary"
              onClick={() => generateContent({ type: 'visual' })}
              disabled={isGenerating}
              className="w-full"
              size="sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-accent/30 hover:border-accent/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Video className="h-8 w-8 mx-auto mb-3 text-accent" />
            <h3 className="font-semibold mb-2">Video Script</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate video scripts
            </p>
            <Button 
              variant="outline"
              onClick={() => generateContent({ type: 'video' })}
              disabled={isGenerating}
              className="w-full"
              size="sm"
            >
              <Bot className="h-4 w-4 mr-2" />
              Script
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Content Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Content Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Content</label>
            <Textarea 
              placeholder="Paste your content here for AI optimization..."
              className="min-h-[120px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Target Audience</label>
            <Input placeholder="e.g., Software Engineers, HR Professionals..." />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => optimizeContent()}
              disabled={isGenerating}
              className="flex-1"
            >
              <Target className="h-4 w-4 mr-2" />
              Optimize for Engagement
            </Button>
            <Button 
              variant="outline"
              onClick={() => analyzePerformance()}
              disabled={isGenerating}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Content Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contentSuggestions.length > 0 ? (
            <div className="space-y-4">
              {contentSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{suggestion.type}</Badge>
                      <Badge variant="outline">{suggestion.confidence}% match</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Use Template
                    </Button>
                  </div>
                  <h3 className="font-semibold mb-2">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.content}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>📈 {suggestion.engagementPotential} engagement</span>
                    <span>🎯 {suggestion.audienceMatch} audience match</span>
                    <span>⏱️ Best time: {suggestion.bestTime}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">AI is Learning</h3>
              <p className="text-muted-foreground">
                Post content to get personalized AI suggestions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Post Engagement</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-[75%]"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Optimization Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[85%]"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Audience Relevance</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-[90%]"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">90%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Optimize Posting Time</p>
                  <p className="text-xs text-muted-foreground">
                    Post between 2-4 PM for 40% higher engagement
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Use Trending Keywords</p>
                  <p className="text-xs text-muted-foreground">
                    Include "remote work" and "AI tools" in your content
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Add Visual Elements</p>
                  <p className="text-xs text-muted-foreground">
                    Posts with images get 65% more engagement
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};