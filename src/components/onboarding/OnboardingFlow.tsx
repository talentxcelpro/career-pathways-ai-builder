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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card variant="glass" className="w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto shadow-elegant mx-2">
        <CardHeader className="text-center pb-3 px-4 pt-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 mx-auto mb-3 flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/92d46ee5-0b5a-4272-905d-72a40b1c8bdc.png" 
              alt="TalentXcel logo"
              className="w-7 h-7 rounded-lg object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/lovable-uploads/1a30569a-4f31-4bd4-abe8-79d630d989f9.png'; }}
            />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to TalentXcel!
          </CardTitle>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Let's get you started with your career journey
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{completedSteps} of {availableSteps.length} completed</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4">
          {availableSteps.map((step, index) => (
            <div
              key={step.id}
              className={`group relative rounded-lg p-2.5 transition-all duration-300 ${
                step.completed
                  ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 shadow-sm'
                  : index === currentStep
                  ? 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-md'
                  : 'bg-gradient-to-r from-muted/30 to-muted/10 border border-muted hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className={`relative flex-shrink-0 ${
                    step.completed 
                      ? 'text-emerald-500' 
                      : index === currentStep 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${
                        index === currentStep ? 'border-primary bg-primary/20' : 'border-current'
                      }`} />
                    )}
                    {step.tier !== 'free' && (
                      <div className="absolute -top-0.5 -right-0.5">
                        {getTierIcon(step.tier)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-xs sm:text-sm text-foreground truncate">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleStepAction(step)}
                  disabled={step.completed}
                  variant={step.completed ? "ghost" : index === currentStep ? "default" : "outline"}
                  size="sm"
                  className={`ml-2 flex-shrink-0 text-xs h-7 px-2 ${
                    step.completed 
                      ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' 
                      : index === currentStep 
                      ? 'shadow-sm' 
                      : ''
                  }`}
                >
                  {step.completed ? 'Done' : step.action.split(' ')[0]}
                  {!step.completed && <ArrowRight className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex gap-2 pt-3 border-t border-muted/50">
            <Button 
              variant="outline" 
              onClick={handleSkipOnboarding}
              className="flex-1 text-xs h-8"
              size="sm"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleCompleteOnboarding}
              disabled={completedSteps < availableSteps.length}
              className="flex-1 text-xs shadow-sm h-8"
              size="sm"
            >
              {completedSteps === availableSteps.length ? 'Finish' : 'Complete All'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};