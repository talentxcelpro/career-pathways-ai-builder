import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { 
  Sparkles, 
  Gift, 
  Target, 
  Users, 
  Briefcase, 
  Star,
  ArrowRight,
  CheckCircle,
  Coins
} from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';
import careerMascot from '@/assets/career-mascot.jpg';

interface WelcomeExperienceProps {
  onComplete?: () => void;
}

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { balance } = useTokenBalance();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Check if user is new (created in last 24 hours)
  const isNewUser = user && new Date(user.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  useEffect(() => {
    // Auto-advance steps
    if (currentStep < 2) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible || !isNewUser) return null;

  const steps = [
    {
      title: "Welcome to TalentXcel! 🎉",
      subtitle: "Your AI-Powered Career Journey Starts Here",
      content: (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
            <img 
              src={careerMascot} 
              alt="TalentXcel Mascot" 
              className="relative w-32 h-32 mx-auto rounded-full object-cover border-4 border-background shadow-xl"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Meet Your Career Assistant!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              I'm here to help you unlock career opportunities, earn TXC tokens, and build meaningful connections in your professional journey.
            </p>
            <div className="flex items-center justify-center gap-2 text-secondary font-semibold">
              <Gift className="h-5 w-5" />
              <span>500 TXC Welcome Bonus Awarded!</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Start Earning TXC Tokens",
      subtitle: "Complete activities to build your career and earn rewards",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="group hover-scale">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Apply to Jobs</h4>
              <p className="text-sm text-muted-foreground mb-3">Earn 90 TXC per application</p>
              <Badge variant="outline">90 TXC</Badge>
            </CardContent>
          </Card>
          
          <Card className="group hover-scale">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h4 className="font-semibold mb-2">Network & Connect</h4>
              <p className="text-sm text-muted-foreground mb-3">Earn 75 TXC per connection</p>
              <Badge variant="outline">75 TXC</Badge>
            </CardContent>
          </Card>
          
          <Card className="group hover-scale">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl w-fit mx-auto mb-4">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-2">Complete Profile</h4>
              <p className="text-sm text-muted-foreground mb-3">Earn 300 TXC for completion</p>
              <Badge variant="outline">300 TXC</Badge>
            </CardContent>
          </Card>
          
          <Card className="group hover-scale">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gradient-to-br from-primary/15 via-secondary/15 to-accent/15 rounded-xl w-fit mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Refer Friends</h4>
              <p className="text-sm text-muted-foreground mb-3">Earn 1,000 TXC per referral</p>
              <Badge variant="outline">1,000 TXC</Badge>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Your Career Dashboard Awaits",
      subtitle: "Everything you need to accelerate your career growth",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl w-fit mx-auto">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-bold">AI-Powered Tools</h4>
              <p className="text-sm text-muted-foreground">Resume builder, job matching, and career insights</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl w-fit mx-auto">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="font-bold">Professional Network</h4>
              <p className="text-sm text-muted-foreground">Connect with industry professionals and mentors</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl w-fit mx-auto">
                <Coins className="h-8 w-8 text-accent" />
              </div>
              <h4 className="font-bold">Token Economy</h4>
              <p className="text-sm text-muted-foreground">Earn TXC tokens and unlock premium features</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl"></div>
            <div className="relative p-6 bg-background/30 backdrop-blur-sm rounded-xl border border-border/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg font-bold">You're all set!</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Start exploring your dashboard and complete your first tasks to earn more TXC tokens.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{formatTXC(balance?.available || 500)}</div>
                  <div className="text-sm text-muted-foreground">Current Balance</div>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-sm text-muted-foreground">Potential Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {steps[currentStep].title}
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            {steps[currentStep].subtitle}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="animate-fade-in">
            {steps[currentStep].content}
          </div>
          
          <div className="flex justify-center gap-4">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Start Your Journey <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            <Button variant="outline" onClick={handleComplete}>
              Skip Welcome
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};