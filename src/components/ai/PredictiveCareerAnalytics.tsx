import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, Target, Clock, Star } from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface CareerPrediction {
  role: string;
  probability: number;
  timeframe: string;
  requiredSkills: string[];
  salaryRange: { min: number; max: number };
  marketDemand: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  learningPath: string[];
}

const PredictiveCareerAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<CareerPrediction[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketTrends, setMarketTrends] = useState<any[]>([]);

  useEffect(() => {
    generatePredictions();
  }, []);

  const generatePredictions = async () => {
    setIsAnalyzing(true);
    
    try {
      // TODO: Replace with actual API calls to fetch predictive analytics
      // const predictions = await predictiveAnalyticsAPI.generateCareerPredictions(userProfile);
      // const skillGaps = await predictiveAnalyticsAPI.analyzeSkillGaps(userProfile);
      
      // For now, clear data to show empty states until API integration
      setPredictions([]);
      setSkillGaps([]);
    } catch (error) {
      console.error('Failed to generate predictions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TieredAccessGuard feature="predictive_analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Predictive Career Analytics
            </h2>
            <p className="text-muted-foreground">AI-powered insights into your career trajectory</p>
          </div>
          <Button onClick={generatePredictions} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={5} label="AI Analytics Requests" />

        {/* Career Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Career Path Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {predictions.length === 0 && !isAnalyzing ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Predictions Available</h3>
                <p className="text-muted-foreground">
                  Connect your API to generate AI-powered career predictions
                </p>
              </div>
            ) : (
              predictions.map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{prediction.role}</h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(prediction.trend)}
                    <Badge className={getDemandColor(prediction.marketDemand)}>
                      {prediction.marketDemand} demand
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Probability</p>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.probability} className="flex-1" />
                      <span className="font-medium">{prediction.probability}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Timeframe</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {prediction.timeframe}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Salary Range</p>
                    <p className="font-medium">
                      ${prediction.salaryRange.min.toLocaleString()} - ${prediction.salaryRange.max.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Skill Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Skill Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillGaps.length === 0 && !isAnalyzing ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Skill Analysis Available</h3>
                <p className="text-muted-foreground">
                  Connect your API to analyze skill gaps and get recommendations
                </p>
              </div>
            ) : (
              skillGaps.map((gap, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{gap.skill}</h3>
                  <Badge className={getPriorityColor(gap.priority)}>
                    {gap.priority} priority
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Level</span>
                    <span>Required Level</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Progress value={(gap.currentLevel / 10) * 100} />
                    <Progress value={(gap.requiredLevel / 10) * 100} />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{gap.currentLevel}/10</span>
                    <span>{gap.requiredLevel}/10</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Recommended Learning Path</p>
                  <div className="flex flex-wrap gap-2">
                    {gap.learningPath.map((step, stepIndex) => (
                      <Badge key={stepIndex} variant="outline">
                        {stepIndex + 1}. {step}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Market Opportunity</h4>
                <p className="text-blue-800 text-sm">
                  The AI/ML job market is experiencing 40% growth year-over-year. Your current skills position you well 
                  for a transition into Senior Data Scientist roles within the next 18 months.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Competitive Advantage</h4>
                <p className="text-green-800 text-sm">
                  Your background in both technical and business domains gives you a unique advantage for AI Product Manager 
                  roles, which are 30% less competitive than pure technical positions.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Action Required</h4>
                <p className="text-yellow-800 text-sm">
                  Focus on Deep Learning and MLOps skills to maximize your transition probability. 
                  Consider taking advanced certifications in these areas within the next 6 months.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TieredAccessGuard>
  );
};

export default PredictiveCareerAnalytics;