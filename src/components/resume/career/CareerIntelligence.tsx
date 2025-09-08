import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, TrendingUp, DollarSign, MapPin, Calendar, 
  MessageSquare, Target, Lightbulb, Award, Users,
  BookOpen, Clock, Star, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface CareerIntelligenceProps {
  resumeData: any;
  isOpen: boolean;
  onClose: () => void;
}

export const CareerIntelligence: React.FC<CareerIntelligenceProps> = ({
  resumeData,
  isOpen,
  onClose
}) => {
  const [interviewQuestion, setInterviewQuestion] = useState('');
  const [salaryLocation, setSalaryLocation] = useState('');
  const [salaryRole, setSalaryRole] = useState('');
  const [careerGoal, setCareerGoal] = useState('');

  // Mock AI-generated insights based on resume data
  const careerPath = {
    current: 'Senior Software Developer',
    next: [
      { role: 'Tech Lead', timeline: '6-12 months', probability: 85 },
      { role: 'Engineering Manager', timeline: '1-2 years', probability: 72 },
      { role: 'Principal Engineer', timeline: '2-3 years', probability: 68 }
    ],
    skills: {
      recommended: ['System Design', 'Team Leadership', 'Architecture'],
      emerging: ['AI/ML', 'Cloud Native', 'DevOps']
    }
  };

  const salaryInsights = {
    current: { min: 95000, max: 130000, median: 112000 },
    potential: { min: 120000, max: 160000, median: 140000 },
    factors: [
      { factor: 'Location', impact: '+15%', note: 'San Francisco premium' },
      { factor: 'Experience', impact: '+8%', note: '5+ years' },
      { factor: 'Skills', impact: '+12%', note: 'React, Node.js expertise' },
      { factor: 'Company Size', impact: '+10%', note: 'Large tech companies' }
    ]
  };

  const interviewPrep = {
    commonQuestions: [
      'Tell me about a challenging project you worked on.',
      'How do you handle tight deadlines and pressure?',
      'Describe your experience with React and TypeScript.',
      'What is your approach to code reviews?'
    ],
    technicalTopics: [
      'System Design',
      'Data Structures & Algorithms',
      'React Hooks & State Management',
      'API Design & RESTful Services'
    ],
    strengths: [
      'Strong technical background',
      'Full-stack capabilities',
      'Project leadership experience'
    ],
    improvements: [
      'Practice system design questions',
      'Prepare STAR method examples',
      'Review latest React patterns'
    ]
  };

  const handleGenerateQuestions = () => {
    // Would integrate with AI service
    toast.success('Personalized interview questions generated!');
  };

  const handleSalaryAnalysis = () => {
    if (!salaryRole || !salaryLocation) {
      toast.error('Please enter both role and location');
      return;
    }
    // Would call AI service for real-time salary data
    toast.success('Salary analysis generated for your profile!');
  };

  const handleCareerPath = () => {
    // Would use AI to analyze career progression
    toast.success('Career path recommendations updated!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Career Intelligence
          </CardTitle>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </CardHeader>
        
        <CardContent className="h-full overflow-y-auto p-6">
          <Tabs defaultValue="career-path" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="career-path">Career Path</TabsTrigger>
              <TabsTrigger value="interview-prep">Interview Prep</TabsTrigger>
              <TabsTrigger value="salary-intel">Salary Intelligence</TabsTrigger>
              <TabsTrigger value="networking">Networking</TabsTrigger>
            </TabsList>

            <TabsContent value="career-path" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Career Progression Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900">Current Position</h3>
                      <p className="text-2xl font-bold text-blue-700">{careerPath.current}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Recommended Next Steps</h4>
                      {careerPath.next.map((step, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{step.role}</h5>
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {step.timeline}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Progress value={step.probability} className="w-16" />
                              <span className="text-sm font-medium">{step.probability}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleCareerPath} className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Generate Detailed Career Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Skill Development
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Recommended Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {careerPath.skills.recommended.map((skill) => (
                          <Badge key={skill} variant="default">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Emerging Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {careerPath.skills.emerging.map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Learning Recommendations</h4>
                      {[
                        { course: 'System Design Fundamentals', provider: 'Coursera', duration: '6 weeks' },
                        { course: 'Leadership for Engineers', provider: 'LinkedIn Learning', duration: '4 weeks' },
                        { course: 'AWS Solutions Architect', provider: 'AWS', duration: '8 weeks' }
                      ].map((course, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{course.course}</h5>
                            <p className="text-sm text-muted-foreground">{course.provider} • {course.duration}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Enroll
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="interview-prep" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Personalized Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Input
                        placeholder="Enter target role (e.g., Senior React Developer)"
                        value={interviewQuestion}
                        onChange={(e) => setInterviewQuestion(e.target.value)}
                      />
                    </div>
                    
                    <Button onClick={handleGenerateQuestions} className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Questions
                    </Button>

                    <div className="space-y-3">
                      <h4 className="font-medium">Common Questions for Your Profile</h4>
                      {interviewPrep.commonQuestions.map((question, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <p className="text-sm">{question}</p>
                          <Button variant="ghost" size="sm" className="mt-2">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Practice Answer
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Interview Readiness
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Your Strengths</h4>
                      <div className="space-y-2">
                        {interviewPrep.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center gap-2 text-green-700">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Areas to Improve</h4>
                      <div className="space-y-2">
                        {interviewPrep.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-center gap-2 text-orange-700">
                            <ArrowRight className="h-4 w-4" />
                            <span className="text-sm">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Technical Topics to Review</h4>
                      <div className="flex flex-wrap gap-2">
                        {interviewPrep.technicalTopics.map((topic) => (
                          <Badge key={topic} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Mock Interview
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="salary-intel" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Salary Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Role (e.g., Tech Lead)"
                        value={salaryRole}
                        onChange={(e) => setSalaryRole(e.target.value)}
                      />
                      <Input
                        placeholder="Location (e.g., San Francisco)"
                        value={salaryLocation}
                        onChange={(e) => setSalaryLocation(e.target.value)}
                      />
                    </div>
                    
                    <Button onClick={handleSalaryAnalysis} className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analyze Salary Potential
                    </Button>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-green-50">
                        <h4 className="font-medium text-green-900">Current Market Range</h4>
                        <p className="text-2xl font-bold text-green-700">
                          ${salaryInsights.current.min.toLocaleString()} - ${salaryInsights.current.max.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600">Median: ${salaryInsights.current.median.toLocaleString()}</p>
                      </div>

                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-900">Growth Potential</h4>
                        <p className="text-2xl font-bold text-blue-700">
                          ${salaryInsights.potential.min.toLocaleString()} - ${salaryInsights.potential.max.toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-600">With career advancement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Salary Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {salaryInsights.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{factor.factor}</h5>
                            <p className="text-sm text-muted-foreground">{factor.note}</p>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {factor.impact}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border rounded-lg bg-yellow-50">
                      <h4 className="font-medium text-yellow-900">Negotiation Tips</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Research company-specific ranges</li>
                        <li>• Highlight unique technical skills</li>
                        <li>• Consider total compensation package</li>
                        <li>• Time negotiations strategically</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="networking" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Strategic Networking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Recommended Connections</h4>
                      {[
                        { name: 'Sarah Chen', role: 'Engineering Manager at Google', mutual: 5 },
                        { name: 'Mike Rodriguez', role: 'Tech Lead at Microsoft', mutual: 3 },
                        { name: 'Emily Davis', role: 'Senior Developer at Amazon', mutual: 8 }
                      ].map((person, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{person.name}</h5>
                            <p className="text-sm text-muted-foreground">{person.role}</p>
                            <p className="text-xs text-muted-foreground">{person.mutual} mutual connections</p>
                          </div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Events & Communities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { event: 'React Bangalore Meetup', date: 'Jan 15', type: 'Local' },
                        { event: 'DevOps India Conference', date: 'Feb 20', type: 'Virtual' },
                        { event: 'AI/ML Workshop', date: 'Mar 5', type: 'Hybrid' }
                      ].map((event, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">{event.event}</h5>
                            <p className="text-sm text-muted-foreground">{event.date} • {event.type}</p>
                          </div>
                          <Button variant="outline" size="sm">Join</Button>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border rounded-lg bg-purple-50">
                      <h4 className="font-medium text-purple-900">Community Recommendations</h4>
                      <div className="mt-2 space-y-1">
                        <Badge variant="outline">React India Community</Badge>
                        <Badge variant="outline">Bangalore Tech Meetups</Badge>
                        <Badge variant="outline">Full Stack Developers</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};