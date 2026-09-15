import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Brain, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Activity,
  Zap,
  Users,
  Award
} from 'lucide-react';

export default function Phase3Dashboard() {
  const [isTraining, setIsTraining] = useState(false);

  const handleTrainAI = async () => {
    setIsTraining(true);
    try {
      // Simulate AI model training
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('AI models retrained successfully!');
    } catch (error) {
      toast.error('Failed to train AI models');
    } finally {
      setIsTraining(false);
    }
  };

  const aiMetrics = [
    {
      model: 'CV Matching Engine',
      accuracy: 96.8,
      confidence: 94.2,
      improvements: '+2.3%',
      status: 'active'
    },
    {
      model: 'Skill Extraction AI',
      accuracy: 98.1,
      confidence: 97.5,
      improvements: '+1.8%',
      status: 'active'
    },
    {
      model: 'Experience Analyzer',
      accuracy: 95.4,
      confidence: 92.1,
      improvements: '+3.1%',
      status: 'training'
    },
    {
      model: 'Cultural Fit Predictor',
      accuracy: 87.3,
      confidence: 85.7,
      improvements: '+5.2%',
      status: 'active'
    }
  ];

  const intelligenceFeatures = [
    {
      feature: 'Semantic Job Matching',
      performance: 94,
      description: 'AI understands job requirements beyond keywords',
      improvement: '40% better matches'
    },
    {
      feature: 'Automated CV Enhancement',
      performance: 89,
      description: 'Intelligent suggestions for CV improvement',
      improvement: '60% profile completion'
    },
    {
      feature: 'Predictive Career Insights',
      performance: 82,
      description: 'ML-powered career path recommendations',
      improvement: '35% user engagement'
    },
    {
      feature: 'Real-time Quality Scoring',
      performance: 91,
      description: 'Instant CV quality assessment and feedback',
      improvement: '25% faster processing'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Phase 3: AI Intelligence Engine</h2>
          <p className="text-muted-foreground">
            Advanced ML models powering semantic matching, enhancement, and predictive insights
          </p>
        </div>
        <Button 
          onClick={handleTrainAI}
          disabled={isTraining}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isTraining ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-spin" />
              Training...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Retrain Models
            </>
          )}
        </Button>
      </div>

      {/* Key AI Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">96.8%</div>
            <p className="text-xs text-muted-foreground">average model performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Matches</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">47,382</div>
            <p className="text-xs text-muted-foreground">AI-powered matches made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enhancement Rate</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">89.3%</div>
            <p className="text-xs text-muted-foreground">CVs improved by AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.7%</div>
            <p className="text-xs text-muted-foreground">positive AI interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Model Performance
            </CardTitle>
            <CardDescription>
              Real-time performance metrics of AI engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiMetrics.map((model) => (
              <div key={model.model} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{model.model}</span>
                  <div className="flex gap-2">
                    <Badge 
                      variant={model.status === 'active' ? 'default' : 'secondary'}
                      className={model.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {model.status}
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      {model.improvements}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy</span>
                      <span>{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence</span>
                      <span>{model.confidence}%</span>
                    </div>
                    <Progress value={model.confidence} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Intelligence Features
            </CardTitle>
            <CardDescription>
              Advanced AI capabilities driving user value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {intelligenceFeatures.map((feature) => (
              <div key={feature.feature} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{feature.feature}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {feature.improvement}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span>Performance</span>
                  <span>{feature.performance}%</span>
                </div>
                <Progress value={feature.performance} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights & Analytics</CardTitle>
          <CardDescription>
            Real-time intelligence driving platform optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Behavior Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Profile Completion Rate</span>
                  <span className="font-medium">89.3%</span>
                </div>
                <div className="flex justify-between">
                  <span>Job Application Success</span>
                  <span className="font-medium">34.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Suggestion Adoption</span>
                  <span className="font-medium">76.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Career Progression Score</span>
                  <span className="font-medium">8.4/10</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Predictive Trends
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Hiring Demand (Tech)</span>
                  <span className="font-medium text-green-600">↑ 23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Remote Job Growth</span>
                  <span className="font-medium text-green-600">↑ 45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Skill Gap Analysis</span>
                  <span className="font-medium text-orange-600">AI/ML 67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Competitiveness</span>
                  <span className="font-medium">High</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Optimization Opportunities
              </h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-yellow-50 rounded text-yellow-800">
                  💡 Increase Python skill mentions by 15%
                </div>
                <div className="p-2 bg-blue-50 rounded text-blue-800">
                  🎯 Focus on remote-first companies
                </div>
                <div className="p-2 bg-green-50 rounded text-green-800">
                  📈 Add portfolio links for 40% boost
                </div>
                <div className="p-2 bg-purple-50 rounded text-purple-800">
                  🔥 Trending: DevOps & Cloud skills
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}