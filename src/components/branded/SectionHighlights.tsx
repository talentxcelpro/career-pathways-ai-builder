import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AIStatusIndicator } from "@/components/ui/AIStatusIndicator";

interface Highlight {
  icon: LucideIcon;
  title: string;
  description: string;
  aiPowered?: boolean;
}

interface SectionHighlightsProps {
  title: string;
  highlights: Highlight[];
}

export const SectionHighlights: React.FC<SectionHighlightsProps> = ({
  title,
  highlights
}) => {
  return (
    <section className="py-16 px-4 bg-background animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-title font-heading text-center text-foreground mb-12 animate-fade-in-down">
          {title}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {highlights.map((highlight, index) => {
            const HighlightCard = (
              <div className="p-6 rounded-lg border border-border bg-gradient-card hover:shadow-elegant transition-all duration-500 hover:scale-105 transform group animate-float">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 group-hover:animate-rotate-scale transition-transform duration-300">
                  <highlight.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-subheading font-heading text-card-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {highlight.title}
                </h3>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            );

            return (
              <div key={index} className="animate-slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                {highlight.aiPowered ? (
                  <AIStatusIndicator module="TalentXcel" feature={highlight.title}>
                    {HighlightCard}
                  </AIStatusIndicator>
                ) : (
                  HighlightCard
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};