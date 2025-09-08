import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Calendar,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  Award,
  Users,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RoadmapPhase {
  phase: string;
  objectives: string[];
  skills_to_develop: string[];
  actions: string[];
  resources: string[];
  milestones: string[];
}

interface CareerRoadmap {
  overview: string;
  timeline: string;
  phases: RoadmapPhase[];
  skill_gaps: string[];
  certifications: string[];
  networking_strategy: string[];
  market_insights: {
    demand: string;
    growth_rate: string;
    avg_salary: string;
    key_trends: string[];
  };
  success_metrics: string[];
}

const CareerRoadmapGenerator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    experienceLevel: '',
    industry: '',
    skills: '',
    timeline: '',
    challenges: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRoadmap = async () => {
    if (!formData.currentRole || !formData.targetRole || !formData.industry) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('career-strategist', {
        body: {
          action: 'generate_roadmap',
          userProfile: {
            currentRole: formData.currentRole,
            experienceLevel: formData.experienceLevel,
            challenges: formData.challenges
          },
          targetRole: formData.targetRole,
          currentSkills: formData.skills.split(',').map(s => s.trim()),
          industryFocus: formData.industry
        }
      });

      if (error) throw error;

      if (data.success) {
        setRoadmap(data.data.roadmap);
        setStep(2);
        toast.success('Career roadmap generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Form Input
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Career Roadmap Generator</h2>
            <p className="text-muted-foreground">Create your personalized career development plan</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tell us about your career goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Role *</label>
                <Input
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target Role *</label>
                <Input
                  value={formData.targetRole}
                  onChange={(e) => handleInputChange('targetRole', e.target.value)}
                  placeholder="e.g., Senior Engineering Manager"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                    <SelectItem value="executive">Executive Level (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Industry *</label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Current Skills</label>
              <Input
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                placeholder="e.g., Python, React, Project Management (comma-separated)"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Timeline</label>
              <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="2years">2 years</SelectItem>
                  <SelectItem value="3years">3+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Current Challenges</label>
              <Textarea
                value={formData.challenges}
                onChange={(e) => handleInputChange('challenges', e.target.value)}
                placeholder="What obstacles are you facing in your career progression?"
                rows={3}
              />
            </div>

            <Button 
              onClick={generateRoadmap}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Generate Career Roadmap
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Generated Roadmap
  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Your Career Roadmap</h2>
            <p className="text-muted-foreground">{formData.currentRole} → {formData.targetRole}</p>
          </div>
        </div>
        <Button onClick={() => setStep(1)} variant="outline">
          Generate New Roadmap
        </Button>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Roadmap Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{roadmap.timeline}</div>
              <div className="text-sm text-muted-foreground">Timeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{roadmap.phases.length}</div>
              <div className="text-sm text-muted-foreground">Phases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">{roadmap.skill_gaps.length}</div>
              <div className="text-sm text-muted-foreground">Skills to Develop</div>
            </div>
          </div>
          <p className="text-muted-foreground">{roadmap.overview}</p>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Market Demand</div>
              <Badge variant={roadmap.market_insights.demand === 'High' ? 'default' : 'secondary'}>
                {roadmap.market_insights.demand}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Growth Rate</div>
              <div className="font-semibold">{roadmap.market_insights.growth_rate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Salary Range</div>
              <div className="font-semibold">{roadmap.market_insights.avg_salary}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2">Key Trends</div>
            <div className="flex flex-wrap gap-2">
              {roadmap.market_insights.key_trends.map((trend, index) => (
                <Badge key={index} variant="outline">{trend}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Phases */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Roadmap Phases</h3>
        {roadmap.phases.map((phase, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                {phase.phase}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Objectives
                  </h4>
                  <ul className="text-sm space-y-1">
                    {phase.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Skills
                  </h4>
                  <ul className="text-sm space-y-1">
                    {phase.skills_to_develop.map((skill, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Lightbulb className="h-3 w-3 mt-1 text-yellow-500 flex-shrink-0" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Actions
                  </h4>
                  <ul className="text-sm space-y-1">
                    {phase.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Clock className="h-3 w-3 mt-1 text-blue-500 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Resources
                  </h4>
                  <ul className="text-sm space-y-1">
                    {phase.resources.map((resource, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Award className="h-3 w-3 mt-1 text-purple-500 flex-shrink-0" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recommended Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roadmap.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2">
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Networking Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {roadmap.networking_strategy.map((strategy, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm">{strategy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerRoadmapGenerator;