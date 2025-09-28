import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase,
  Users,
  PlayCircle,
  BookOpen,
  Trophy,
  Gift,
  ChevronRight,
  ChevronLeft,
  Star,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface OnboardingModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  benefits: string[];
  color: string;
  bgColor: string;
}

interface ModuleOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ModuleOnboarding: React.FC<ModuleOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const modules: OnboardingModule[] = [
    {
      id: 'jobs',
      name: 'Job Search',
      description: 'Find your dream job with AI-powered matching and personalized recommendations.',
      icon: <Briefcase className="w-8 h-8" />,
      route: '/jobs',
      benefits: ['AI job matching', 'Salary insights', 'One-click applications', 'Company reviews'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'network',
      name: 'Professional Network',
      description: 'Build meaningful connections with industry professionals and grow your network.',
      icon: <Users className="w-8 h-8" />,
      route: '/network',
      benefits: ['Smart connections', 'Industry groups', 'Professional messaging', 'Networking events'],
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'learning',
      name: 'Learning Hub',
      description: 'Upskill with 500+ courses and earn industry-recognized certifications.',
      icon: <BookOpen className="w-8 h-8" />,
      route: '/learning',
      benefits: ['500+ courses', 'Industry certifications', 'Progress tracking', 'AI recommendations'],
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'reels',
      name: 'Career Reels',
      description: 'Discover career tips and success stories through engaging short-form content.',
      icon: <PlayCircle className="w-8 h-8" />,
      route: '/mobile/reels',
      benefits: ['Career tips', 'Success stories', 'Industry insights', 'Video creation tools'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'rewards',
      name: 'Rewards System',
      description: 'Earn points, badges, and TXC tokens for every career action you take.',
      icon: <Trophy className="w-8 h-8" />,
      route: '/gamification',
      benefits: ['Points for actions', 'Achievement badges', 'TXC tokens', 'Leaderboards'],
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'refer',
      name: 'Refer & Earn',
      description: 'Invite friends and earn cash rewards while helping others advance their careers.',
      icon: <Gift className="w-8 h-8" />,
      route: '/refer-and-earn',
      benefits: ['Cash rewards', 'Bonus points', 'Tracking dashboard', 'Social sharing'],
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  const currentModule = modules[currentStep];
  const progress = ((currentStep + 1) / modules.length) * 100;

  const handleNext = () => {
    if (currentStep < modules.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-primary" />
                Welcome to TalentXcel
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tour
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Step {currentStep + 1} of {modules.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className={`h-2 ${currentModule.bgColor.replace('bg-', 'bg-gradient-to-r from-')}-400 to-${currentModule.bgColor.split('-')[1]}-600`} />
              
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${currentModule.bgColor}`}>
                  <div className={currentModule.color}>
                    {currentModule.icon}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {currentModule.name}
                </h2>
                
                <p className="text-gray-600 mb-6 text-lg">
                  {currentModule.description}
                </p>

                <div className="space-y-3 mb-8">
                  <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Key Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentModule.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20"
                >
                  {currentStep === 0 && "Start your journey"}
                  {currentStep === 1 && "Build connections"}
                  {currentStep === 2 && "Learn & grow"}
                  {currentStep === 3 && "Share your story"}
                  {currentStep === 4 && "Get rewarded"}
                  {currentStep === 5 && "Invite friends"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="p-6 pt-0 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {modules.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentStep
                      ? 'bg-primary w-8'
                      : index < currentStep
                      ? 'bg-primary/60'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {currentStep === modules.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};