import React from 'react';
import { Check } from 'lucide-react';

interface Benefit {
  title: string;
  description: string;
}

interface BenefitsSectionProps {
  title: string;
  subtitle?: string;
  benefits: Benefit[];
  userTypes?: string[];
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({
  title,
  subtitle,
  benefits,
  userTypes
}) => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-brand-green/5 to-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 font-display">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green flex items-center justify-center mt-1">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 font-display">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {userTypes && (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4 font-display">
              Perfect For:
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {userTypes.map((userType, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium"
                >
                  {userType}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};