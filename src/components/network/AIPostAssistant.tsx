
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wand2, Lightbulb, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

interface AIPostAssistantProps {
  onSuggestionApply: (content: string) => void;
  currentContent?: string;
}

export const AIPostAssistant: React.FC<AIPostAssistantProps> = ({
  onSuggestionApply,
  currentContent = ""
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [topic, setTopic] = useState("");

  const postIdeas = [
    "Share a recent professional achievement or milestone",
    "Discuss an industry trend you've observed",
    "Ask for advice on a career decision",
    "Share insights from a recent project",
    "Celebrate your team's success",
    "Discuss a skill you're currently learning",
    "Share a helpful resource or tool",
    "Ask for recommendations on professional development"
  ];

  const contentTemplates = {
    achievement: "🎉 Excited to share that I recently [achievement]. This experience taught me [key learning]. Looking forward to applying these insights in [future plans]. #ProfessionalGrowth",
    insight: "💡 Industry Insight: I've been noticing [trend/observation] in [industry]. This could mean [implication] for professionals in our field. What are your thoughts? #IndustryTrends",
    question: "🤔 Seeking advice from my network: I'm facing [situation/decision] and would love to hear your perspectives on [specific question]. Your insights would be invaluable! #CareerAdvice",
    learning: "📚 Currently diving deep into [skill/topic]. The journey has been [experience description]. For anyone interested in [topic], I'd recommend [resource/tip]. #ContinuousLearning"
  };

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Simulate AI generation - in real app, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newSuggestions = [
        `Professional insight about ${topic || 'industry trends'}`,
        `Share experience with ${topic || 'recent project'}`,
        `Ask the community about ${topic || 'best practices'}`
      ];
      
      setSuggestions(newSuggestions);
      toast.success("AI suggestions generated!");
    } catch (error) {
      toast.error("Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const improveContent = async () => {
    if (!currentContent.trim()) {
      toast.error("Please write some content first");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const improved = `✨ ${currentContent}\n\nWhat are your thoughts on this? I'd love to hear your experiences! #NetworkingTogether`;
      onSuggestionApply(improved);
      toast.success("Content enhanced with AI!");
    } catch (error) {
      toast.error("Failed to improve content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
          AI Post Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Ideas */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Lightbulb className="h-4 w-4 mr-1 text-yellow-500" />
            Quick Post Ideas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {postIdeas.slice(0, 4).map((idea, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-2 text-xs"
                onClick={() => onSuggestionApply(idea)}
              >
                {idea}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Templates */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            Content Templates
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(contentTemplates).map(([key, template]) => (
              <Badge
                key={key}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => onSuggestionApply(template)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* AI Generation */}
        <div>
          <h4 className="font-medium mb-2 flex items-center">
            <Users className="h-4 w-4 mr-1 text-blue-500" />
            Generate Ideas
          </h4>
          <div className="flex gap-2 mb-2">
            <Textarea
              placeholder="What topic would you like to post about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="h-10 resize-none"
            />
            <Button 
              onClick={generateSuggestions}
              disabled={loading}
              size="sm"
            >
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => onSuggestionApply(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Content Improvement */}
        {currentContent && (
          <div className="pt-2 border-t">
            <Button
              onClick={improveContent}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {loading ? "Enhancing..." : "Enhance My Post with AI"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
