import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar,
  Clock,
  X,
  RefreshCw,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useTXCAIInsights } from '@/hooks/useTXCAIInsights';

interface InsightCardProps {
  insight: any;
  onDismiss: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onDismiss }) => {
  const getInsightIcon = () => {
    switch (insight.insight_type) {
      case 'balance_forecast':
        return <TrendingUp className="w-5 h-5" />;
      case 'earning_opportunity':
        return <Target className="w-5 h-5" />;
      case 'spending_alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'fraud_risk':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getInsightColor = () => {
    switch (insight.insight_type) {
      case 'balance_forecast':
        return 'blue';
      case 'earning_opportunity':
        return 'green';
      case 'spending_alert':
        return 'yellow';
      case 'fraud_risk':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getConfidenceColor = () => {
    switch (insight.confidence_level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={`border-l-4 border-l-${getInsightColor()}-500`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getInsightIcon()}
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getConfidenceColor()}>
              {insight.confidence_level} confidence
            </Badge>
            {insight.action_required && (
              <Badge variant="destructive">Action Required</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-3">{insight.description}</p>
        
        {insight.predicted_value && (
          <div className="bg-muted/50 p-3 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium">Predicted Value: {insight.predicted_value.toFixed(0)} TXC</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Expires: {new Date(insight.expires_at).toLocaleDateString()}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {insight.insight_type.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export const TXCAIInsightsDashboard: React.FC = () => {
  const { 
    patterns, 
    insights, 
    forecasts, 
    isAnalyzing, 
    analysisProgress, 
    dismissInsight, 
    refreshAnalysis 
  } = useTXCAIInsights();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Powered TXC Insights
            </CardTitle>
            <Button variant="outline" onClick={refreshAnalysis} disabled={isAnalyzing}>
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardHeader>
        
        {isAnalyzing && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyzing your TXC patterns...</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Predictive Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI Insights & Recommendations
          </h3>
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              insight={insight}
              onDismiss={() => dismissInsight(index)}
            />
          ))}
        </div>
      )}

      {/* TXC Forecasts */}
      {forecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              TXC Balance Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {forecasts.map((forecast, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">{forecast.period} Forecast</h4>
                    <Badge variant="secondary">
                      {forecast.predicted_balance.toFixed(0)} TXC
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Predicted Earnings:</span>
                      <span className="text-green-600">+{forecast.predicted_earnings.toFixed(0)} TXC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Predicted Spending:</span>
                      <span className="text-red-600">-{forecast.predicted_spending.toFixed(0)} TXC</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Confidence Range:</span>
                      <span className="text-muted-foreground">
                        {forecast.confidence_intervals.lower.toFixed(0)} - {forecast.confidence_intervals.upper.toFixed(0)} TXC
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Key Factors:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {forecast.key_factors.slice(0, 2).map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
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

      {/* Behavior Patterns */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Behavior Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{pattern.pattern_type}</h4>
                    <Badge 
                      variant={pattern.confidence_score > 0.7 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {(pattern.confidence_score * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="capitalize">{pattern.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Amount:</span>
                      <span>{pattern.average_amount.toFixed(0)} TXC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peak Hours:</span>
                      <span>{pattern.peak_hours.slice(0, 2).map(h => `${h}:00`).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Activity:</span>
                      <span>{new Date(pattern.last_occurrence).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isAnalyzing && insights.length === 0 && patterns.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Patterns Detected Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start using TXC to unlock AI-powered insights and predictions
            </p>
            <Button variant="outline" onClick={refreshAnalysis}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Current Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};