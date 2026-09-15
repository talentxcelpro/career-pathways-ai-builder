import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdvancedAIFeatures } from '@/hooks/useAdvancedAIFeatures';
import { Brain, Target, Zap, TrendingUp, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const AdvancedAIPersonalization: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [personalizationScore, setPersonalizationScore] = useState(0);
  
  const { 
    performAdvancedATSAnalysis,
    generatePerformanceAnalytics,
    generateIntelligentSuggestions 
  } = useAdvancedAIFeatures();

  const runPersonalizationAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate advanced AI personalization analysis
      const mockInsights = {
        careerPath: {
          currentLevel: "Mid-Level",
          nextMilestone: "Senior Developer",
          timeToPromotion: "8-12 months",
          skillGaps: ["System Design", "Leadership", "Cloud Architecture"]
        },
        marketPosition: {
          salaryPercentile: 65,
          demandScore: 8.5,
          competitivenessRating: "Strong"
        },
        recommendations: [
          {
            type: "skill_development",
            title: "Master System Design",
            impact: "High",
            timeEstimate: "3 months"
          },
          {
            type: "networking",
            title: "Connect with Senior Engineers",
            impact: "Medium",
            timeEstimate: "Ongoing"
          },
          {
            type: "certification",
            title: "AWS Solutions Architect",
            impact: "High",
            timeEstimate: "2 months"
          }
        ],
        aiScore: 87
      };

      setInsights(mockInsights);
      setPersonalizationScore(mockInsights.aiScore);
      toast.success('Advanced AI analysis completed!');
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Auto-run on component mount
    runPersonalizationAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Advanced AI Personalization
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={personalizationScore} className="h-2" />
            </div>
            <Badge variant="secondary">{personalizationScore}% Optimized</Badge>
          </div>
        </CardHeader>
      </Card>

      {insights && (
        <>
          {/* Career Path Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Career Path Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Current Level</div>
                  <div className="font-semibold text-lg">{insights.careerPath.currentLevel}</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Next Milestone</div>
                  <div className="font-semibold text-lg">{insights.careerPath.nextMilestone}</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Time to Promotion</div>
                  <div className="font-semibold text-lg">{insights.careerPath.timeToPromotion}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Priority Skill Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.careerPath.skillGaps.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Position */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Market Position Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Salary Percentile</div>
                  <div className="font-semibold text-2xl text-green-600">
                    {insights.marketPosition.salaryPercentile}th
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Market Demand</div>
                  <div className="font-semibold text-2xl text-blue-600">
                    {insights.marketPosition.demandScore}/10
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Competitiveness</div>
                  <div className="font-semibold text-lg text-primary">
                    {insights.marketPosition.competitivenessRating}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Intelligent Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.recommendations.map((rec: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={rec.impact === 'High' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.impact} Impact
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.timeEstimate}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Start
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={runPersonalizationAnalysis}
          disabled={isAnalyzing}
          className="flex-1"
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Find Mentors
        </Button>
      </div>
    </div>
  );
};