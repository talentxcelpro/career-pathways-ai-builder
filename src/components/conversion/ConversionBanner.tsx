import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Users, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ConversionBannerProps {
  variant?: 'floating' | 'sticky' | 'inline';
  page?: 'resume' | 'jobs' | 'interview' | 'insights';
}

export const ConversionBanner: React.FC<ConversionBannerProps> = ({ 
  variant = 'sticky', 
  page = 'resume' 
}) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('conversion-banner-dismissed');
    if (stored) {
      const dismissedTime = parseInt(stored);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setIsVisible(false);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setIsVisible(false);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('conversion-banner-dismissed', Date.now().toString());
  };

  const handleInteraction = () => {
    setHasInteracted(true);
  };

  const getContent = () => {
    const content = {
      resume: {
        text: 'Build Your Professional Resume for Free',
        subtext: 'ATS-optimized templates • AI suggestions • 1 free download',
        cta: 'Start Building',
        link: '/auth?mode=signup&flow=resume'
      },
      jobs: {
        text: 'Apply to Jobs with 1-Click',
        subtext: 'First 3 applications free • AI job matching • Track applications',
        cta: 'Start Applying',
        link: '/auth?mode=signup&flow=jobs'
      },
      interview: {
        text: 'Ace Your Next Interview',
        subtext: '5 free practice questions • AI feedback • Mock interviews',
        cta: 'Start Practicing',
        link: '/auth?mode=signup&flow=interview'
      },
      insights: {
        text: 'Get Your Career Insights Report',
        subtext: 'Salary benchmarks • Skills analysis • Growth opportunities',
        cta: 'Get Insights',
        link: '/auth?mode=signup&flow=insights'
      }
    };
    return content[page];
  };

  if (!isVisible || user) return null;

  const content = getContent();

  const baseClasses = "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg";
  
  const variantClasses = {
    floating: "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md rounded-lg z-50",
    sticky: "sticky top-0 z-40 w-full rounded-none",
    inline: "rounded-lg w-full"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">10,000+ users</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm">4.8/5</span>
            </div>
          </div>
          <h3 className="font-semibold text-sm md:text-base">{content.text}</h3>
          <p className="text-xs md:text-sm opacity-90">{content.subtext}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="bg-white text-primary hover:bg-white/90 shadow-md"
            onClick={handleInteraction}
          >
            <Link to={content.link}>
              {content.cta}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          
          {variant !== 'inline' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-primary-foreground hover:bg-white/20 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {hasInteracted && (
        <div className="px-4 pb-2">
          <div className="text-xs opacity-75">
            🚀 Join thousands building their careers with TalentXcel
          </div>
        </div>
      )}
    </div>
  );
};