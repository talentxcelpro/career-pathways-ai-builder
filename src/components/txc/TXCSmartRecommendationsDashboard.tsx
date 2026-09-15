import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Star,
  CheckCircle,
  X,
  RefreshCw,
  BarChart3,
  Zap,
  Award,
  ArrowRight
} from 'lucide-react';
import { useTXCSmartRecommendations } from '@/hooks/useTXCSmartRecommendations';

interface RecommendationCardProps {
  recommendation: any;
  onDismiss: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onDismiss }) => {
  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'earning': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'saving': return <Target className="w-5 h-5 text-blue-600" />;
      case 'spending': return <BarChart3 className="w-5 h-5 text-yellow-600" />;
      case 'investment': return <Star className="w-5 h-5 text-purple-600" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getEffortColor = () => {
    switch (recommendation.effort_level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon()}
            <div>
              <CardTitle className="text-lg">{recommendation.title}</CardTitle>
              {recommendation.is_personalized && (
                <Badge variant="secondary" className="text-xs mt-1">
                  <Star className="w-3 h-3 mr-1" />
                  Personalized
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{recommendation.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-green-600" />
            <span>+{recommendation.expected_benefit} TXC</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{recommendation.time_to_complete}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge className={getEffortColor()}>
            {recommendation.effort_level} effort
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{(recommendation.confidence_score * 100).toFixed(0)}% confidence</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Action Items:</h4>
          <ul className="space-y-1">
            {recommendation.action_items.map((item: string, index: number) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="w-3 h-3" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button className="w-full" size="sm">
          <CheckCircle className="w-4 h-4 mr-2" />
          Take Action
        </Button>
      </CardContent>
    </Card>
  );
};

interface OpportunityCardProps {
  opportunity: any;
  onComplete: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onComplete }) => {
  const getDifficultyColor = () => {
    switch (opportunity.difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium capitalize">{opportunity.activity_type.replace('_', ' ')}</h4>
          <Badge className={getDifficultyColor()}>
            {opportunity.difficulty}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">{opportunity.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-green-600" />
            <span className="font-medium">{opportunity.estimated_txc} TXC</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{opportunity.time_window}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h5 className="text-xs font-medium">Requirements:</h5>
          <ul className="space-y-1">
            {opportunity.requirements.map((req: string, index: number) => (
              <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowRight className="w-3 h-3" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button size="sm" className="w-full" onClick={onComplete}>
          <Zap className="w-4 h-4 mr-2" />
          Start Earning
        </Button>
      </CardContent>
    </Card>
  );
};

export const TXCSmartRecommendationsDashboard: React.FC = () => {
  const {
    recommendations,
    earningOpportunities,
    optimization,
    isGenerating,
    generateSmartRecommendations,
    dismissRecommendation,
    markOpportunityCompleted
  } = useTXCSmartRecommendations();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Smart TXC Recommendations
            </CardTitle>
            <Button variant="outline" onClick={generateSmartRecommendations} disabled={isGenerating}>
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Earning Opportunities */}
      {earningOpportunities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Earning Opportunities
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {earningOpportunities.map((opportunity, index) => (
              <OpportunityCard
                key={index}
                opportunity={opportunity}
                onComplete={() => markOpportunityCompleted(opportunity.activity_type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            Personalized Recommendations
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onDismiss={() => dismissRecommendation(recommendation.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optimization Analysis */}
      {optimization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              TXC Optimization Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Current Efficiency</h4>
                <div className="flex items-center gap-2">
                  <Progress value={optimization.current_efficiency * 100} className="flex-1" />
                  <span className="text-sm font-medium">
                    {(optimization.current_efficiency * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Potential Efficiency</h4>
                <div className="flex items-center gap-2">
                  <Progress value={optimization.potential_efficiency * 100} className="flex-1" />
                  <span className="text-sm font-medium">
                    {(optimization.potential_efficiency * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Optimization Areas</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {optimization.optimization_areas.map((area, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <h5 className="font-medium text-sm">{area.area}</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current:</span>
                        <span>{area.current_score.toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Potential:</span>
                        <span className="text-green-600">+{area.potential_improvement}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{area.action_required}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {optimization.estimated_monthly_gain > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Estimated Monthly Gain:</span>
                  <span className="text-lg font-bold text-green-600">
                    +{optimization.estimated_monthly_gain.toFixed(0)} TXC
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Potential additional TXC you could earn monthly with optimizations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isGenerating && recommendations.length === 0 && earningOpportunities.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
            <p className="text-muted-foreground mb-4">
              Use TXC features to unlock personalized recommendations and earning opportunities
            </p>
            <Button variant="outline" onClick={generateSmartRecommendations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};