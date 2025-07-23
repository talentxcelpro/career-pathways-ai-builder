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
    <section className={`py-16 px-4 text-center ${backgroundGradient ? 'bg-gradient-to-br from-primary/5 via-brand-green/5 to-accent/10' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="relative inline-block mb-6">
          {showAIBadge ? (
            <AIStatusIndicator module="TalentXcel" feature="AI-Powered">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-display">
                {title}
              </h1>
            </AIStatusIndicator>
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-display">
              {title}
            </h1>
          )}
        </div>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        
        {ctaAction && (
          <Button 
            onClick={ctaAction}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </section>
  );
};