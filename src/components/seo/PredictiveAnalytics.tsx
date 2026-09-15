import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Brain, Target, Calendar, BarChart3, Zap, AlertTriangle } from 'lucide-react';

interface PredictionMetrics {
  keyword: string;
  currentRank: number;
  predictedRank: number;
  confidence: number;
  timeframe: number; // weeks
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume: number;
  competition: number;
  expectedTraffic: number;
}

interface TrafficForecast {
  month: string;
  organic: number;
  predicted: number;
  confidence: number;
}

interface CompetitorPrediction {
  competitor: string;
  currentShare: number;
  predictedShare: number;
  trend: 'rising' | 'falling' | 'stable';
}

export const PredictiveAnalytics = () => {
  const [predictions, setPredictions] = useState<PredictionMetrics[]>([]);
  const [trafficForecast, setTrafficForecast] = useState<TrafficForecast[]>([]);
  const [competitorPredictions, setCompetitorPredictions] = useState<CompetitorPrediction[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3month' | '6month' | '12month'>('6month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadPredictiveData();
  }, [selectedTimeframe]);

  const loadPredictiveData = () => {
    // Simulate AI-generated predictions (in production, this would call ML APIs)
    const mockPredictions: PredictionMetrics[] = [
      {
        keyword: 'software engineer jobs',
        currentRank: 15,
        predictedRank: 8,
        confidence: 85,
        timeframe: 12,
        difficulty: 'medium',
        searchVolume: 8500,
        competition: 0.7,
        expectedTraffic: 420
      },
      {
        keyword: 'data scientist remote',
        currentRank: 23,
        predictedRank: 12,
        confidence: 78,
        timeframe: 16,
        difficulty: 'hard',
        searchVolume: 3200,
        competition: 0.9,
        expectedTraffic: 180
      },
      {
        keyword: 'marketing manager salary',
        currentRank: 8,
        predictedRank: 3,
        confidence: 92,
        timeframe: 8,
        difficulty: 'easy',
        searchVolume: 2100,
        competition: 0.4,
        expectedTraffic: 310
      }
    ];

    const mockTrafficForecast: TrafficForecast[] = [
      { month: 'Jan', organic: 12500, predicted: 15200, confidence: 88 },
      { month: 'Feb', organic: 13200, predicted: 16800, confidence: 85 },
      { month: 'Mar', organic: 14100, predicted: 18500, confidence: 82 },
      { month: 'Apr', organic: 15800, predicted: 20200, confidence: 79 },
      { month: 'May', organic: 17200, predicted: 22100, confidence: 76 },
      { month: 'Jun', organic: 18900, predicted: 24500, confidence: 73 }
    ];

    const mockCompetitorPredictions: CompetitorPrediction[] = [
      { competitor: 'LinkedIn', currentShare: 35, predictedShare: 32, trend: 'falling' },
      { competitor: 'Indeed', currentShare: 28, predictedShare: 25, trend: 'falling' },
      { competitor: 'Glassdoor', currentShare: 20, predictedShare: 22, trend: 'rising' },
      { competitor: 'TalentXcel', currentShare: 8, predictedShare: 15, trend: 'rising' },
      { competitor: 'Others', currentShare: 9, predictedShare: 6, trend: 'falling' }
    ];

    setPredictions(mockPredictions);
    setTrafficForecast(mockTrafficForecast);
    setCompetitorPredictions(mockCompetitorPredictions);
  };

  const generateKeywordPrediction = async () => {
    if (!keyword) return;
    
    setIsGenerating(true);
    
    // Simulate AI prediction generation
    setTimeout(() => {
      const newPrediction: PredictionMetrics = {
        keyword,
        currentRank: Math.floor(Math.random() * 50) + 10,
        predictedRank: Math.floor(Math.random() * 15) + 1,
        confidence: Math.floor(Math.random() * 30) + 70,
        timeframe: Math.floor(Math.random() * 20) + 8,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as any,
        searchVolume: Math.floor(Math.random() * 10000) + 1000,
        competition: Math.random(),
        expectedTraffic: Math.floor(Math.random() * 500) + 50
      };
      
      setPredictions(prev => [newPrediction, ...prev]);
      setKeyword('');
      setIsGenerating(false);
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'falling': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predictive SEO Analytics
          </CardTitle>
          <CardDescription>
            AI-powered predictions for rankings, traffic, and market share
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    <p className="text-2xl font-bold">
                      {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Growth</p>
                    <p className="text-2xl font-bold text-green-600">+67%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Keywords Tracked</p>
                    <p className="text-2xl font-bold">{predictions.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Share Target</p>
                    <p className="text-2xl font-bold">15%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traffic Forecast</CardTitle>
              <CardDescription>Predicted organic traffic growth over the next 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trafficForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="organic" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Current Organic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Keyword Prediction Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Keyword Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter keyword to predict"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={generateKeywordPrediction} disabled={isGenerating || !keyword}>
                  {isGenerating ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Predict
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Keyword Predictions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Keyword Ranking Predictions</h3>
            <div className="space-y-3">
              {predictions.map((prediction, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{prediction.keyword}</span>
                        <Badge className={getDifficultyColor(prediction.difficulty)}>
                          {prediction.difficulty}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Volume: {prediction.searchVolume.toLocaleString()}</div>
                        <div>Competition: {(prediction.competition * 100).toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">#{prediction.currentRank}</div>
                        <div className="text-xs text-muted-foreground">Current</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">#{prediction.predictedRank}</div>
                        <div className="text-xs text-muted-foreground">Predicted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{prediction.timeframe}w</div>
                        <div className="text-xs text-muted-foreground">Timeframe</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">+{prediction.expectedTraffic}</div>
                        <div className="text-xs text-muted-foreground">Traffic/mo</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence Level</span>
                        <span>{prediction.confidence}%</span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>

                    {prediction.confidence < 75 && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        Low confidence prediction - requires more data
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Competitor Market Share Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Share Predictions</CardTitle>
              <CardDescription>Predicted changes in competitive landscape</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Current vs Predicted Share</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={competitorPredictions}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="predictedShare"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {competitorPredictions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Competitor Analysis</h4>
                  {competitorPredictions.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(comp.trend)}
                        <span className="font-medium">{comp.competitor}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {comp.currentShare}% → {comp.predictedShare}%
                        </div>
                        <div className={`text-xs ${
                          comp.trend === 'rising' ? 'text-green-600' : 
                          comp.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {comp.trend === 'rising' ? '+' : comp.trend === 'falling' ? '' : '±'}
                          {Math.abs(comp.predictedShare - comp.currentShare)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};