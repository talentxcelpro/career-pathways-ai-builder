
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { useEnhancedAIService } from '@/hooks/useEnhancedAIService';
import { toast } from 'sonner';

interface ProfileSuggestion {
  id: string;
  type: 'headline' | 'summary' | 'skills' | 'experience' | 'education';
  title: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  reason: string;
}

interface SmartProfileOptimizerProps {
  userProfile: any;
  onProfileUpdate?: (updates: any) => void;
}

export const SmartProfileOptimizer: React.FC<SmartProfileOptimizerProps> = ({
  userProfile,
  onProfileUpdate
}) => {
  const { invokeWithFeedback, isProcessing } = useEnhancedAIService();
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
  const [completionScore, setCompletionScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    
    try {
      const result = await invokeWithFeedback({
        toolSlug: 'profile-optimizer',
        inputData: {
          profile: userProfile,
          analysisType: 'comprehensive',
          includeKeywords: true,
          industryContext: userProfile.industry || 'technology'
        },
        category: 'profile_optimization'
      });

      if (result.success) {
        setSuggestions(result.data.suggestions || []);
        setCompletionScore(result.data.completionScore || 0);
        toast.success('Profile analysis complete!');
      }
    } catch (error) {
      console.error('Profile analysis failed:', error);
      toast.error('Failed to analyze profile');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = async (suggestion: ProfileSuggestion) => {
    try {
      const result = await invokeWithFeedback({
        toolSlug: 'content-generator',
        inputData: {
          type: suggestion.type,
          suggestion: suggestion.suggestion,
          currentContent: userProfile[suggestion.type],
          optimization: 'professional'
        },
        category: 'content_generation'
      });

      if (result.success) {
        const updates = {
          [suggestion.type]: result.data.optimizedContent
        };
        
        onProfileUpdate?.(updates);
        
        // Remove applied suggestion
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        
        toast.success(`${suggestion.title} updated successfully!`);
      }
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle>AI Profile Optimizer</CardTitle>
          </div>
          <Button 
            onClick={analyzeProfile} 
            disabled={isAnalyzing || isProcessing}
            variant="outline"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Analyze Profile
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Profile Completion Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-muted-foreground">{completionScore}%</span>
          </div>
          <Progress value={completionScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Complete your profile to increase visibility to employers
          </p>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              AI Recommendations ({suggestions.length})
            </h4>
            
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{suggestion.title}</h5>
                      <Badge 
                        variant="outline" 
                        className={getImpactColor(suggestion.impact)}
                      >
                        <div className="flex items-center gap-1">
                          {getImpactIcon(suggestion.impact)}
                          <span className="capitalize">{suggestion.impact} Impact</span>
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestion.reason}
                    </p>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm">{suggestion.suggestion}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => applySuggestion(suggestion)}
                    disabled={isProcessing}
                  >
                    Apply Suggestion
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !isAnalyzing && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Click "Analyze Profile" to get AI-powered optimization suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
