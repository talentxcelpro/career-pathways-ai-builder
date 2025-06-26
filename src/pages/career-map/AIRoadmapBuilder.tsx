
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  Award,
  BookOpen
} from 'lucide-react';

interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

const AIRoadmapBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    currentPosition: '',
    targetRole: '',
    targetCompany: '',
    timeline: '24',
    currentSkills: [] as string[],
    targetIndustry: '',
    experienceLevel: '',
    preferredLearningStyle: '',
    availableTimePerWeek: '5'
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps: RoadmapStep[] = [
    { step: 1, title: 'Current Position', description: 'Tell us about your current role', isCompleted: currentStep > 1 },
    { step: 2, title: 'Target Role', description: 'Define your career goal', isCompleted: currentStep > 2 },
    { step: 3, title: 'Skills & Preferences', description: 'Your skills and learning style', isCompleted: currentStep > 3 },
    { step: 4, title: 'AI Generation', description: 'Generate your personalized roadmap', isCompleted: currentStep > 4 },
    { step: 5, title: 'Review & Save', description: 'Review and customize your roadmap', isCompleted: false }
  ];

  const addSkill = () => {
    if (currentSkill.trim() && !formData.currentSkills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        currentSkills: [...prev.currentSkills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      currentSkills: prev.currentSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const generateAIRoadmap = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation with mock data
      const mockRoadmap = {
        title: `${formData.currentPosition} to ${formData.targetRole} Roadmap`,
        description: `A personalized ${formData.timeline}-month journey from ${formData.currentPosition} to ${formData.targetRole}`,
        milestones: [
          {
            title: 'Foundation Building (Months 1-3)',
            description: 'Build core skills and knowledge base',
            type: 'skill',
            priority: 1,
            resources: ['Online courses', 'Documentation', 'Practice projects']
          },
          {
            title: 'Practical Experience (Months 4-8)',
            description: 'Apply skills through projects and real-world experience',
            type: 'project',
            priority: 1,
            resources: ['Side projects', 'Open source contributions', 'Internships']
          },
          {
            title: 'Specialization (Months 9-12)',
            description: 'Focus on specialized skills for target role',
            type: 'certification',
            priority: 2,
            resources: ['Advanced courses', 'Certifications', 'Mentorship']
          },
          {
            title: 'Job Preparation (Months 13-18)',
            description: 'Prepare for job applications and interviews',
            type: 'experience',
            priority: 1,
            resources: ['Portfolio building', 'Interview prep', 'Networking']
          }
        ],
        requiredSkills: [
          'React.js', 'Node.js', 'TypeScript', 'Database Design', 'System Architecture',
          'Problem Solving', 'Communication', 'Team Leadership'
        ],
        estimatedOutcome: {
          salaryIncrease: '30-50%',
          marketDemand: 'High',
          successProbability: '85%'
        }
      };

      setGeneratedRoadmap(mockRoadmap);
      setCurrentStep(5);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate roadmap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRoadmap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const roadmapData = {
        user_id: user.id,
        title: generatedRoadmap.title,
        description: generatedRoadmap.description,
        current_position: formData.currentPosition,
        target_role: formData.targetRole,
        target_company: formData.targetCompany || null,
        timeline_months: parseInt(formData.timeline),
        ai_generated: true,
        skills_current: formData.currentSkills,
        skills_target: generatedRoadmap.requiredSkills,
        roadmap_data: {
          formData,
          generatedRoadmap,
          createdAt: new Date().toISOString()
        }
      };

      const { data: roadmap, error } = await supabase
        .from('roadmaps')
        .insert(roadmapData)
        .select()
        .single();

      if (error) throw error;

      // Create milestones
      const milestones = generatedRoadmap.milestones.map((milestone: any, index: number) => ({
        roadmap_id: roadmap.id,
        title: milestone.title,
        description: milestone.description,
        milestone_type: milestone.type,
        priority: milestone.priority,
        resources: milestone.resources,
        target_date: new Date(Date.now() + (index + 1) * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3-month intervals
      }));

      const { error: milestonesError } = await supabase
        .from('roadmap_milestones')
        .insert(milestones);

      if (milestonesError) throw milestonesError;

      toast({
        title: "Success!",
        description: "Your AI-generated roadmap has been saved successfully.",
      });

      navigate(`/career-map/${roadmap.id}`);
    } catch (error) {
      console.error('Error saving roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to save roadmap. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Brain className="h-8 w-8 text-blue-600 mr-3" />
            AI Roadmap Builder
          </h1>
          <p className="text-gray-600">Create a personalized career roadmap with AI guidance</p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step.step === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : step.isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.isCompleted ? <CheckCircle className="h-4 w-4" /> : step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step.isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{steps[currentStep - 1].title}</h3>
              <p className="text-gray-600 text-sm">{steps[currentStep - 1].description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Tell us about your current position</h2>
                  <p className="text-gray-600">Help us understand where you're starting from</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPosition">Current Job Title</Label>
                    <Input
                      id="currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPosition: e.target.value }))}
                      placeholder="e.g., Junior Developer, Marketing Coordinator"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                        <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Define your career goal</h2>
                  <p className="text-gray-600">Where do you want to be in your career?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetRole">Target Job Title</Label>
                    <Input
                      id="targetRole"
                      value={formData.targetRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                      placeholder="e.g., Senior Developer, Product Manager"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="targetCompany">Target Company (Optional)</Label>
                    <Input
                      id="targetCompany"
                      value={formData.targetCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCompany: e.target.value }))}
                      placeholder="e.g., Google, Microsoft, or leave blank"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="targetIndustry">Target Industry</Label>
                    <Select value={formData.targetIndustry} onValueChange={(value) => setFormData(prev => ({ ...prev, targetIndustry: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select target industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timeline">Timeline (Months)</Label>
                    <Select value={formData.timeline} onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="How long do you want this to take?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Skills & Learning Preferences</h2>
                  <p className="text-gray-600">Help us personalize your learning path</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Current Skills</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={currentSkill}
                          onChange={(e) => setCurrentSkill(e.target.value)}
                          placeholder="Add a skill and press Enter"
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill} type="button">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.currentSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="learningStyle">Preferred Learning Style</Label>
                    <Select value={formData.preferredLearningStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLearningStyle: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="How do you learn best?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">Visual (videos, diagrams)</SelectItem>
                        <SelectItem value="reading">Reading (books, articles)</SelectItem>
                        <SelectItem value="hands-on">Hands-on (projects, practice)</SelectItem>
                        <SelectItem value="interactive">Interactive (courses, mentoring)</SelectItem>
                        <SelectItem value="mixed">Mixed approach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timePerWeek">Available Time Per Week (Hours)</Label>
                    <Select value={formData.availableTimePerWeek} onValueChange={(value) => setFormData(prev => ({ ...prev, availableTimePerWeek: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="How much time can you dedicate?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2-3 hours</SelectItem>
                        <SelectItem value="5">5-7 hours</SelectItem>
                        <SelectItem value="10">10-15 hours</SelectItem>
                        <SelectItem value="20">20+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Sparkles className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Generate Your AI Roadmap</h2>
                  <p className="text-gray-600">Our AI will create a personalized career roadmap for you</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Roadmap Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-medium">{formData.currentPosition}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-medium">{formData.targetRole}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="font-medium">{formData.timeline} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Skills</p>
                      <p className="font-medium">{formData.currentSkills.length} current skills</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={generateAIRoadmap} 
                    disabled={isGenerating}
                    className="px-8 py-3 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Roadmap...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Generate AI Roadmap
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 5 && generatedRoadmap && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Your Personalized Roadmap</h2>
                  <p className="text-gray-600">Review and save your AI-generated career plan</p>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{generatedRoadmap.title}</CardTitle>
                      <CardDescription>{generatedRoadmap.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{generatedRoadmap.estimatedOutcome.salaryIncrease}</p>
                          <p className="text-sm text-gray-600">Salary Increase</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{generatedRoadmap.estimatedOutcome.successProbability}</p>
                          <p className="text-sm text-gray-600">Success Rate</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{generatedRoadmap.estimatedOutcome.marketDemand}</p>
                          <p className="text-sm text-gray-600">Market Demand</p>
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold">Roadmap Milestones</h4>
                        {generatedRoadmap.milestones.map((milestone: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h5 className="font-medium text-lg">{milestone.title}</h5>
                            <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {milestone.resources.map((resource: string, resourceIndex: number) => (
                                <Badge key={resourceIndex} variant="outline" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div>
                        <h4 className="font-semibold mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedRoadmap.requiredSkills.map((skill: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="text-center">
                    <Button onClick={saveRoadmap} className="px-8 py-3 text-lg">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Save My Roadmap
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 && (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.currentPosition || !formData.experienceLevel)) ||
                    (currentStep === 2 && (!formData.targetRole || !formData.targetIndustry || !formData.timeline)) ||
                    (currentStep === 3 && (!formData.preferredLearningStyle || !formData.availableTimePerWeek))
                  }
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIRoadmapBuilder;
