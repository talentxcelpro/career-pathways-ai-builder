import React from 'react';
import { Button } from "@/components/ui/button";
import { AIStatusIndicator } from "@/components/ui/AIStatusIndicator";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaAction?: () => void;
  showAIBadge?: boolean;
  backgroundGradient?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText = "Get Started",
  ctaAction,
  showAIBadge = true,
  backgroundGradient = true
}) => {
  return (
    <section className={`py-16 px-4 text-center animate-fade-in ${backgroundGradient ? 'bg-gradient-hero' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="relative inline-block mb-6 animate-fade-in-down">
          {showAIBadge ? (
            <AIStatusIndicator module="TalentXcel" feature="AI-Powered">
            <h1 className="text-headline md:text-display font-heading text-foreground animate-glow-pulse">
                {title}
              </h1>
            </AIStatusIndicator>
          ) : (
            <h1 className="text-headline md:text-display font-heading text-foreground animate-glow-pulse">
              {title}
            </h1>
          )}
        </div>
        
        <p className="text-body-large text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
          {subtitle}
        </p>
        
        {ctaAction && (
          <Button 
            onClick={ctaAction}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-elegant hover:shadow-glow transition-all duration-500 animate-bounce-in hover:scale-105 transform"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </section>
  );
};