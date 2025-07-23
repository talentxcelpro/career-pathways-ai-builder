import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Users, Building2, ArrowRight, Mic } from "lucide-react";

export const HeroSection: React.FC = () => {
  const [jobCount, setJobCount] = useState(2430);
  const [isListening, setIsListening] = useState(false);

  // Simulate real-time job count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setJobCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    // Voice search implementation would go here
  };

  const stats = [
    { icon: Users, label: "People found jobs this month", value: "2,430", trend: "+12%" },
    { icon: Building2, label: "Companies hiring", value: "1,250", trend: "+8%" },
    { icon: TrendingUp, label: "Success rate", value: "87%", trend: "+5%" }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-accent/20 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          {/* Main headline */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <Badge variant="secondary" className="px-4 py-1 text-sm font-medium">
                TalentXcel AI Job Matching
              </Badge>
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              Find your dream job now
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover verified jobs, AI-matched roles, and top companies hiring.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold group">
              🧠 Ask AI to find best jobs for me
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-lg font-semibold group"
              onClick={handleVoiceSearch}
            >
              <Mic className={`mr-2 h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              {isListening ? 'Listening...' : 'Voice Search'}
            </Button>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <Badge variant="secondary" className="text-green-600 bg-green-50">
                        {stat.trend}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>🔐 Verified by Experts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>🧠 AI Personalized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>⚡ Applied by 10,000+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};