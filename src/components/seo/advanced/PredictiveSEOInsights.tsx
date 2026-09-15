import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gem, 
  TrendingUp, 
  TrendingDown, 
  Brain,
  Target,
  Calendar,
  Zap,
  AlertCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface TrendPrediction {
  keyword: string;
  currentVolume: number;
  predictedVolume: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  seasonality: string;
  opportunity: string;
}

interface AlgorithmPrediction {
  update: string;
  probability: number;
  expectedDate: string;
  impact: 'high' | 'medium' | 'low';
  affectedAreas: string[];
  preparation: string[];
}

export const PredictiveSEOInsights: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  
  const trendPredictions: TrendPrediction[] = [
    {
      keyword: 'AI resume builder',
      currentVolume: 12000,
      predictedVolume: 28000,
      trend: 'rising',
      confidence: 89,
      seasonality: 'Peak in Q1 (hiring season)',
      opportunity: 'Create AI-powered resume tools content'
    },
    {
      keyword: 'remote work jobs',
      currentVolume: 45000,
      predictedVolume: 38000,
      trend: 'falling',
      confidence: 76,
      seasonality: 'Declining post-pandemic',
      opportunity: 'Pivot to hybrid work content'
    },
    {
      keyword: 'career coaching',
      currentVolume: 8500,
      predictedVolume: 15200,
      trend: 'rising',
      confidence: 82,
      seasonality: 'Strong in Q4/Q1',
      opportunity: 'Develop coaching service pages'
    }
  ];

  const algorithmPredictions: AlgorithmPrediction[] = [
    {
      update: 'Core Web Vitals Update',
      probability: 78,
      expectedDate: '2024-03-15',
      impact: 'high',
      affectedAreas: ['Page Speed', 'User Experience', 'Mobile Performance'],
      preparation: [
        'Optimize Largest Contentful Paint (LCP)',
        'Reduce Cumulative Layout Shift (CLS)',
        'Improve First Input Delay (FID)'
      ]
    },
    {
      update: 'AI Content Quality Update',
      probability: 65,
      expectedDate: '2024-04-20',
      impact: 'medium',
      affectedAreas: ['Content Quality', 'E-A-T Signals', 'Human Review'],
      preparation: [
        'Add human expert reviews',
        'Improve content depth and originality',
        'Enhance author credentials'
      ]
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'falling':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600';
      case 'falling':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            Predictive SEO Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              variant={selectedTimeframe === '1month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('1month')}
            >
              1 Month
            </Button>
            <Button 
              variant={selectedTimeframe === '3months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('3months')}
            >
              3 Months
            </Button>
            <Button 
              variant={selectedTimeframe === '6months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('6months')}
            >
              6 Months
            </Button>
            <Button 
              variant={selectedTimeframe === '1year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('1year')}
            >
              1 Year
            </Button>
          </div>

          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">Keyword Trends</TabsTrigger>
              <TabsTrigger value="algorithm">Algorithm Updates</TabsTrigger>
              <TabsTrigger value="opportunities">AI Opportunities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4">
                {trendPredictions.map((prediction, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(prediction.trend)}
                          <h3 className="font-medium">{prediction.keyword}</h3>
                          <Badge variant="outline" size="sm">
                            {prediction.confidence}% confidence
                          </Badge>
                        </div>
                        <Badge 
                          className={getTrendColor(prediction.trend)}
                          variant="secondary"
                        >
                          {prediction.trend}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Current Volume</div>
                          <div className="font-medium">{prediction.currentVolume.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Predicted Volume</div>
                          <div className={`font-medium ${getTrendColor(prediction.trend)}`}>
                            {prediction.predictedVolume.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Growth Rate</div>
                          <div className={`font-medium ${getTrendColor(prediction.trend)}`}>
                            {prediction.trend === 'rising' ? '+' : ''}
                            {Math.round(((prediction.predictedVolume - prediction.currentVolume) / prediction.currentVolume) * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Seasonality: </span>
                          {prediction.seasonality}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Opportunity: </span>
                          {prediction.opportunity}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="algorithm" className="space-y-4">
              <div className="grid gap-4">
                {algorithmPredictions.map((prediction, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">{prediction.update}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={prediction.impact === 'high' ? 'destructive' : 
                                   prediction.impact === 'medium' ? 'default' : 'secondary'}
                            size="sm"
                          >
                            {prediction.impact} impact
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {prediction.probability}% likely
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <Progress value={prediction.probability} className="w-full" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Expected Date</div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{prediction.expectedDate}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Affected Areas</div>
                          <div className="flex flex-wrap gap-1">
                            {prediction.affectedAreas.map((area, i) => (
                              <Badge key={i} variant="secondary" size="sm">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Preparation Steps</div>
                        <ul className="space-y-1">
                          {prediction.preparation.map((step, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <Target className="h-3 w-3 text-primary" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="opportunities" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-medium">Voice Search Optimization</h3>
                      <Badge variant="default" size="sm">High Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Voice search queries are growing 35% YoY. Optimize for conversational keywords and featured snippets.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Voice SEO Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Video SEO Expansion</h3>
                      <Badge variant="outline" size="sm">Medium Priority</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Video content receives 50x more organic traffic. YouTube is now the 2nd largest search engine.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Target className="h-4 w-4 mr-2" />
                        Create Video Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">AI-Generated Content Detection</h3>
                      <Badge variant="secondary" size="sm">Emerging</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Search engines are developing AI content detection. Focus on human expertise and unique insights.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Review Content Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};