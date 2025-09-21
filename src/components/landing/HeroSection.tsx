
import React from 'react';
import { UnifiedAuthForm } from '../auth/UnifiedAuthForm';
import { HeroImage } from '../ui/OptimizedImage';

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Apple-style clean background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-muted/20 -z-10"></div>

      {/* Main Hero Section - Apple-inspired layout */}
      <section className="relative min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Left Section - Apple-style typography */}
            <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
              <h1 className="text-apple-hero font-apple-bold text-foreground mb-6 tracking-tight leading-none">
                Powering Global
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Career Growth
                </span>
              </h1>
              
              <p className="text-apple-subtitle text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 font-apple-regular leading-relaxed">
                Your all-in-one platform for networking, skill-building, and finding the perfect career opportunities tailored to your unique journey.
              </p>
              
              <div className="text-apple-caption text-muted-foreground/80 max-w-lg mx-auto lg:mx-0 mb-8 font-apple-medium">
                Join thousands of professionals accelerating their careers with TalentXcel
              </div>

              {/* Apple-style metrics */}
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-apple-caption">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-apple-large font-apple-bold text-foreground">10K+</span>
                  <span className="text-muted-foreground font-apple-regular">Professionals</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-apple-large font-apple-bold text-foreground">1K+</span>
                  <span className="text-muted-foreground font-apple-regular">Businesses</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-apple-large font-apple-bold text-foreground">95%</span>
                  <span className="text-muted-foreground font-apple-regular">Success Rate</span>
                </div>
              </div>
            </div>

            {/* Right Section - Hero Image with Apple-style presentation */}
            <div className="flex-1 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-2xl">
                {/* Apple-style image container */}
                <div className="relative transform-gpu">
                  <HeroImage
                    src="/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png"
                    alt="TalentXcel Career Passport - Professional dashboard showcasing career analytics, skills tracking, and networking features"
                    className="w-full h-auto transform hover:scale-[1.02] transition-transform duration-700 ease-out will-change-transform"
                  />
                  {/* Apple-style subtle shadow */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/5 via-transparent to-transparent rounded-3xl blur-2xl transform translate-y-8"></div>
                </div>
                
                {/* Optional: Auth form overlay for mobile */}
                <div className="lg:hidden mt-12 w-full max-w-md mx-auto">
                  <UnifiedAuthForm />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Auth Form - Apple-style positioning */}
        <div className="hidden lg:block fixed top-24 right-8 w-80 z-10">
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-apple">
            <UnifiedAuthForm />
          </div>
        </div>
      </section>
    </div>
  );
};
