import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Compass, MapPin, TrendingUp, Briefcase, Target, 
  Users, DollarSign, Clock, Star, ArrowRight,
  Brain, Lightbulb, BookOpen, Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerPath {
  title: string;
  company: string;
  timeframe: string;
  probability: number;
  salaryRange: string;
  skills: string[];
  description: string;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  learningResources: string[];
}

interface CareerGuidanceProps {
  resumeData: any;
  className?: string;
}

export const CareerGuidance: React.FC<CareerGuidanceProps> = ({
  resumeData,
  className
}) => {
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [careerPaths] = useState<CareerPath[]>([
    {
      title: 'Senior Software Engineer',
      company: 'Tech Startups',
      timeframe: '6-12 months',
      probability: 85,
      salaryRange: '$120k - $150k',
      skills: ['React', 'Node.js', 'System Design'],
      description: 'Lead development teams and architect scalable solutions'
    },
    {
      title: 'Technical Lead',
      company: 'Mid-size Companies',
      timeframe: '12-18 months',
      probability: 72,
      salaryRange: '$140k - $170k',
      skills: ['Leadership', 'Architecture', 'Mentoring'],
      description: 'Guide technical decisions and mentor junior developers'
    },
    {
      title: 'Engineering Manager',
      company: 'Enterprise',
      timeframe: '18-24 months',
      probability: 58,
      salaryRange: '$160k - $200k',
      skills: ['People Management', 'Strategy', 'Communication'],
      description: 'Manage engineering teams and align technical with business goals'
    }
  ]);

  const [skillGaps] = useState<SkillGap[]>([
    {
      skill: 'System Design',
      currentLevel: 6,
      requiredLevel: 8,
      priority: 'high',
      learningResources: ['System Design Interview', 'AWS Architecture']
    },
    {
      skill: 'Leadership',
      currentLevel: 4,
      requiredLevel: 7,
      priority: 'medium',
      learningResources: ['Management 3.0', 'Crucial Conversations']
    },
    {
      skill: 'Cloud Architecture',
      currentLevel: 5,
      requiredLevel: 8,
      priority: 'high',
      learningResources: ['AWS Solutions Architect', 'Cloud Design Patterns']
    }
  ]);

  const marketInsights = {
    demandTrend: 'High',
    competitionLevel: 'Medium',
    salaryTrend: '+12%',
    hotSkills: ['AI/ML', 'Cloud', 'DevOps', 'Leadership']
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Career Goal Setting */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Career Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Enter your target role"
              className="flex-1"
            />
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Brain className="h-4 w-4 mr-2" />
              Analyze Path
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Insights for {targetRole}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {marketInsights.demandTrend}
              </div>
              <p className="text-sm text-muted-foreground">Job Demand</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {marketInsights.competitionLevel}
              </div>
              <p className="text-sm text-muted-foreground">Competition</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {marketInsights.salaryTrend}
              </div>
              <p className="text-sm text-muted-foreground">Salary Growth</p>
            </div>
            <div className="text-center">
              <div className="flex flex-wrap gap-1 justify-center">
                {marketInsights.hotSkills.slice(0, 2).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Hot Skills</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Career Paths */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Recommended Career Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careerPaths.map((path, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{path.title}</h4>
                      <p className="text-sm text-muted-foreground">{path.company}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{path.salaryRange}</div>
                      <div className="text-sm text-muted-foreground">{path.timeframe}</div>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{path.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Match Probability:</span>
                        <span className="text-sm font-bold text-blue-600">{path.probability}%</span>
                      </div>
                      <Progress value={path.probability} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {path.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skill Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGaps.map((gap, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{gap.skill}</h4>
                    <Badge 
                      variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {gap.priority} priority
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {gap.currentLevel}/10 → {gap.requiredLevel}/10
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Level</span>
                    <span>Target Level</span>
                  </div>
                  <div className="relative">
                    <Progress value={(gap.currentLevel / 10) * 100} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 w-0.5 bg-red-500"
                      style={{ left: `${(gap.requiredLevel / 10) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {gap.learningResources.map((resource) => (
                      <Badge key={resource} variant="secondary" className="text-xs">
                        <BookOpen className="h-2 w-2 mr-1" />
                        {resource}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Learn
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            90-Day Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { period: 'Week 1-4', task: 'Complete System Design course', priority: 'high' },
              { period: 'Week 5-8', task: 'Build portfolio project showcasing architecture skills', priority: 'high' },
              { period: 'Week 9-12', task: 'Network with senior engineers and attend tech meetups', priority: 'medium' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-green-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.period}</div>
                  <div className="text-sm text-muted-foreground">{item.task}</div>
                </div>
                <Badge variant={item.priority === 'high' ? 'default' : 'secondary'}>
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};