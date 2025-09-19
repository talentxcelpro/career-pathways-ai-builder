import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Users, Brain, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIConnectIntegrationProps {
  onConnect?: (userData: any) => void;
  onAnalyze?: (analysisData: any) => void;
}

export const AIConnectIntegration: React.FC<AIConnectIntegrationProps> = ({
  onConnect,
  onAnalyze
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState<any>(null);

  // Fetch user's AI match scores
  const { data: aiMatches, isLoading } = useQuery({
    queryKey: ['ai-matches'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_match_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('match_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate AI analysis progress
      const progressSteps = [
        { step: 20, message: 'Analyzing profile data...' },
        { step: 40, message: 'Processing network connections...' },
        { step: 60, message: 'Calculating compatibility scores...' },
        { step: 80, message: 'Generating recommendations...' },
        { step: 100, message: 'Analysis complete!' }
      ];

      for (const progress of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(progress.step);
        toast.info(progress.message);
      }

      // Mock AI insights
      const insights = {
        profileStrength: 85,
        networkOptimization: 72,
        careerAlignment: 91,
        recommendations: [
          'Connect with 3 more professionals in your industry',
          'Update your headline to include trending keywords',
          'Engage with content from industry leaders',
          'Share insights about recent industry trends'
        ],
        topMatches: aiMatches?.slice(0, 3) || []
      };

      setAiInsights(insights);
      onAnalyze?.(insights);
      toast.success('AI analysis completed successfully!');
    } catch (error) {
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSmartConnect = async (targetUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to connect');
        return;
      }

      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;
      
      onConnect?.({ targetUserId, status: 'pending' });
      toast.success('Smart connection request sent!');
    } catch (error) {
      toast.error('Failed to send connection request');
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Network Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAnalyzing && !aiInsights && (
            <div className="text-center py-6">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get AI-Powered Insights</h3>
              <p className="text-muted-foreground mb-4">
                Let our AI analyze your network and provide personalized recommendations
              </p>
              <Button onClick={runAIAnalysis} className="min-w-32">
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Running AI analysis...</p>
              </div>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          )}

          {aiInsights && (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{aiInsights.profileStrength}%</div>
                  <div className="text-xs text-muted-foreground">Profile Strength</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{aiInsights.networkOptimization}%</div>
                  <div className="text-xs text-muted-foreground">Network Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{aiInsights.careerAlignment}%</div>
                  <div className="text-xs text-muted-foreground">Career Alignment</div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {aiInsights.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={runAIAnalysis} 
                variant="outline" 
                className="w-full"
                disabled={isAnalyzing}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Connections Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Smart Connection Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : aiMatches && aiMatches.length > 0 ? (
            <div className="space-y-3">
              {aiMatches.slice(0, 3).map((match: any) => (
                <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">Match Score: {Math.round(match.match_score * 100)}%</div>
                    <div className="text-sm text-muted-foreground">{match.match_type}</div>
                    {match.ai_insight && (
                      <div className="text-xs text-primary mt-1">{match.ai_insight}</div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSmartConnect(match.target_user_id)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No AI matches found yet</p>
              <p className="text-xs">Complete your profile to get better matches</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};