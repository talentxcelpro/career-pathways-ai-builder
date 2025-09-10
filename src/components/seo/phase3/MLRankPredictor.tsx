import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Clock,
  Trophy
} from 'lucide-react';

interface PredictionData {
  predictedRank: number;
  confidence: number;
  timeframe: string;
  factors: {
    contentQuality: number;
    technicalSEO: number;
    backlinks: number;
    userExperience: number;
    competition: number;
  };
  recommendations: string[];
  riskFactors: string[];
  keywordDifficulty?: number;
  rankingProbability?: {
    top3: number;
    top10: number;
    top20: number;
  };
  competitiveAdvantage?: string;
}

export const MLRankPredictor: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [formData, setFormData] = useState({
    url: '',
    targetKeyword: '',
    currentRank: '',
    contentLength: '',
    backlinks: '',
    domainAge: ''
  });

  const handlePredict = async () => {
    if (!formData.url || !formData.targetKeyword) {
      toast.error('Please enter URL and target keyword');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const requestData = {
        url: formData.url,
        targetKeyword: formData.targetKeyword,
        currentRank: formData.currentRank ? parseInt(formData.currentRank) : 50,
        contentLength: formData.contentLength ? parseInt(formData.contentLength) : 800,
        backlinks: formData.backlinks ? parseInt(formData.backlinks) : 10,
        domainAge: formData.domainAge ? parseInt(formData.domainAge) : 1
      };

      const { data, error } = await supabase.functions.invoke('seo-rank-predictor', {
        body: requestData
      });

      if (error) throw error;

      if (data.success) {
        setPrediction(data.prediction);
        toast.success('Rank prediction completed!');
      } else {
        throw new Error(data.error || 'Prediction failed');
      }
    } catch (error: any) {
      console.error('Rank prediction error:', error);
      toast.error(`Failed to predict rank: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFactorColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-green-600';
    if (rank <= 10) return 'text-blue-600';
    if (rank <= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Rank Predictor
          </CardTitle>
          <CardDescription>
            Advanced machine learning predictions for keyword rankings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Keyword</Label>
              <Input
                value={formData.targetKeyword}
                onChange={(e) => setFormData(prev => ({ ...prev, targetKeyword: e.target.value }))}
                placeholder="AI marketing tools"
              />
            </div>
            <div className="space-y-2">
              <Label>Current Rank (optional)</Label>
              <Input
                type="number"
                value={formData.currentRank}
                onChange={(e) => setFormData(prev => ({ ...prev, currentRank: e.target.value }))}
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label>Content Length (words)</Label>
              <Input
                type="number"
                value={formData.contentLength}
                onChange={(e) => setFormData(prev => ({ ...prev, contentLength: e.target.value }))}
                placeholder="1200"
              />
            </div>
            <div className="space-y-2">
              <Label>Backlinks Count</Label>
              <Input
                type="number"
                value={formData.backlinks}
                onChange={(e) => setFormData(prev => ({ ...prev, backlinks: e.target.value }))}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label>Domain Age (years)</Label>
              <Input
                type="number"
                value={formData.domainAge}
                onChange={(e) => setFormData(prev => ({ ...prev, domainAge: e.target.value }))}
                placeholder="3"
              />
            </div>
          </div>

          <Button onClick={handlePredict} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing with ML...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Predict Ranking
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <div className="space-y-6">
          {/* Prediction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Ranking Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getRankColor(prediction.predictedRank)}`}>
                    #{prediction.predictedRank}
                  </div>
                  <div className="text-sm text-muted-foreground">Predicted Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {prediction.confidence}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5" />
                    {prediction.timeframe}
                  </div>
                  <div className="text-sm text-muted-foreground">Timeframe</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {prediction.keywordDifficulty || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Keyword Difficulty</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="factors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="factors">Ranking Factors</TabsTrigger>
              <TabsTrigger value="probability">Probability</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="factors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Ranking Factor Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(prediction.factors).map(([factor, score]) => (
                    <div key={factor} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize font-medium">
                          {factor.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-bold">{score}/100</span>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getFactorColor(score)} transition-all duration-500`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {prediction.competitiveAdvantage && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Competitive Position</h4>
                      <p className="text-sm">{prediction.competitiveAdvantage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="probability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Ranking Probability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {prediction.rankingProbability && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Top 3 Rankings</span>
                          <span className="font-bold">{prediction.rankingProbability.top3}%</span>
                        </div>
                        <Progress value={prediction.rankingProbability.top3} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Top 10 Rankings</span>
                          <span className="font-bold">{prediction.rankingProbability.top10}%</span>
                        </div>
                        <Progress value={prediction.rankingProbability.top10} className="h-3" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Top 20 Rankings</span>
                          <span className="font-bold">{prediction.rankingProbability.top20}%</span>
                        </div>
                        <Progress value={prediction.rankingProbability.top20} className="h-3" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prediction.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};