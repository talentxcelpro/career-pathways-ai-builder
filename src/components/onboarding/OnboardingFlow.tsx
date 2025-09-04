import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, Star, Crown, Zap } from 'lucide-react';
import { useTieredAccess } from '@/hooks/useTieredAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  route: string;
  completed: boolean;
  tier: 'free' | 'pro' | 'enterprise';
}

export const OnboardingFlow: React.FC = () => {
  const { user } = useAuth();
  const { currentTier } = useTieredAccess();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your professional information to get personalized recommendations',
      action: 'Complete Profile',
      route: '/profile',
      completed: false,
      tier: 'free'
    },
    {
      id: 'resume',
      title: 'Build Your Resume',
      description: 'Create a professional resume with our AI-powered builder',
      action: 'Build Resume',
      route: '/resume-builder',
      completed: false,
      tier: 'free'
    },
    {
      id: 'network',
      title: 'Connect & Network',
      description: 'Start building your professional network',
      action: 'Explore Network',
      route: '/network',
      completed: false,
      tier: 'free'
    },
    {
      id: 'jobs',
      title: 'Discover Jobs',
      description: 'Find opportunities that match your skills and interests',
      action: 'Browse Jobs',
      route: '/jobs',
      completed: false,
      tier: 'free'
    },
    {
      id: 'tools',
      title: 'Explore Career Tools',
      description: 'Access AI-powered career enhancement tools',
      action: 'Try Tools',
      route: '/tools',
      completed: false,
      tier: 'pro'
    },
    {
      id: 'learning',
      title: 'Start Learning',
      description: 'Enhance your skills with curated learning paths',
      action: 'Browse Courses',
      route: '/learning',
      completed: false,
      tier: 'free'
    }
  ]);

  useEffect(() => {
    // Check if user is new and should see onboarding
    const hasSeenOnboarding = localStorage.getItem(`onboarding_completed_${user?.id}`);
    if (user && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleStepAction = (step: OnboardingStep) => {
    // Mark step as completed
    setSteps(prev => prev.map(s => 
      s.id === step.id ? { ...s, completed: true } : s
    ));

    // Navigate to the step's route
    navigate(step.route);
    
    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');
    setShowOnboarding(false);
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');
    setShowOnboarding(false);
  };

  const getStepsByTier = () => {
    return steps.filter(step => {
      if (step.tier === 'free') return true;
      if (step.tier === 'pro' && ['pro', 'enterprise'].includes(currentTier)) return true;
      if (step.tier === 'enterprise' && currentTier === 'enterprise') return true;
      return false;
    });
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'enterprise':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!showOnboarding || !user) {
    return null;
  }

  const availableSteps = getStepsByTier();
  const completedSteps = availableSteps.filter(step => step.completed).length;
  const progress = (completedSteps / availableSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to TalentXcel!</CardTitle>
          <p className="text-muted-foreground">
            Let's get you started with your career journey
          </p>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground">
            {completedSteps} of {availableSteps.length} steps completed
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {availableSteps.map((step, index) => (
            <div
              key={step.id}
              className={`border rounded-lg p-4 transition-all ${
                index === currentStep
                  ? 'border-primary bg-primary/5'
                  : step.completed
                  ? 'border-green-500 bg-green-50'
                  : 'border-muted'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{step.title}</h3>
                      {getTierIcon(step.tier)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleStepAction(step)}
                  disabled={step.completed}
                  variant={index === currentStep ? 'default' : 'outline'}
                  size="sm"
                >
                  {step.completed ? 'Completed' : step.action}
                  {!step.completed && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handleSkipOnboarding}>
              Skip for now
            </Button>
            <Button 
              onClick={handleCompleteOnboarding}
              disabled={completedSteps < availableSteps.length}
            >
              Complete Onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};