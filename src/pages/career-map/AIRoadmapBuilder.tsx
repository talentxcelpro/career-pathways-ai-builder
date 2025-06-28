
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Sparkles, Target, Clock, MapPin, TrendingUp, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AICareerInsights } from '@/components/career-map/AICareerInsights';
import { InteractiveTimeline } from '@/components/career-map/InteractiveTimeline';
import { SkillGapAnalyzer } from '@/components/career-map/SkillGapAnalyzer';
import { NetworkingSuggestions } from '@/components/career-map/NetworkingSuggestions';

const AIRoadmapBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState({
    currentRole: '',
    targetRole: '',
    timeframe: '',
    location: '',
    currentSkills: [] as string[],
    interests: [] as string[],
    careerGoals: '',
    preferredLearning: ''
  });

  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);

  // Mock skills data
  const availableSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'Data Science', 'System Design', 'Leadership', 'Project Management'
  ];

  const mockMilestones = [
    {
      id: '1',
      title: 'Master Advanced JavaScript Concepts',
      description: 'Learn ES6+, async programming, and design patterns',
      targetDate: '2024-09-01',
      status: 'upcoming' as const,
      category: 'skill' as const,
      estimatedDuration: '6 weeks',
      resources: [
        { type: 'course' as const, title: 'Advanced JavaScript Masterclass', provider: 'Udemy' },
        { type: 'book' as const, title: 'You Don\'t Know JS', provider: 'O\'Reilly' }
      ],
      priority: 'high' as const
    },
    {
      id: '2',
      title: 'AWS Solutions Architect Certification',
      description: 'Prepare for and pass the AWS SA Associate exam',
      targetDate: '2024-11-15',
      status: 'upcoming' as const,
      category: 'certification' as const,
      estimatedDuration: '3 months',
      resources: [
        { type: 'course' as const, title: 'AWS Certified Solutions Architect', provider: 'A Cloud Guru' },
        { type: 'certification' as const, title: 'AWS SA Associate Exam', provider: 'AWS' }
      ],
      priority: 'high' as const
    }
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setRoadmapData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedRoadmap(roadmapData);
      setIsGenerating(false);
      setCurrentStep(5);
    }, 3000);
  };

  const handleMilestoneUpdate = (milestoneId: string, status: any) => {
    console.log(`Updating milestone ${milestoneId} to ${status}`);
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Career Information
        </CardTitle>
        <CardDescription>Tell us about your current situation and goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current-role">Current Role</Label>
            <Input
              id="current-role"
              placeholder="e.g., Software Engineer"
              value={roadmapData.currentRole}
              onChange={(e) => handleInputChange('currentRole', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="target-role">Target Role</Label>
            <Input
              id="target-role"
              placeholder="e.g., Senior Software Engineer"
              value={roadmapData.targetRole}
              onChange={(e) => handleInputChange('targetRole', e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeframe">Target Timeframe</Label>
            <Select onValueChange={(value) => handleInputChange('timeframe', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">1 year</SelectItem>
                <SelectItem value="18">18 months</SelectItem>
                <SelectItem value="24">2 years</SelectItem>
                <SelectItem value="36">3+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Preferred Location</Label>
            <Input
              id="location"
              placeholder="e.g., San Francisco, Remote"
              value={roadmapData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="career-goals">Career Goals & Aspirations</Label>
          <Textarea
            id="career-goals"
            placeholder="Describe your long-term career vision..."
            value={roadmapData.careerGoals}
            onChange={(e) => handleInputChange('careerGoals', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Skills Assessment
        </CardTitle>
        <CardDescription>Select your current skills and expertise areas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Current Skills</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableSkills.map((skill) => (
              <Badge
                key={skill}
                variant={roadmapData.currentSkills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const newSkills = roadmapData.currentSkills.includes(skill)
                    ? roadmapData.currentSkills.filter(s => s !== skill)
                    : [...roadmapData.currentSkills, skill];
                  handleInputChange('currentSkills', newSkills);
                }}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Learning Preferences</Label>
          <Select onValueChange={(value) => handleInputChange('preferredLearning', value)}>
            <SelectTrigger>
              <SelectValue placeholder="How do you prefer to learn?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online-courses">Online Courses</SelectItem>
              <SelectItem value="books">Books & Documentation</SelectItem>
              <SelectItem value="hands-on">Hands-on Projects</SelectItem>
              <SelectItem value="mentorship">Mentorship & Coaching</SelectItem>
              <SelectItem value="mixed">Mixed Approach</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis
          </CardTitle>
          <CardDescription>AI-powered insights for your career path</CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
          <TabsTrigger value="skills">Skills Gap</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <AICareerInsights
            targetRole={roadmapData.targetRole}
            currentSkills={roadmapData.currentSkills}
            location={roadmapData.location}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillGapAnalyzer
            targetRole={roadmapData.targetRole}
            currentSkills={roadmapData.currentSkills.map(skill => ({ name: skill, level: 70 }))}
            requiredSkills={[
              { name: 'JavaScript', level: 90 },
              { name: 'React', level: 85 },
              { name: 'System Design', level: 80 }
            ]}
          />
        </TabsContent>

        <TabsContent value="networking">
          <NetworkingSuggestions
            targetRole={roadmapData.targetRole}
            currentLocation={roadmapData.location}
            interests={roadmapData.interests}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <InteractiveTimeline
            milestones={mockMilestones}
            onMilestoneUpdate={handleMilestoneUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Your Roadmap
        </CardTitle>
        <CardDescription>Review your inputs and generate your personalized career roadmap</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Career Transition</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">From:</span>
                <span className="font-medium">{roadmapData.currentRole}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">To:</span>
                <span className="font-medium">{roadmapData.targetRole}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Timeline & Location</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{roadmapData.timeframe} months</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{roadmapData.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Current Skills</h4>
          <div className="flex flex-wrap gap-2">
            {roadmapData.currentSkills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerateRoadmap}
          disabled={isGenerating || !roadmapData.currentRole || !roadmapData.targetRole}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Generating Your AI Roadmap...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate AI-Powered Roadmap
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="space-y-3">
            <Progress value={33} className="h-2" />
            <div className="text-center text-sm text-gray-600">
              Analyzing market trends and skill requirements...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderGeneratedRoadmap = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Your AI-Generated Career Roadmap
          </CardTitle>
          <CardDescription>
            Personalized path from {roadmapData.currentRole} to {roadmapData.targetRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 justify-center">
            <Button>Save Roadmap</Button>
            <Button variant="outline">Share Roadmap</Button>
            <Link to="/career-map/my-roadmaps">
              <Button variant="outline">View All Roadmaps</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Interactive Timeline</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="network">Networking</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <InteractiveTimeline
            milestones={mockMilestones}
            onMilestoneUpdate={handleMilestoneUpdate}
          />
        </TabsContent>

        <TabsContent value="insights">
          <AICareerInsights
            targetRole={roadmapData.targetRole}
            currentSkills={roadmapData.currentSkills}
            location={roadmapData.location}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillGapAnalyzer
            targetRole={roadmapData.targetRole}
            currentSkills={roadmapData.currentSkills.map(skill => ({ name: skill, level: 70 }))}
            requiredSkills={[
              { name: 'JavaScript', level: 90 },
              { name: 'React', level: 85 },
              { name: 'System Design', level: 80 }
            ]}
          />
        </TabsContent>

        <TabsContent value="network">
          <NetworkingSuggestions
            targetRole={roadmapData.targetRole}
            currentLocation={roadmapData.location}
            interests={roadmapData.interests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/career-map" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Career Map
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Career Roadmap Builder
          </h1>
          <p className="text-gray-600">Create a personalized, data-driven career development plan</p>
        </div>

        {/* Progress Indicator */}
        {currentStep <= 4 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`flex-1 h-1 mx-4 ${
                          step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Career Info</span>
                <span>Skills</span>
                <span>AI Analysis</span>
                <span>Generate</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderGeneratedRoadmap()}
        </div>

        {/* Navigation */}
        {currentStep <= 4 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={currentStep === 4}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRoadmapBuilder;
