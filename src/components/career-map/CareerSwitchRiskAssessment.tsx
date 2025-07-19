import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Clock, DollarSign, Target, Lightbulb } from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';

interface CareerSwitchRiskAssessmentProps {
  currentRole: string;
  targetRole: string;
  experienceLevel: string;
  currentSkills: Array<{
    name: string;
    proficiency: number;
    category: string;
  }>;
}

const CareerSwitchRiskAssessment: React.FC<CareerSwitchRiskAssessmentProps> = ({
  currentRole,
  targetRole,
  experienceLevel,
  currentSkills
}) => {
  const [riskData, setRiskData] = useState<any>(null);
  const { analyzeCareerSwitchRisk, isAnalyzingRisk } = useAICareerMapping();

  const handleAnalyzeRisk = async () => {
    try {
      const result = await analyzeCareerSwitchRisk.mutateAsync({
        currentRole,
        targetRole,
        experienceLevel,
        currentSkills
      });
      setRiskData(result);
    } catch (error) {
      console.error('Risk analysis failed:', error);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  if (!riskData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Career Switch Risk Assessment
          </CardTitle>
          <CardDescription>
            Analyze the feasibility and risks of switching from {currentRole} to {targetRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAnalyzeRisk} 
            disabled={isAnalyzingRisk}
            className="w-full"
          >
            {isAnalyzingRisk ? 'Analyzing...' : 'Analyze Career Switch Risk'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getRiskColor(riskData.riskScore)}`}>
                {riskData.riskScore}%
              </div>
              <p className="text-sm text-muted-foreground">Risk Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {riskData.switchabilityIndex}%
              </div>
              <p className="text-sm text-muted-foreground">Switchability</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {riskData.timeToTransition}
              </div>
              <p className="text-sm text-muted-foreground">Timeline</p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Badge variant={getRiskBadgeVariant(riskData.marketDemand)}>
              Market: {riskData.marketDemand}
            </Badge>
            <Badge variant={riskData.salaryImpact === 'increase' ? 'default' : 'secondary'}>
              Salary: {riskData.salaryImpact}
            </Badge>
            <Badge variant="outline">
              Confidence: {riskData.confidenceLevel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Transferable Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskData.transferableSkills?.map((skill: string, index: number) => (
                <Badge key={index} variant="default" className="mr-2 mb-2">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {riskData.criticalGaps?.map((gap: string, index: number) => (
                <Badge key={index} variant="destructive" className="mr-2 mb-2">
                  {gap}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Factors Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskData.riskFactors?.map((factor: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{factor.factor}</h4>
                  <Badge variant={getRiskBadgeVariant(factor.impact)}>
                    {factor.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mitigation Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Mitigation Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskData.mitigationStrategies?.map((strategy: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{strategy.strategy}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {strategy.timeline}
                    </Badge>
                    <Badge variant={strategy.effort === 'high' ? 'destructive' : 'default'}>
                      {strategy.effort} effort
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Insights */}
      {riskData.industryInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Industry Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {riskData.industryInsights.growthRate}
                </div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
              <div className="text-center">
                <Badge variant={getRiskBadgeVariant(riskData.industryInsights.competitionLevel)}>
                  {riskData.industryInsights.competitionLevel} competition
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant={riskData.industryInsights.remoteOpportunities === 'high' ? 'default' : 'secondary'}>
                  {riskData.industryInsights.remoteOpportunities} remote
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actionable Advice */}
      <Card>
        <CardHeader>
          <CardTitle>Actionable Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {riskData.actionableAdvice?.map((advice: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{advice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerSwitchRiskAssessment;