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
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12 font-display">
          {title}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => {
            const HighlightCard = (
              <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <highlight.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3 font-display">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            );

            return (
              <div key={index}>
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