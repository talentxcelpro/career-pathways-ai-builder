import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, MessageCircle, Hash, Sparkles } from 'lucide-react';

interface AIPostQualityScoreProps {
  score: number;
  tone: string;
  ctaStrength: number;
  hashtagRelevance: number;
  viralityPotential: 'low' | 'medium' | 'high' | 'viral';
  isRealTime?: boolean;
}

export const AIPostQualityScore: React.FC<AIPostQualityScoreProps> = ({
  score,
  tone,
  ctaStrength,
  hashtagRelevance,
  viralityPotential,
  isRealTime = false
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getViralityIcon = () => {
    switch (viralityPotential) {
      case 'viral': return { icon: '🚀', label: 'Viral Potential', color: 'text-purple-600 bg-purple-50' };
      case 'high': return { icon: '🔥', label: 'High Reach', color: 'text-orange-600 bg-orange-50' };
      case 'medium': return { icon: '📈', label: 'Good Reach', color: 'text-blue-600 bg-blue-50' };
      default: return { icon: '⚠️', label: 'Needs Work', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const viralityInfo = getViralityIcon();

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Quality Score</span>
            {isRealTime && (
              <Badge variant="secondary" className="text-xs">
                Real-time
              </Badge>
            )}
          </div>
          <Badge className={`${getScoreColor(score)} text-sm font-bold`}>
            {score}/100
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Overall Quality</span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-500" />
            <span>CTA: {ctaStrength}/10</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3 text-green-500" />
            <span>Tags: {hashtagRelevance}/10</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            Tone: {tone}
          </Badge>
          <Badge className={`${viralityInfo.color} text-xs`}>
            {viralityInfo.icon} {viralityInfo.label}
          </Badge>
        </div>

        {score < 60 && (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
            💡 <strong>Tips:</strong> Add more engaging content, use relevant hashtags, and include a clear call-to-action.
          </div>
        )}
      </CardContent>
    </Card>
  );
};