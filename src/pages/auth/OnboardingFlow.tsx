import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BasicInfoStep } from '@/components/onboarding/BasicInfoStep';
import { ProfessionalIdentityStep } from '@/components/onboarding/ProfessionalIdentityStep';
import { GoalsStep } from '@/components/onboarding/GoalsStep';
import { DocumentsStep } from '@/components/onboarding/DocumentsStep';
import { PreferencesStep } from '@/components/onboarding/PreferencesStep';
import { WelcomeDashboard } from '@/components/onboarding/WelcomeDashboard';

interface OnboardingData {
  // Step 1: Basic Info
  fullName: string;
  age: number | null;
  location: string;
  phone: string;
  
  // Step 2: Professional Identity
  currentRole: string;
  experience: string;
  industry: string;
  
  // Step 3: Goals
  goals: string[];
  
  // Step 4: Documents
  resumeUrl: string | null;
  
  // Step 5: Preferences
  jobLocations: string[];
  skills: string[];
  careerInterests: string[];
}

const TOTAL_STEPS = 6;

export const OnboardingFlow: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const userType = searchParams.get('type') || 'candidate';
  const flow = searchParams.get('flow') || 'resume';
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fullName: '',
    age: null,
    location: '',
    phone: '',
    currentRole: '',
    experience: '',
    industry: '',
    goals: [],
    resumeUrl: null,
    jobLocations: [],
    skills: [],
    careerInterests: []
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=signup');
    }
  }, [user, loading, navigate]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: onboardingData.fullName,
          location: onboardingData.location,
          phone: onboardingData.phone,
          title: onboardingData.currentRole,
          about: `${onboardingData.experience} experience in ${onboardingData.industry}`,
          headline: onboardingData.currentRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create career passport entry
      const { error: passportError } = await supabase
        .from('career_passport')
        .upsert({
          user_id: user.id,
          career_goals: onboardingData.goals,
          skills: onboardingData.skills,
          industries_of_interest: [onboardingData.industry],
          job_preferences: {
            locations: onboardingData.jobLocations,
            interests: onboardingData.careerInterests
          },
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (passportError) throw passportError;

      toast.success('Onboarding completed successfully!');
      
      // Redirect based on flow
      const redirectMap: Record<string, string> = {
        'resume': '/resume/builder',
        'jobs': '/jobs',
        'interview': '/resume/interview-prep',
        'insights': '/resume/career-intelligence',
        'employer': '/resume/company-tools'
      };
      
      navigate(redirectMap[flow] || '/network');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </h2>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Let's start with the basics"}
              {currentStep === 2 && "Tell us about your professional identity"}
              {currentStep === 3 && "What are your goals?"}
              {currentStep === 4 && "Upload your documents"}
              {currentStep === 5 && "Set your preferences"}
              {currentStep === 6 && "Welcome to TalentXcel!"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "We'll use this to personalize your experience"}
              {currentStep === 2 && "Help us understand your professional background"}
              {currentStep === 3 && "We'll tailor recommendations based on your objectives"}
              {currentStep === 4 && "Upload your resume to get AI-powered insights (optional)"}
              {currentStep === 5 && "Customize your job search preferences"}
              {currentStep === 6 && "Your personalized dashboard is ready"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step Components */}
            {currentStep === 1 && (
              <BasicInfoStep data={onboardingData} updateData={updateData} />
            )}
            
            {currentStep === 2 && (
              <ProfessionalIdentityStep data={onboardingData} updateData={updateData} />
            )}
            
            {currentStep === 3 && (
              <GoalsStep data={onboardingData} updateData={updateData} userType={userType} />
            )}
            
            {currentStep === 4 && (
              <DocumentsStep data={onboardingData} updateData={updateData} />
            )}
            
            {currentStep === 5 && (
              <PreferencesStep data={onboardingData} updateData={updateData} />
            )}
            
            {currentStep === 6 && (
              <WelcomeDashboard data={onboardingData} flow={flow} />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : currentStep === TOTAL_STEPS ? 'Get Started' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
