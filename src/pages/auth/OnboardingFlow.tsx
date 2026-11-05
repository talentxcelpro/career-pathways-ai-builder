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

  // 1. STATE 2: PROFILE PROVISIONED (Idempotent initial profile provisioning on mount)
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=signup');
      return;
    }

    if (user?.id) {
      const initName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       (user.email ? user.email.split('@')[0] : '');

      const emailBase = (user.email ? user.email.split('@')[0] : 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      const fallbackUsername = `${emailBase}_${user.id.slice(0, 6)}`;

      // Fetch existing profile to populate form (resume onboarding) and preserve valid fields
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data: existingProfile }) => {
          if (existingProfile) {
            setOnboardingData(prev => ({
              ...prev,
              fullName: existingProfile.full_name || prev.fullName || initName,
              location: existingProfile.location || prev.location,
              phone: existingProfile.phone || prev.phone,
              currentRole: existingProfile.title || prev.currentRole,
              resumeUrl: existingProfile.resume_url || prev.resumeUrl,
              skills: existingProfile.skills?.length ? existingProfile.skills : prev.skills,
              jobLocations: existingProfile.preferred_locations?.length ? existingProfile.preferred_locations : prev.jobLocations,
              goals: existingProfile.career_goals?.length ? existingProfile.career_goals : prev.goals
            }));
          } else {
            // Provision empty operational profile without overwriting
            supabase.from('profiles').upsert({
              id: user.id,
              username: fallbackUsername,
              full_name: initName || 'TalentXcel Member',
              email: user.email || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              profile_completed: false,
              onboarding_completed: false,
              verification_status: 'unverified'
            }, { onConflict: 'id', ignoreDuplicates: true }).catch(err => {
              console.warn('Initial profile provisioning notice:', err);
            });
          }
        });
    }
  }, [user, loading, navigate]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  // 2. PROGRESSIVE STEP PERSISTENCE: Never overwrite valid fields with blanks or nulls
  const persistProgressiveStep = async (step: number) => {
    if (!user?.id) return;
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const payload: Record<string, any> = {
        id: user.id,
        updated_at: new Date().toISOString()
      };

      if (step === 1) {
        if (onboardingData.fullName?.trim()) payload.full_name = onboardingData.fullName.trim();
        else if (existing?.full_name) payload.full_name = existing.full_name;

        if (onboardingData.location?.trim()) payload.location = onboardingData.location.trim();
        else if (existing?.location) payload.location = existing.location;

        if (onboardingData.phone?.trim()) payload.phone = onboardingData.phone.trim();
        else if (existing?.phone) payload.phone = existing.phone;
      } else if (step === 2) {
        if (onboardingData.currentRole?.trim()) {
          payload.title = onboardingData.currentRole.trim();
          payload.headline = onboardingData.currentRole.trim();
        } else {
          if (existing?.title) payload.title = existing.title;
          if (existing?.headline) payload.headline = existing.headline;
        }

        if (onboardingData.experience?.trim() || onboardingData.industry?.trim()) {
          payload.about = `${onboardingData.experience || ''} ${onboardingData.industry ? `in ${onboardingData.industry}` : ''}`.trim();
        } else if (existing?.about) {
          payload.about = existing.about;
        }
      } else if (step === 3) {
        if (onboardingData.goals?.length) payload.career_goals = onboardingData.goals;
        else if (existing?.career_goals?.length) payload.career_goals = existing.career_goals;
      } else if (step === 4) {
        if (onboardingData.resumeUrl?.trim()) payload.resume_url = onboardingData.resumeUrl.trim();
        else if (existing?.resume_url) payload.resume_url = existing.resume_url;
      } else if (step === 5) {
        if (onboardingData.skills?.length) payload.skills = onboardingData.skills;
        else if (existing?.skills?.length) payload.skills = existing.skills;

        if (onboardingData.jobLocations?.length) payload.preferred_locations = onboardingData.jobLocations;
        else if (existing?.preferred_locations?.length) payload.preferred_locations = existing.preferred_locations;
      }

      await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.warn('Progressive step persistence warning:', err);
    }
  };

  const handleNext = async () => {
    await persistProgressiveStep(currentStep);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      await completeOnboarding();
    }
  };

  // 3. SKIP & FINISH LATER: Preserves profile_provisioned state; strictly does NOT set onboarding_completed or profile_activated!
  const handleSkipToDestination = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const emailBase = (user.email ? user.email.split('@')[0] : 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      const fallbackUsername = `${emailBase}_${user.id.slice(0, 6)}`;

      const payload: Record<string, any> = {
        id: user.id,
        email: user.email || existing?.email || null,
        full_name: onboardingData.fullName?.trim() || existing?.full_name || user.user_metadata?.full_name || 'TalentXcel Member',
        username: existing?.username || fallbackUsername,
        title: onboardingData.currentRole?.trim() || existing?.title || 'Professional',
        headline: onboardingData.currentRole?.trim() || existing?.headline || 'Professional',
        // STRICT INVARIANT: Skip must NOT mark onboarding_completed or profile_completed
        onboarding_completed: false,
        profile_completed: false,
        preferences: {
          ...(existing?.preferences || {}),
          onboarding_deferred: true,
          deferred_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      };

      if (onboardingData.location?.trim()) payload.location = onboardingData.location.trim();
      else if (existing?.location) payload.location = existing.location;

      if (onboardingData.phone?.trim()) payload.phone = onboardingData.phone.trim();
      else if (existing?.phone) payload.phone = existing.phone;

      if (existing?.about) payload.about = existing.about;

      await supabase.from('profiles').upsert(payload, { onConflict: 'id' });

      toast.info('Onboarding deferred. You can complete your profile anytime from your settings.');

      const redirectMap: Record<string, string> = {
        'resume': '/resume/builder',
        'jobs': '/jobs',
        'interview': '/resume/interview-prep',
        'insights': '/resume/career-intelligence',
        'employer': '/resume/company-tools',
        'ats_scanner': '/resume/ats-check'
      };

      navigate(redirectMap[flow] || '/career-dashboard');
    } catch (err) {
      console.warn('Skip onboarding error:', err);
      navigate('/career-dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 4. STATE 3: ONBOARDING COMPLETED (User explicitly finishes wizard)
  const completeOnboarding = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const emailBase = (user.email ? user.email.split('@')[0] : 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      const fallbackUsername = `${emailBase}_${user.id.slice(0, 6)}`;

      const payload: Record<string, any> = {
        id: user.id,
        email: user.email || existing?.email || null,
        full_name: onboardingData.fullName?.trim() || existing?.full_name || user.user_metadata?.full_name || 'TalentXcel Member',
        username: existing?.username || fallbackUsername,
        title: onboardingData.currentRole?.trim() || existing?.title || 'Professional',
        headline: onboardingData.currentRole?.trim() || existing?.headline || 'Professional',
        about: (onboardingData.experience?.trim() || onboardingData.industry?.trim())
          ? `${onboardingData.experience || ''} experience in ${onboardingData.industry || 'Tech'}`.trim()
          : (existing?.about || 'Professional'),
        profile_completed: true,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      if (onboardingData.location?.trim()) payload.location = onboardingData.location.trim();
      else if (existing?.location) payload.location = existing.location;

      if (onboardingData.phone?.trim()) payload.phone = onboardingData.phone.trim();
      else if (existing?.phone) payload.phone = existing.phone;

      if (onboardingData.resumeUrl?.trim()) payload.resume_url = onboardingData.resumeUrl.trim();
      else if (existing?.resume_url) payload.resume_url = existing.resume_url;

      if (onboardingData.skills?.length) payload.skills = onboardingData.skills;
      else if (existing?.skills?.length) payload.skills = existing.skills;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Create or update career passport entry safely
      try {
        await supabase
          .from("career_passports")
          .upsert({
            user_id: user.id,
            career_goals: onboardingData.goals?.length ? onboardingData.goals : (existing?.career_goals || []),
            parsed_skills: onboardingData.skills?.length ? onboardingData.skills : (existing?.skills || []),
            industry_preferences: [onboardingData.industry].filter(Boolean),
            preferred_locations: onboardingData.jobLocations?.length ? onboardingData.jobLocations : [],
            updated_at: new Date().toISOString()
          }, {
            onConflict: "user_id"
          });
      } catch (passportErr) {
        console.warn("Career passport initialization deferred:", passportErr);
      }

      toast.success('Onboarding completed successfully!');
      
      const redirectMap: Record<string, string> = {
        'resume': '/resume/builder',
        'jobs': '/jobs',
        'interview': '/resume/interview-prep',
        'insights': '/resume/career-intelligence',
        'employer': '/resume/company-tools',
        'ats_scanner': '/resume/ats-check'
      };
      
      navigate(redirectMap[flow] || '/career-dashboard');
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
              {currentStep === 4 && "Upload your resume to get SI-powered insights (optional)"}
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
            <div className="flex items-center justify-between mt-8 pt-6 border-t gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                Back
              </Button>

              <div className="flex items-center gap-2">
                {currentStep > 1 && currentStep < TOTAL_STEPS && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkipToDestination}
                    disabled={isSubmitting}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Skip & Finish Later
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : currentStep === TOTAL_STEPS ? 'Get Started' : 'Continue'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
