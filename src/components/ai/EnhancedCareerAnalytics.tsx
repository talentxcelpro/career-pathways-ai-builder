import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Target, Award, Users, 
  Briefcase, DollarSign, MapPin, Clock, Star,
  ChevronRight, ExternalLink, CheckCircle, AlertCircle
} from 'lucide-react';

interface MarketData {
  industryGrowth: number;
  demandScore: number;
  salaryTrend: 'up' | 'down' | 'stable';
  averageSalary: string;
  location: string;
  hotSkills: string[];
  emergingRoles: string[];
}

interface CareerPath {
  id: string;
  title: string;
  timeframe: string;
  probability: number;
  requiredSkills: string[];
  salaryRange: string;
  marketDemand: 'high' | 'medium' | 'low';
  steps: Array<{
    phase: string;
    duration: string;
    actions: string[];
    milestones: string[];
  }>;
}

interface ActionableRecommendation {
  id: string;
  type: 'skill' | 'networking' | 'certification' | 'experience';
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  timeToComplete: string;
  impact: number;
  resources: Array<{
    name: string;
    type: 'course' | 'book' | 'platform' | 'event';
    url: string;
    cost: string;
  }>;
}

const EnhancedCareerAnalytics: React.FC = () => {
  const [currentIndustry] = useState('Technology');
  const [currentRole] = useState('Software Engineer');
  
  // Mock real market data (would come from APIs like LinkedIn, Glassdoor, BLS)
  const marketData: MarketData = {
    industryGrowth: 8.2,
    demandScore: 92,
    salaryTrend: 'up',
    averageSalary: '$125,000 - $185,000',
    location: 'Remote/Major Cities',
    hotSkills: ['AI/ML', 'Cloud Architecture', 'DevOps', 'React', 'Python'],
    emergingRoles: ['AI Engineer', 'DevOps Architect', 'Full-Stack ML Engineer']
  };

  const careerPaths: CareerPath[] = [
    {
      id: '1',
      title: 'Senior Software Engineer → Engineering Manager',
      timeframe: '18-24 months',
      probability: 78,
      requiredSkills: ['Leadership', 'Project Management', 'Team Building'],
      salaryRange: '$150K - $220K',
      marketDemand: 'high',
      steps: [
        {
          phase: 'Leadership Foundation',
          duration: '3-6 months',
          actions: [
            'Lead a small project team (2-3 developers)',
            'Complete leadership training course',
            'Start mentoring junior developers'
          ],
          milestones: ['Successfully deliver team project', 'Complete management certification']
        },
        {
          phase: 'Management Skills',
          duration: '6-12 months',
          actions: [
            'Take on larger team responsibilities',
            'Learn budget and resource planning',
            'Develop hiring and performance review skills'
          ],
          milestones: ['Manage team of 5+ people', 'Complete first performance reviews']
        }
      ]
    },
    {
      id: '2',
      title: 'Software Engineer → AI/ML Engineer',
      timeframe: '12-18 months',
      probability: 85,
      requiredSkills: ['Python', 'TensorFlow/PyTorch', 'Statistics', 'Data Science'],
      salaryRange: '$140K - $250K',
      marketDemand: 'high',
      steps: [
        {
          phase: 'ML Fundamentals',
          duration: '4-6 months',
          actions: [
            'Complete ML specialization course',
            'Build 3-5 ML projects',
            'Learn statistics and data analysis'
          ],
          milestones: ['Deploy first ML model', 'Contribute to ML open source project']
        }
      ]
    }
  ];

  const actionableRecommendations: ActionableRecommendation[] = [
    {
      id: '1',
      type: 'certification',
      title: 'AWS Solutions Architect Certification',
      description: 'Cloud skills are in extreme demand. This certification will increase your market value by 35%.',
      urgency: 'high',
      timeToComplete: '2-3 months',
      impact: 92,
      resources: [
        {
          name: 'AWS Training',
          type: 'course',
          url: 'https://aws.amazon.com/training/',
          cost: '$3,000'
        },
        {
          name: 'A Cloud Guru',
          type: 'platform',
          url: 'https://acloudguru.com',
          cost: '$35/month'
        }
      ]
    },
    {
      id: '2',
      type: 'networking',
      title: 'Connect with 5 Senior Engineers at Target Companies',
      description: 'Building relationships is key. 70% of jobs are never posted publicly.',
      urgency: 'medium',
      timeToComplete: '4-6 weeks',
      impact: 78,
      resources: [
        {
          name: 'LinkedIn Premium',
          type: 'platform',
          url: 'https://linkedin.com/premium',
          cost: '$59.99/month'
        },
        {
          name: 'Tech Meetups',
          type: 'event',
          url: 'https://meetup.com',
          cost: 'Free'
        }
      ]
    },
    {
      id: '3',
      type: 'skill',
      title: 'Master Kubernetes & Container Orchestration',
      description: 'Container skills are required for 89% of DevOps roles and increasing salaries by 28%.',
      urgency: 'high',
      timeToComplete: '6-8 weeks',
      impact: 87,
      resources: [
        {
          name: 'Kubernetes Documentation',
          type: 'platform',
          url: 'https://kubernetes.io/docs/',
          cost: 'Free'
        },
        {
          name: 'CKA Certification',
          type: 'course',
          url: 'https://training.linuxfoundation.org/',
          cost: '$395'
        }
      ]
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMarketDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Intelligence Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Real-Time Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{marketData.industryGrowth}%</div>
              <div className="text-sm text-muted-foreground">Industry Growth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{marketData.demandScore}/100</div>
              <div className="text-sm text-muted-foreground">Market Demand</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{marketData.averageSalary}</div>
              <div className="text-sm text-muted-foreground">Salary Range</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold text-green-600">Rising</span>
              </div>
              <div className="text-sm text-muted-foreground">Salary Trend</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="paths" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="paths">Career Paths</TabsTrigger>
          <TabsTrigger value="actions">Action Plan</TabsTrigger>
          <TabsTrigger value="skills">Skills Intel</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-4">
          <div className="grid gap-4">
            {careerPaths.map((path) => (
              <Card key={path.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">{path.timeframe}</Badge>
                        <Badge className={getMarketDemandColor(path.marketDemand)}>
                          {path.marketDemand} demand
                        </Badge>
                        <span className="text-sm text-muted-foreground">{path.salaryRange}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{path.probability}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {path.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Roadmap</h4>
                      <div className="space-y-3">
                        {path.steps.map((step, index) => (
                          <div key={index} className="border-l-2 border-primary/30 pl-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-primary rounded-full -ml-6 border-2 border-background"></div>
                              <h5 className="font-medium">{step.phase}</h5>
                              <Badge variant="secondary" className="text-xs">{step.duration}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <div className="mb-1">
                                <strong>Actions:</strong> {step.actions.join(', ')}
                              </div>
                              <div>
                                <strong>Milestones:</strong> {step.milestones.join(', ')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      Start This Path <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4">
            {actionableRecommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getUrgencyColor(rec.urgency)}>
                        {rec.urgency} priority
                      </Badge>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{rec.impact}%</div>
                        <div className="text-xs text-muted-foreground">Impact Score</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Time to complete: {rec.timeToComplete}</span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Recommended Resources
                      </h4>
                      <div className="space-y-2">
                        {rec.resources.map((resource, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div>
                              <span className="font-medium">{resource.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">{resource.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{resource.cost}</span>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      Start Action Plan <CheckCircle className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Hot Skills in {currentIndustry}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.hotSkills.map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span>{skill}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={90 - index * 5} className="w-20" />
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emerging Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.emergingRoles.map((role) => (
                    <div key={role} className="flex items-center justify-between">
                      <span>{role}</span>
                      <Badge className="bg-green-50 text-green-700">+45% growth</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Strategic Networking Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900">LinkedIn Strategy</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    Connect with 2-3 professionals weekly in your target roles. 85% response rate with personalized messages.
                  </p>
                  <Button size="sm" className="mt-2">View LinkedIn Targets</Button>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900">Industry Events</h4>
                  <p className="text-green-700 text-sm mt-1">
                    3 relevant conferences this quarter. ROI: Average 5 quality connections per event.
                  </p>
                  <Button size="sm" className="mt-2">Find Events</Button>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-900">Mentorship Matching</h4>
                  <p className="text-purple-700 text-sm mt-1">
                    Connect with 2 senior professionals who made similar career transitions.
                  </p>
                  <Button size="sm" className="mt-2">Find Mentors</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCareerAnalytics;