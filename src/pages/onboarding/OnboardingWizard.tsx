import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface OnboardingData {
  role: string;
  experience: string;
  targetJob: string;
  skills: string[];
  location: string;
  salaryExpectation: string;
  industry: string;
  workPreference: string;
}

export const OnboardingWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    experience: '',
    targetJob: '',
    skills: [],
    location: '',
    salaryExpectation: '',
    industry: '',
    workPreference: ''
  });

  const flow = searchParams.get('flow') || 'resume';
  const userType = searchParams.get('type') || 'candidate';
  const totalSteps = userType === 'employer' ? 3 : 4;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const experiences = [
    '0-1 years', '1-3 years', '3-5 years', '5-8 years', '8-12 years', '12+ years'
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Real Estate', 'Government', 'Non-profit'
  ];

  const workPreferences = [
    'Remote', 'Hybrid', 'On-site', 'Flexible'
  ];

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
    'Project Management', 'Data Analysis', 'Digital Marketing', 'Sales',
    'Customer Service', 'Finance', 'HR', 'Design', 'Writing'
  ];

  const addSkill = (skill: string) => {
    if (!data.skills.includes(skill)) {
      setData({ ...data, skills: [...data.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setData({ ...data, skills: data.skills.filter(s => s !== skill) });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Create or update profile
      const profileData = {
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        title: data.role,
        location: data.location,
        experience_level: data.experience,
        industries: [data.industry],
        skills: data.skills,
        work_preference: data.workPreference,
        onboarding_completed: true,
        user_type: userType
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Track onboarding completion
      await supabase.from('user_journey_tracking').insert({
        user_id: user.id,
        event_type: 'onboarding_completed',
        event_module: 'onboarding',
        event_data: {
          flow,
          user_type: userType,
          steps_completed: totalSteps,
          completion_time: Date.now()
        }
      });

      toast.success('Welcome to TalentXcel! Your profile is ready.');

      // Navigate based on flow
      const redirectMap = {
        resume: '/resume/builder',
        jobs: '/jobs',
        interview: '/ai/interview-prep',
        insights: '/ai/career-hub',
        employer: '/employer/dashboard'
      };

      navigate(redirectMap[flow as keyof typeof redirectMap] || '/network');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepContent = () => {
    if (userType === 'employer') {
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Industry</label>
                <Select value={data.industry} onValueChange={(value) => setData({...data, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company Location</label>
                <Input
                  placeholder="e.g., Mumbai, India"
                  value={data.location}
                  onChange={(e) => setData({...data, location: e.target.value})}
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Primary Hiring Roles</label>
                <Input
                  placeholder="e.g., Software Engineer, Sales Manager"
                  value={data.targetJob}
                  onChange={(e) => setData({...data, targetJob: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Key Skills You're Looking For</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {popularSkills.slice(0, 12).map(skill => (
                    <Badge
                      key={skill}
                      variant={data.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => data.skills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Work Model Preference</label>
                <Select value={data.workPreference} onValueChange={(value) => setData({...data, workPreference: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {workPreferences.map(pref => (
                      <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">🎉 Almost Done!</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Complete Setup" to start posting jobs and finding talent.
                </p>
              </div>
            </div>
          );
      }
    } else {
      // Candidate flow
      switch (currentStep) {
        case 1:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Current Role/Title</label>
                <Input
                  placeholder="e.g., Software Engineer, Product Manager"
                  value={data.role}
                  onChange={(e) => setData({...data, role: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select value={data.experience} onValueChange={(value) => setData({...data, experience: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experiences.map(exp => (
                      <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        case 2:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Target Job Title</label>
                <Input
                  placeholder="What role are you looking for?"
                  value={data.targetJob}
                  onChange={(e) => setData({...data, targetJob: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <Select value={data.industry} onValueChange={(value) => setData({...data, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {popularSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant={data.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => data.skills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Click to add/remove skills</p>
              </div>
            </div>
          );
        case 4:
          return (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  placeholder="e.g., Mumbai, India"
                  value={data.location}
                  onChange={(e) => setData({...data, location: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Work Preference</label>
                <Select value={data.workPreference} onValueChange={(value) => setData({...data, workPreference: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {workPreferences.map(pref => (
                      <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">🎉 You're All Set!</h4>
                <p className="text-sm text-muted-foreground">
                  Complete setup to start {flow === 'resume' ? 'building your resume' : 
                  flow === 'jobs' ? 'applying to jobs' : 
                  flow === 'interview' ? 'practicing interviews' : 'exploring career insights'}.
                </p>
              </div>
            </div>
          );
      }
    }
  };

  const getStepTitle = () => {
    if (userType === 'employer') {
      const titles = ['Company Details', 'Hiring Needs', 'Setup Complete'];
      return titles[currentStep - 1];
    } else {
      const titles = ['Basic Info', 'Career Goals', 'Skills', 'Preferences'];
      return titles[currentStep - 1];
    }
  };

  const canProceed = () => {
    if (userType === 'employer') {
      switch (currentStep) {
        case 1: return data.industry && data.location;
        case 2: return data.targetJob && data.skills.length > 0;
        case 3: return data.workPreference;
        default: return true;
      }
    } else {
      switch (currentStep) {
        case 1: return data.role && data.experience;
        case 2: return data.targetJob && data.industry;
        case 3: return data.skills.length > 0;
        case 4: return data.location && data.workPreference;
        default: return true;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Quick Setup</h1>
              <span className="text-sm text-muted-foreground">
                {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStep === totalSteps && <CheckCircle className="h-5 w-5 text-green-500" />}
                {getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStepContent()}
              
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  onClick={nextStep}
                  disabled={!canProceed() || isLoading}
                >
                  {isLoading ? 'Setting up...' : 
                   currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
                  {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};