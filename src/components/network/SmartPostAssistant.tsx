import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Lightbulb, Sparkles, MessageSquare } from 'lucide-react';
import { aiService, isAIFeatureAvailable } from '@/services/aiService';
import { AIStatusIndicator } from '@/components/ui/AIStatusIndicator';
import { toast } from 'sonner';

interface SmartPostAssistantProps {
  userProfile?: any;
  onPostGenerated?: (content: string) => void;
}

const SmartPostAssistant: React.FC<SmartPostAssistantProps> = ({ 
  userProfile, 
  onPostGenerated 
}) => {
  const [loading, setLoading] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generatePostSuggestions = async () => {
    setLoading(true);
    try {
      // Check if AI feature is available
      const isAvailable = await isAIFeatureAvailable('Network', 'smart_post_suggestions');
      if (!isAvailable) {
        toast.error('AI post suggestions are currently unavailable');
        return;
      }

      const response = await aiService.suggestPosts(
        userProfile || {
          name: 'Professional User',
          title: 'Career Professional',
          industry: 'Technology',
          experience: '5+ years'
        },
        [], // recent activity - could be passed from parent
        'professional network'
      );

      if (response.success && response.data) {
        try {
          // Parse the AI response to extract multiple post suggestions
          const result = response.data.result;
          const posts = result.split(/\d+\./).filter(post => post.trim()).slice(0, 3);
          setGeneratedPosts(posts.map(post => post.trim()));
          setShowSuggestions(true);
          toast.success('AI generated post suggestions successfully!');
        } catch (error) {
          // Fallback if parsing fails
          setGeneratedPosts([response.data.result]);
          setShowSuggestions(true);
        }
      } else {
        toast.error(response.error || 'Failed to generate post suggestions');
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  const usePost = (post: string) => {
    onPostGenerated?.(post);
    setShowSuggestions(false);
    toast.success('Post content applied!');
  };

  return (
    <div className="space-y-4">
      {/* AI Assistant Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <AIStatusIndicator module="Network" feature="smart_post_suggestions">
              <Brain className="h-5 w-5" />
            </AIStatusIndicator>
            Smart Post Assistant
          </CardTitle>
          <CardDescription className="text-blue-600">
            Get AI-powered post suggestions tailored to your professional network
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={generatePostSuggestions} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating suggestions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Post Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Generated Suggestions */}
      {showSuggestions && generatedPosts.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Lightbulb className="h-5 w-5" />
              AI-Generated Post Ideas
            </CardTitle>
            <CardDescription className="text-green-600">
              Choose a post idea to use or get inspiration from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPosts.map((post, index) => (
              <div key={index} className="bg-white border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Suggestion #{index + 1}
                  </Badge>
                  <Button 
                    size="sm" 
                    onClick={() => usePost(post)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Use This Post
                  </Button>
                </div>
                <Textarea 
                  value={post} 
                  readOnly 
                  className="resize-none border-green-200 focus:border-green-400"
                  rows={4}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSuggestions(false)}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                Close Suggestions
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generatePostSuggestions}
                disabled={loading}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Generate More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartPostAssistant;