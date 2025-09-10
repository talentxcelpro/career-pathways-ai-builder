import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  FileText, 
  Link, 
  Activity, 
  Calendar, 
  DollarSign 
} from 'lucide-react';

const MLPredictSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('ranking-prediction');

  const subcategories = [
    {
      id: 'ranking-prediction',
      title: 'Ranking Prediction Models',
      icon: TrendingUp,
      description: 'Predict future keyword ranking positions',
      status: 'active'
    },
    {
      id: 'traffic-forecasting',
      title: 'Traffic Forecasting',
      icon: BarChart3,
      description: 'Forecast organic traffic trends and growth',
      status: 'active'
    },
    {
      id: 'keyword-scoring',
      title: 'Keyword Opportunity Scoring',
      icon: Target,
      description: 'ML-powered keyword difficulty and opportunity analysis',
      status: 'beta'
    },
    {
      id: 'content-prediction',
      title: 'Content Performance Prediction',
      icon: FileText,
      description: 'Predict how content will perform before publishing',
      status: 'beta'
    },
    {
      id: 'link-success',
      title: 'Link Building Success Prediction',
      icon: Link,
      description: 'Predict link building campaign success rates',
      status: 'coming-soon'
    },
    {
      id: 'serp-volatility',
      title: 'SERP Volatility Prediction',
      icon: Activity,
      description: 'Predict search result volatility and algorithm changes',
      status: 'beta'
    },
    {
      id: 'seasonal-trends',
      title: 'Seasonal Trend Analysis',
      icon: Calendar,
      description: 'Analyze and predict seasonal search patterns',
      status: 'active'
    },
    {
      id: 'roi-prediction',
      title: 'ROI Prediction Models',
      icon: DollarSign,
      description: 'Predict return on investment for SEO efforts',
      status: 'coming-soon'
    }
  ];

  const renderSubcategoryContent = () => {
    const subcategory = subcategories.find(sub => sub.id === activeSubcategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{subcategory?.title}</h3>
            <p className="text-muted-foreground mt-1">{subcategory?.description}</p>
          </div>
          <Badge variant={subcategory?.status === 'active' ? 'default' : 'secondary'}>
            {subcategory?.status?.replace('-', ' ')}
          </Badge>
        </div>

        {activeSubcategory === 'ranking-prediction' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ranking Predictions</CardTitle>
                <CardDescription>AI-powered ranking forecasts for next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { keyword: 'AI content generator', current: 15, predicted: 8, confidence: 85, timeframe: '3 months' },
                    { keyword: 'SEO audit tool', current: 23, predicted: 12, confidence: 78, timeframe: '3 months' },
                    { keyword: 'keyword research', current: 8, predicted: 4, confidence: 92, timeframe: '3 months' },
                    { keyword: 'backlink checker', current: 18, predicted: 25, confidence: 67, timeframe: '3 months' }
                  ].map((prediction, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{prediction.keyword}</span>
                        <Badge variant={prediction.predicted < prediction.current ? 'default' : 'destructive'}>
                          {prediction.confidence}% confident
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current: #{prediction.current}</span>
                        <span className={prediction.predicted < prediction.current ? 'text-green-600' : 'text-red-600'}>
                          Predicted: #{prediction.predicted}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Forecast for {prediction.timeframe}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Accuracy</CardTitle>
                <CardDescription>Model performance and accuracy metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Accuracy:</span>
                    <span className="font-bold">84.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Predictions Made:</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Successful Predictions:</span>
                    <span className="font-bold">1,051</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Confidence:</span>
                    <span className="font-bold">78.3%</span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm">Model Features</h4>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• Historical ranking data</li>
                      <li>• Competitor analysis</li>
                      <li>• Content quality metrics</li>
                      <li>• Backlink profile strength</li>
                      <li>• Technical SEO factors</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'traffic-forecasting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Forecast</CardTitle>
                <CardDescription>Predicted organic traffic for next 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">+24%</div>
                      <div className="text-xs text-muted-foreground">Next Month</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">+45%</div>
                      <div className="text-xs text-muted-foreground">3 Months</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">+68%</div>
                      <div className="text-xs text-muted-foreground">6 Months</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Monthly Projections</h4>
                    {[
                      { month: 'March 2024', visits: '28,400', growth: '+12%' },
                      { month: 'April 2024', visits: '32,100', growth: '+13%' },
                      { month: 'May 2024', visits: '36,800', growth: '+15%' },
                      { month: 'June 2024', visits: '42,300', growth: '+15%' }
                    ].map((forecast, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="font-medium">{forecast.month}</span>
                        <div className="text-right">
                          <div className="font-bold">{forecast.visits}</div>
                          <Badge variant="default" className="text-xs">{forecast.growth}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources Forecast</CardTitle>
                <CardDescription>Predicted traffic distribution by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { source: 'Organic Search', current: '68%', predicted: '72%', change: '+4%' },
                    { source: 'Direct', current: '18%', predicted: '16%', change: '-2%' },
                    { source: 'Referral', current: '8%', predicted: '7%', change: '-1%' },
                    { source: 'Social', current: '4%', predicted: '3%', change: '-1%' },
                    { source: 'Email', current: '2%', predicted: '2%', change: '0%' }
                  ].map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{source.source}</span>
                      <div className="text-right">
                        <div className="text-sm">
                          {source.current} → {source.predicted}
                        </div>
                        <Badge variant={source.change.startsWith('+') ? 'default' : 'outline'}>
                          {source.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'keyword-scoring' && (
          <Card>
            <CardHeader>
              <CardTitle>ML Keyword Opportunity Scores</CardTitle>
              <CardDescription>AI-powered keyword difficulty and opportunity analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    keyword: 'AI blog writing tool', 
                    volume: '8,900', 
                    difficulty: 45, 
                    opportunity: 87, 
                    timeToRank: '4-6 months',
                    factors: ['Low competition', 'High intent', 'Growing trend']
                  },
                  { 
                    keyword: 'automated content creation', 
                    volume: '5,400', 
                    difficulty: 62, 
                    opportunity: 73, 
                    timeToRank: '6-8 months',
                    factors: ['Medium competition', 'Commercial intent', 'Stable trend']
                  },
                  { 
                    keyword: 'SEO content generator', 
                    volume: '12,100', 
                    difficulty: 78, 
                    opportunity: 58, 
                    timeToRank: '8-12 months',
                    factors: ['High competition', 'Strong intent', 'Competitive market']
                  }
                ].map((keyword, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{keyword.keyword}</h4>
                        <p className="text-sm text-muted-foreground">{keyword.volume} monthly searches</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{keyword.opportunity}</div>
                        <div className="text-xs text-muted-foreground">Opportunity Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Difficulty:</span>
                        <Badge variant={keyword.difficulty < 50 ? 'default' : keyword.difficulty < 70 ? 'secondary' : 'destructive'}>
                          {keyword.difficulty}/100
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Time to Rank:</span>
                        <span className="ml-2 text-sm font-medium">{keyword.timeToRank}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-muted-foreground">Key Factors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {keyword.factors.map((factor, factorIndex) => (
                          <Badge key={factorIndex} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcategories.map((subcategory) => {
          const Icon = subcategory.icon;
          return (
            <Button
              key={subcategory.id}
              variant={activeSubcategory === subcategory.id ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSubcategory(subcategory.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs text-center">{subcategory.title}</span>
            </Button>
          );
        })}
      </div>

      {renderSubcategoryContent()}
    </div>
  );
};

export default MLPredictSubcategories;