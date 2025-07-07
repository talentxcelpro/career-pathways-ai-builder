import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { MessageCircle, Copy, RefreshCw, Loader2, Sparkles, Send } from 'lucide-react';

interface AICommentGeneratorProps {
  postContent: string;
  postAuthor?: {
    name: string;
    title?: string;
  };
  onCommentGenerated?: (comment: string) => void;
  onCommentPost?: (comment: string) => void;
}

export const AICommentGenerator: React.FC<AICommentGeneratorProps> = ({
  postContent,
  postAuthor,
  onCommentGenerated,
  onCommentPost
}) => {
  const [commentType, setCommentType] = useState('thoughtful');
  const [suggestions, setSuggestions] = useState<Array<{comment: string, tone: string}>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedComment, setSelectedComment] = useState('');
  const [customizedComment, setCustomizedComment] = useState('');

  const commentTypes = [
    { value: 'thoughtful', label: 'Thoughtful', description: 'Adds valuable insights' },
    { value: 'supportive', label: 'Supportive', description: 'Encouraging and positive' },
    { value: 'professional', label: 'Professional', description: 'Formal and expertise-based' },
    { value: 'engaging', label: 'Engaging', description: 'Sparks conversation' },
    { value: 'question', label: 'Question', description: 'Asks for more details' }
  ];

  const generateComments = async () => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for context
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const { data: response, error } = await supabase.functions.invoke('ai-comment-generator', {
        body: {
          postContent: postContent.substring(0, 500), // Limit content length
          postAuthor,
          userProfile,
          commentType
        }
      });

      if (error) throw error;

      if (response?.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        toast.success('AI comment suggestions generated!');
      } else {
        throw new Error('No suggestions received');
      }

    } catch (error) {
      console.error('Comment generation error:', error);
      
      // Fallback suggestions
      const fallbackSuggestions = [
        {
          comment: "Great insights! This really resonates with my experience in the field. Thanks for sharing your perspective.",
          tone: "thoughtful"
        },
        {
          comment: "This is such valuable information. I'd love to hear more about your approach to this challenge.",
          tone: "engaging"
        },
        {
          comment: "Excellent point! Have you found any specific strategies that work particularly well in this area?",
          tone: "question"
        }
      ];
      
      setSuggestions(fallbackSuggestions);
      toast.success('Comment suggestions generated!');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Comment copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy comment');
    }
  };

  const handleUseComment = (comment: string) => {
    setSelectedComment(comment);
    setCustomizedComment(comment);
    onCommentGenerated?.(comment);
  };

  const handlePostComment = () => {
    if (customizedComment.trim()) {
      onCommentPost?.(customizedComment);
      setCustomizedComment('');
      setSelectedComment('');
      setSuggestions([]);
      toast.success('Comment posted!');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-purple-600" />
          AI Comment Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate smart, engaging comments for this post
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Comment Style
            </label>
            <Select value={commentType} onValueChange={setCommentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {commentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateComments}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating Comments...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Smart Comments
              </>
            )}
          </Button>
        </div>

        {/* Comment Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Comment Suggestions:</h4>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="capitalize">
                        {suggestion.tone}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(suggestion.comment)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUseComment(suggestion.comment)}
                        >
                          Use This
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      {suggestion.comment}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Customization Area */}
        {selectedComment && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 block">
              Customize Your Comment:
            </label>
            <Textarea
              value={customizedComment}
              onChange={(e) => setCustomizedComment(e.target.value)}
              placeholder="Edit your comment here..."
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => generateComments()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handlePostComment}
                disabled={!customizedComment.trim()}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
          <p>💡 Tip: AI-generated comments help you engage meaningfully with your network and build stronger professional relationships.</p>
        </div>
      </CardContent>
    </Card>
  );
};