import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BrainCircuit, DollarSign, MessageSquare, TrendingUp, 
  Target, Lightbulb, Zap, Clock, Award, BookOpen 
} from 'lucide-react';

interface CareerPath {
  role: string;
  timeframe: string;
  probability: number;
  requirements: string[];
  salary: string;
}

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
}

interface SalaryInsight {
  role: string;
  location: string;
  experience: string;
  median: number;
  range: {
    min: number;
    max: number;
  };
  factors: string[];
}

interface AdvancedAIFeaturesProps {
  resumeData: any;
  targetRole?: string;
  location?: string;
}

export const AdvancedAIFeatures: React.FC<AdvancedAIFeaturesProps> = ({
  resumeData,
  targetRole = '',
  location = 'United States'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState(targetRole);
  const [selectedLocation, setSelectedLocation] = useState(location);

  // Mock data - in real app, these would come from AI services
  const careerPaths: CareerPath[] = [
    {
      role: 'Senior Software Engineer',
      timeframe: '1-2 years',
      probability: 85,
      requirements: ['System design experience', 'Leadership skills', 'Advanced algorithms'],
      salary: '$140,000 - $180,000'
    },
    {
      role: 'Tech Lead',
      timeframe: '2-3 years',
      probability: 70,
      requirements: ['Team management', 'Architecture design', 'Mentoring experience'],
      salary: '$160,000 - $200,000'
    },
    {
      role: 'Engineering Manager',
      timeframe: '3-4 years',
      probability: 60,
      requirements: ['People management', 'Strategic thinking', 'Cross-team collaboration'],
      salary: '$180,000 - $220,000'
    }
  ];

  const interviewQuestions: InterviewQuestion[] = [
    {
      question: 'Describe a time when you had to debug a complex system issue in production.',
      category: 'Technical',
      difficulty: 'medium',
      tips: [
        'Use the STAR method (Situation, Task, Action, Result)',
        'Focus on your debugging methodology',
        'Highlight communication with stakeholders'
      ]
    },
    {
      question: 'How would you design a system to handle 1 million concurrent users?',
      category: 'System Design',
      difficulty: 'hard',
      tips: [
        'Start with requirements gathering',
        'Consider scalability, reliability, and performance',
        'Discuss trade-offs between different approaches'
      ]
    },
    {
      question: 'Tell me about a time you disagreed with a team member on a technical decision.',
      category: 'Behavioral',
      difficulty: 'medium',
      tips: [
        'Show emotional intelligence and conflict resolution',
        'Explain how you reached a compromise',
        'Highlight the positive outcome'
      ]
    }
  ];

  const salaryInsights: SalaryInsight[] = [
    {
      role: 'Software Engineer',
      location: 'San Francisco, CA',
      experience: '3-5 years',
      median: 145000,
      range: { min: 120000, max: 180000 },
      factors: ['Company size', 'Equity package', 'Specific technologies']
    },
    {
      role: 'Software Engineer',
      location: 'New York, NY',
      experience: '3-5 years',
      median: 135000,
      range: { min: 110000, max: 170000 },
      factors: ['Industry sector', 'Company stage', 'Performance bonuses']
    }
  ];

  const skillGaps = [
    { skill: 'System Design', importance: 'high', hasSkill: false, resources: ['System Design Interview', 'Designing Data-Intensive Applications'] },
    { skill: 'Kubernetes', importance: 'medium', hasSkill: false, resources: ['Kubernetes Documentation', 'CKA Certification'] },
    { skill: 'Leadership', importance: 'high', hasSkill: true, resources: ['The Manager\'s Path', 'Leadership courses'] }
  ];

  const generateCareerPredictions = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Advanced AI Career Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="career-path" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="career-path">Career Path</TabsTrigger>
              <TabsTrigger value="interview-prep">Interview Prep</TabsTrigger>
              <TabsTrigger value="salary-insights">Salary Insights</TabsTrigger>
              <TabsTrigger value="skill-gaps">Skill Gaps</TabsTrigger>
            </TabsList>

            <TabsContent value="career-path" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">AI Career Path Predictions</h3>
                <Button 
                  onClick={generateCareerPredictions}
                  disabled={isGenerating}
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <BrainCircuit className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Predictions
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {careerPaths.map((path, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{path.role}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {path.timeframe}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getProbabilityColor(path.probability)}`}>
                            {path.probability}%
                          </div>
                          <div className="text-sm text-muted-foreground">Probability</div>
                        </div>
                      </div>

                      <Progress value={path.probability} className="mb-3" />

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Salary Range:</span> {path.salary}
                        </div>
                        <div>
                          <span className="text-sm font-medium">Requirements to achieve:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {path.requirements.map((req, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="interview-prep" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">AI-Generated Interview Questions</h3>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select target role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineer">Software Engineer</SelectItem>
                    <SelectItem value="product-manager">Product Manager</SelectItem>
                    <SelectItem value="data-scientist">Data Scientist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {interviewQuestions.map((q, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{q.question}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline">{q.category}</Badge>
                          <Badge className={getDifficultyColor(q.difficulty)}>
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h5 className="font-medium flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Answer Tips:
                        </h5>
                        <ul className="space-y-1">
                          {q.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="salary-insights" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">AI Salary Insights</h3>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="san-francisco">San Francisco, CA</SelectItem>
                    <SelectItem value="new-york">New York, NY</SelectItem>
                    <SelectItem value="seattle">Seattle, WA</SelectItem>
                    <SelectItem value="austin">Austin, TX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {salaryInsights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        {insight.role} - {insight.location}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            ${insight.median.toLocaleString()}
                          </div>
                          <div className="text-sm text-green-600">Median Salary</div>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            ${insight.range.min.toLocaleString()}
                          </div>
                          <div className="text-sm text-blue-600">Low Range</div>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            ${insight.range.max.toLocaleString()}
                          </div>
                          <div className="text-sm text-purple-600">High Range</div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Salary Factors:</h5>
                        <div className="flex flex-wrap gap-2">
                          {insight.factors.map((factor, idx) => (
                            <Badge key={idx} variant="secondary">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="skill-gaps" className="space-y-4">
              <h3 className="text-lg font-semibold">AI Skill Gap Analysis</h3>
              
              <div className="space-y-4">
                {skillGaps.map((gap, index) => (
                  <Card key={index} className={`border-l-4 ${gap.hasSkill ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{gap.skill}</h4>
                          <Badge 
                            className={
                              gap.importance === 'high' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {gap.importance} importance
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {gap.hasSkill ? (
                            <>
                              <Award className="h-5 w-5 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">You have this</span>
                            </>
                          ) : (
                            <>
                              <Target className="h-5 w-5 text-red-500" />
                              <span className="text-sm text-red-600 font-medium">Skill gap</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4" />
                          Learning Resources:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {gap.resources.map((resource, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};