import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  MapPin, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Award, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Users,
  Building,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CareerGoal {
  targetRole: string;
  currentRole: string;
  industry: string;
  timeframe: string;
  salaryTarget: string;
  location: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'experience' | 'education' | 'network' | 'project';
  duration: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in_progress' | 'planned';
  prerequisites: string[];
  resources: Array<{
    type: 'course' | 'book' | 'certification' | 'project' | 'mentor';
    title: string;
    provider: string;
    url?: string;
    price?: string;
  }>;
}

interface CareerRoadmap {
  goalId: string;
  title: string;
  description: string;
  totalDuration: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  successProbability: number;
  salaryGrowth: string;
  phases: Array<{
    name: string;
    duration: string;
    milestones: Milestone[];
  }>;
  marketInsights: {
    demandLevel: 'high' | 'medium' | 'low';
    competitionLevel: 'high' | 'medium' | 'low';
    averageSalary: string;
    topCompanies: string[];
    requiredSkills: string[];
  };
}

const CareerPathfinder: React.FC = () => {
  const [careerGoal, setCareerGoal] = useState<CareerGoal>({
    targetRole: '',
    currentRole: '',
    industry: '',
    timeframe: '',
    salaryTarget: '',
    location: ''
  });
  const [generatedRoadmap, setGeneratedRoadmap] = useState<CareerRoadmap | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateRoadmap = async () => {
    if (!careerGoal.targetRole || !careerGoal.currentRole) {
      toast({
        title: "Missing Information",
        description: "Please fill in both current and target roles.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI roadmap generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRoadmap: CareerRoadmap = {
        goalId: '1',
        title: `${careerGoal.currentRole} → ${careerGoal.targetRole}`,
        description: `Strategic roadmap to transition from ${careerGoal.currentRole} to ${careerGoal.targetRole} in ${careerGoal.timeframe}`,
        totalDuration: careerGoal.timeframe || '12-18 months',
        difficultyLevel: 'intermediate',
        successProbability: 87,
        salaryGrowth: '+35-50%',
        phases: [
          {
            name: 'Foundation Building',
            duration: '3-4 months',
            milestones: [
              {
                id: '1',
                title: 'Master Core Technologies',
                description: 'Build expertise in essential technical skills for the target role',
                category: 'skill',
                duration: '2-3 months',
                priority: 'high',
                status: 'planned',
                prerequisites: [],
                resources: [
                  {
                    type: 'course',
                    title: 'Advanced React Development',
                    provider: 'Udemy',
                    price: '$59.99'
                  },
                  {
                    type: 'certification',
                    title: 'AWS Cloud Practitioner',
                    provider: 'Amazon',
                    price: '$100'
                  }
                ]
              },
              {
                id: '2',
                title: 'Build Professional Portfolio',
                description: 'Create 3-4 showcase projects demonstrating target role capabilities',
                category: 'project',
                duration: '2 months',
                priority: 'high',
                status: 'planned',
                prerequisites: ['Master Core Technologies'],
                resources: [
                  {
                    type: 'project',
                    title: 'Full-Stack E-commerce App',
                    provider: 'Self-guided',
                    price: 'Free'
                  }
                ]
              }
            ]
          },
          {
            name: 'Skill Enhancement',
            duration: '4-6 months',
            milestones: [
              {
                id: '3',
                title: 'Advanced System Design',
                description: 'Learn scalable architecture patterns and system design principles',
                category: 'skill',
                duration: '3 months',
                priority: 'high',
                status: 'planned',
                prerequisites: ['Master Core Technologies'],
                resources: [
                  {
                    type: 'course',
                    title: 'System Design Interview Prep',
                    provider: 'Educative',
                    price: '$79/month'
                  },
                  {
                    type: 'book',
                    title: 'Designing Data-Intensive Applications',
                    provider: 'O\'Reilly',
                    price: '$44.99'
                  }
                ]
              },
              {
                id: '4',
                title: 'Leadership & Communication',
                description: 'Develop soft skills essential for senior roles',
                category: 'skill',
                duration: '2 months',
                priority: 'medium',
                status: 'planned',
                prerequisites: [],
                resources: [
                  {
                    type: 'course',
                    title: 'Technical Leadership',
                    provider: 'Coursera',
                    price: '$49/month'
                  }
                ]
              }
            ]
          },
          {
            name: 'Career Transition',
            duration: '3-4 months',
            milestones: [
              {
                id: '5',
                title: 'Network & Apply',
                description: 'Build professional network and apply to target positions',
                category: 'network',
                duration: '2 months',
                priority: 'high',
                status: 'planned',
                prerequisites: ['Build Professional Portfolio', 'Advanced System Design'],
                resources: [
                  {
                    type: 'mentor',
                    title: 'Senior Engineer Mentorship',
                    provider: 'MentorCruise',
                    price: '$120/session'
                  }
                ]
              }
            ]
          }
        ],
        marketInsights: {
          demandLevel: 'high',
          competitionLevel: 'medium',
          averageSalary: '$120,000 - $160,000',
          topCompanies: ['Google', 'Microsoft', 'Amazon', 'Netflix', 'Meta'],
          requiredSkills: ['React', 'Node.js', 'System Design', 'AWS', 'TypeScript', 'Leadership']
        }
      };

      setGeneratedRoadmap(mockRoadmap);
      toast({
        title: "Roadmap Generated!",
        description: "Your personalized career roadmap is ready."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getMilestoneIcon = (category: string) => {
    switch (category) {
      case 'skill': return <BookOpen className="h-4 w-4" />;
      case 'experience': return <TrendingUp className="h-4 w-4" />;
      case 'education': return <Award className="h-4 w-4" />;
      case 'network': return <Users className="h-4 w-4" />;
      case 'project': return <Building className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'planned': return <Target className="h-4 w-4 text-gray-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Career Pathfinder</h1>
          <p className="text-lg text-gray-600 mt-2">
            Create personalized roadmaps to achieve your career goals
          </p>
        </div>
      </div>

      {!generatedRoadmap ? (
        /* Goal Setting Form */
        <Card>
          <CardHeader>
            <CardTitle>Define Your Career Goal</CardTitle>
            <CardDescription>
              Tell us about your career aspirations and we'll create a personalized roadmap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="e.g., Frontend Developer"
                  value={careerGoal.currentRole}
                  onChange={(e) => setCareerGoal({...careerGoal, currentRole: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="targetRole">Target Role</Label>
                <Input
                  id="targetRole"
                  placeholder="e.g., Senior Full Stack Engineer"
                  value={careerGoal.targetRole}
                  onChange={(e) => setCareerGoal({...careerGoal, targetRole: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select 
                  value={careerGoal.industry} 
                  onValueChange={(value) => setCareerGoal({...careerGoal, industry: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select 
                  value={careerGoal.timeframe} 
                  onValueChange={(value) => setCareerGoal({...careerGoal, timeframe: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="12 months">12 months</SelectItem>
                    <SelectItem value="18 months">18 months</SelectItem>
                    <SelectItem value="24 months">24 months</SelectItem>
                    <SelectItem value="3+ years">3+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salaryTarget">Salary Target</Label>
                <Input
                  id="salaryTarget"
                  placeholder="e.g., $120,000 - $150,000"
                  value={careerGoal.salaryTarget}
                  onChange={(e) => setCareerGoal({...careerGoal, salaryTarget: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location">Preferred Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA or Remote"
                  value={careerGoal.location}
                  onChange={(e) => setCareerGoal({...careerGoal, location: e.target.value})}
                />
              </div>
            </div>

            <Button 
              onClick={generateRoadmap}
              disabled={isGenerating || !careerGoal.targetRole || !careerGoal.currentRole}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Target className="h-4 w-4 mr-2 animate-spin" />
                  Generating Your Roadmap...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Generate AI Career Roadmap
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Generated Roadmap */
        <div className="space-y-6">
          {/* Roadmap Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{generatedRoadmap.title}</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {generatedRoadmap.description}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setGeneratedRoadmap(null)}
                >
                  Create New Roadmap
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {generatedRoadmap.totalDuration}
                  </div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {generatedRoadmap.successProbability}%
                  </div>
                  <div className="text-sm text-gray-600">Success Probability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedRoadmap.salaryGrowth}
                  </div>
                  <div className="text-sm text-gray-600">Salary Growth</div>
                </div>
                <div className="text-center">
                  <Badge className="text-sm" variant="outline">
                    {generatedRoadmap.difficultyLevel}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">Difficulty</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="roadmap" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="market">Market Insights</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            {/* Roadmap Timeline */}
            <TabsContent value="roadmap" className="space-y-6">
              {generatedRoadmap.phases.map((phase, phaseIndex) => (
                <Card key={phaseIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {phaseIndex + 1}
                      </div>
                      {phase.name}
                      <Badge variant="outline" className="ml-auto">
                        {phase.duration}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {phase.milestones.map((milestone, milestoneIndex) => (
                        <div key={milestone.id} className="border-l-2 border-gray-200 pl-6 relative">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                            {getStatusIcon(milestone.status)}
                          </div>
                          
                          <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="p-1 bg-blue-100 rounded">
                                    {getMilestoneIcon(milestone.category)}
                                  </div>
                                  <h3 className="font-semibold text-gray-900">
                                    {milestone.title}
                                  </h3>
                                  <Badge className={getPriorityColor(milestone.priority)}>
                                    {milestone.priority}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {milestone.duration}
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{milestone.description}</p>
                              
                              {milestone.resources.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Resources:</h4>
                                  <div className="space-y-1">
                                    {milestone.resources.map((resource, resourceIndex) => (
                                      <div key={resourceIndex} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">
                                          {resource.title} ({resource.provider})
                                        </span>
                                        {resource.price && (
                                          <Badge variant="secondary">{resource.price}</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Market Insights */}
            <TabsContent value="market" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Market Demand</span>
                      <Badge className={
                        generatedRoadmap.marketInsights.demandLevel === 'high' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {generatedRoadmap.marketInsights.demandLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Competition Level</span>
                      <Badge className={
                        generatedRoadmap.marketInsights.competitionLevel === 'medium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {generatedRoadmap.marketInsights.competitionLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Salary</span>
                      <span className="font-semibold text-green-600">
                        {generatedRoadmap.marketInsights.averageSalary}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generatedRoadmap.marketInsights.topCompanies.map((company, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{company}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {generatedRoadmap.marketInsights.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resources Summary */}
            <TabsContent value="resources" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Resources Summary</CardTitle>
                  <CardDescription>
                    Curated resources to help you achieve your career goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedRoadmap.phases.flatMap(phase => 
                      phase.milestones.flatMap(milestone => 
                        milestone.resources.map((resource, index) => (
                          <Card key={`${milestone.id}-${index}`} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-sm">{resource.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {resource.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{resource.provider}</p>
                              {resource.price && (
                                <div className="mt-2">
                                  <Badge variant="outline">{resource.price}</Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )
                    )}
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

export default CareerPathfinder;