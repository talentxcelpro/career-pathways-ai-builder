
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, BookOpen, Star, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  marketDemand: 'high' | 'medium' | 'low';
  salaryImpact: number;
  learningPath: {
    duration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    resources: number;
  };
}

interface SkillGapAnalyzerProps {
  targetRole: string;
  currentSkills: { name: string; level: number }[];
  requiredSkills: { name: string; level: number }[];
}

export const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({
  targetRole,
  currentSkills,
  requiredSkills
}) => {
  // Calculate skill gaps
  const skillGaps: SkillGap[] = requiredSkills.map(required => {
    const current = currentSkills.find(s => s.name.toLowerCase() === required.name.toLowerCase());
    const currentLevel = current?.level || 0;
    const gap = Math.max(0, required.level - currentLevel);
    
    return {
      skill: required.name,
      currentLevel,
      requiredLevel: required.level,
      gap,
      priority: gap >= 70 ? 'critical' : gap >= 50 ? 'high' : gap >= 30 ? 'medium' : 'low',
      marketDemand: Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
      salaryImpact: Math.floor(gap * 1000), // Mock salary impact
      learningPath: {
        duration: `${Math.ceil(gap / 10)} months`,
        difficulty: gap >= 60 ? 'advanced' : gap >= 30 ? 'intermediate' : 'beginner',
        resources: Math.ceil(gap / 15)
      }
    };
  }).sort((a, b) => b.gap - a.gap);

  const criticalGaps = skillGaps.filter(g => g.priority === 'critical');
  const totalGap = skillGaps.reduce((sum, gap) => sum + gap.gap, 0);
  const avgGap = totalGap / skillGaps.length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Skills Gap Analysis for {targetRole}
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of skill gaps with market-driven recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalGaps.length}</div>
              <div className="text-sm text-gray-600">Critical Gaps</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Math.round(avgGap)}%</div>
              <div className="text-sm text-gray-600">Average Gap</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{skillGaps.length}</div>
              <div className="text-sm text-gray-600">Skills to Develop</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Detailed Skills Analysis
          </CardTitle>
          <CardDescription>
            Prioritized list of skills with market demand and learning recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGaps.map((gap, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{gap.skill}</h4>
                    <Badge className={getPriorityColor(gap.priority)}>
                      {gap.priority} priority
                    </Badge>
                    <div className={`text-sm ${getDemandColor(gap.marketDemand)}`}>
                      {gap.marketDemand} demand
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Gap: {gap.gap}%</div>
                    <div className="text-xs text-gray-500">
                      +${gap.salaryImpact.toLocaleString()} potential
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Level</span>
                      <span>{gap.currentLevel}%</span>
                    </div>
                    <Progress value={gap.currentLevel} className="h-2 mb-2" />
                    <div className="flex justify-between text-sm mb-1">
                      <span>Required Level</span>
                      <span>{gap.requiredLevel}%</span>
                    </div>
                    <Progress value={gap.requiredLevel} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Learning Duration:</span>
                      <span className="font-medium">{gap.learningPath.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Difficulty:</span>
                      <Badge variant="outline" className="text-xs">
                        {gap.learningPath.difficulty}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Resources Available:</span>
                      <span className="font-medium">{gap.learningPath.resources} courses</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm">
                    <BookOpen className="h-3 w-3 mr-1" />
                    View Learning Path
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Find Courses
                  </Button>
                  {gap.priority === 'critical' && (
                    <Button size="sm" variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Priority Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended Learning Path
          </CardTitle>
          <CardDescription>
            Optimized sequence for closing skill gaps efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Estimated total time: {Math.ceil(totalGap / 20)} months</span>
            </div>
            
            {criticalGaps.slice(0, 3).map((gap, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-medium">{gap.skill}</span>
                    <div className="text-xs text-gray-500">
                      {gap.learningPath.duration} • {gap.learningPath.difficulty}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Start Learning
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
