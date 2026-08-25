import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { ChevronRight } from 'lucide-react';
import careerPassportPreview from '@/assets/career-passport-preview.png';

export const AppleHeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-muted/30 to-muted/50">
      {/* Floating geometric elements with semantic colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-accent/15 to-primary/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              {/* Globe Icon with semantic colors */}
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="w-[clamp(3rem,4vw,4rem)] h-[clamp(3rem,4vw,4rem)] bg-gradient-to-br from-primary via-primary to-accent rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/80 rounded-full"></div>
                  <div className="absolute top-2 left-2 w-[clamp(0.5rem,0.75vw,0.75rem)] h-[clamp(0.75rem,1vw,1rem)] bg-accent rounded-full opacity-80"></div>
                  <div className="absolute top-4 right-3 w-[clamp(0.375rem,0.5vw,0.5rem)] h-[clamp(0.5rem,0.75vw,0.75rem)] bg-accent rounded-full opacity-60"></div>
                  <div className="absolute bottom-3 left-4 w-[clamp(0.75rem,1vw,1rem)] h-[clamp(0.375rem,0.5vw,0.5rem)] bg-accent rounded-full opacity-70"></div>
                  <div className="absolute bottom-2 right-2 w-[clamp(0.375rem,0.5vw,0.5rem)] h-[clamp(0.375rem,0.5vw,0.5rem)] bg-accent rounded-full opacity-50"></div>
                  <div className="absolute top-1 left-2 w-[clamp(0.75rem,1vw,1rem)] h-[clamp(0.75rem,1vw,1rem)] bg-primary-foreground/30 rounded-full blur-sm"></div>
                </div>
              </div>
              
              <h1 className="text-display font-heading tracking-tight text-foreground leading-[1.1]">
                AI-Powered Platform for
                <span className="block font-medium bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Jobs, Skills & Higher Ed
                </span>
              </h1>
              
              <p className="text-body-large text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Search verified jobs, build ATS-optimized resumes, explore 10,250+ Indian colleges, and fast-track your career with AI-guided learning and verified skill passports.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <AuthDialog>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground apple-rounded-xl apple-padding-lg text-body font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 icon-sm group-hover:translate-x-1 transition-transform" />
                </Button>
              </AuthDialog>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                Join thousands of professionals accelerating their careers with TalentXcel
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm">
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">10K+</div>
                  <div className="text-caption text-muted-foreground">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">1K+</div>
                  <div className="text-caption text-muted-foreground">Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-headline font-semibold text-foreground">95%</div>
                  <div className="text-caption text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Career Passport Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-secondary/15 to-accent/20 rounded-[2rem] blur-2xl" aria-hidden="true"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-border/50">
              <a href="/passport" className="block transition-transform hover:scale-105">
                <img
                  src={careerPassportPreview}
                  alt="TalentXcel Career Passport - Professional dashboard for tracking career progress"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                  className="block w-full h-auto object-cover"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};