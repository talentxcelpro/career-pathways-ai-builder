import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, TrendingUp, Users, Building2, ArrowRight, Mic, 
  Target, Zap, Brain, Star, MapPin, Clock, Award, 
  ChevronRight, PlayCircle, Shield, Rocket 
} from "lucide-react";

export const AdvancedHeroSection: React.FC = () => {
  const [jobCount, setJobCount] = useState(12430);
  const [isListening, setIsListening] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const heroTexts = [
    "Find your dream job now",
    "TalentXcel Performance career matching",
    "Join top companies hiring",
    "Accelerate your career growth"
  ];

  // Typewriter effect
  useEffect(() => {
    const currentText = heroTexts[currentTextIndex];
    if (typedText.length < currentText.length) {
      const timeout = setTimeout(() => {
        setTypedText(currentText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setTypedText('');
        setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [typedText, currentTextIndex]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setJobCount(prev => prev + Math.floor(Math.random() * 5));
      setCurrentStat(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    // Advanced voice search implementation
  };

  const stats = [
    { 
      icon: Users, 
      label: "Professionals hired this month", 
      value: jobCount.toLocaleString(), 
      trend: "+15%",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      icon: Building2, 
      label: "Companies actively hiring", 
      value: "2,450", 
      trend: "+12%",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      icon: TrendingUp, 
      label: "Success rate with Precision Match", 
      value: "94%", 
      trend: "+8%",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      icon: Target, 
      label: "Average salary increase", 
      value: "₹4.2L", 
      trend: "+18%",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const features = [
    { icon: Brain, text: "TalentXcel Precision Match", desc: "Get 90%+ accurate job matches" },
    { icon: Shield, text: "Verified Companies", desc: "Only genuine, verified employers" },
    { icon: Rocket, text: "Fast Track Apply", desc: "Apply to multiple jobs in seconds" },
    { icon: Award, text: "Skill Certification", desc: "Get certified and stand out" }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5 min-h-[80vh] edge-to-edge">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-secondary/30 to-accent/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-accent/30 to-primary/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-1/4 animate-bounce delay-300">
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-[24px]">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-apple-bold">Quick Apply Enabled</span>
            </div>
          </Card>
        </div>
        
        <div className="absolute top-48 right-1/4 animate-bounce delay-700">
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-[24px]">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-apple-bold">Premium Jobs Available</span>
            </div>
          </Card>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-10">
          {/* AI Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary animate-spin" />
            <Badge className="px-6 py-2 text-base font-apple-heavy bg-slate-950 text-white border-0 rounded-full shadow-2xl tracking-widest uppercase">
              ✨ Premium Opportunity Engine
            </Badge>
            <Sparkles className="h-6 w-6 text-primary animate-spin" />
          </div>
          
          {/* Dynamic headline with typewriter effect */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-apple-heavy bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight min-h-[1.2em] tracking-tighter">
              {typedText}
              <span className="animate-pulse">|</span>
            </h1>
            
            <p className="text-xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-apple-medium">
              Experience the future of job search with <span className="text-primary font-apple-heavy">TalentXcel Precision Match</span>, 
              <span className="text-secondary font-apple-heavy"> performance-driven insights</span>, and 
              <span className="text-accent font-apple-heavy"> premium matches</span>
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
            <Button size="lg" className="px-12 py-8 text-xl font-apple-heavy group bg-slate-950 text-white hover:scale-105 transition-all duration-500 shadow-2xl rounded-[32px]">
              <Brain className="mr-3 h-6 w-6 group-hover:animate-pulse" />
              Launch TalentXcel Discovery
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="px-10 py-8 text-xl font-apple-heavy group border-2 border-slate-200 hover:bg-slate-50 backdrop-blur-sm rounded-[32px]"
              onClick={handleVoiceSearch}
            >
              <Mic className={`mr-3 h-6 w-6 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              {isListening ? 'Listening...' : 'Voice Search'}
              <PlayCircle className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform" />
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-md border-0 group rounded-[32px]">
                <div className="text-center space-y-2">
                  <feature.icon className="h-8 w-8 text-primary mx-auto group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-apple-bold text-slate-900">{feature.text}</div>
                  <div className="text-xs text-muted-foreground font-apple-medium">{feature.desc}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Real-time stats with enhanced animations */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className={`p-6 hover:shadow-2xl transition-all duration-500 group cursor-pointer border-0 rounded-[32px] ${
                  currentStat === index ? 'ring-4 ring-primary/20 scale-105' : ''
                } ${stat.bgColor}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                    <Badge className="bg-white/80 text-green-700 border-0 font-apple-heavy">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-apple-heavy text-slate-900">{stat.value}</div>
                    <div className="text-[10px] font-apple-heavy text-slate-500 uppercase tracking-widest">{stat.label}</div>
                    <Progress value={(index + 1) * 25} className="h-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Enhanced trust indicators */}
          <div className="bg-white/50 backdrop-blur-sm rounded-[40px] p-8 max-w-4xl mx-auto mt-16 border border-white/40">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <Shield className="h-5 w-5 text-emerald-600" />
                <span className="font-apple-heavy text-slate-700 uppercase tracking-widest text-[10px]">Enterprise-Grade Security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-apple-heavy text-slate-700 uppercase tracking-widest text-[10px]">Precision Match AI</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <Rocket className="h-5 w-5 text-purple-600" />
                <span className="font-apple-heavy text-slate-700 uppercase tracking-widest text-[10px]">Instant Applications</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <Award className="h-5 w-5 text-orange-600" />
                <span className="font-apple-heavy text-slate-700 uppercase tracking-widest text-[10px]">Verified Talent Ecosystem</span>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-lg font-apple-bold text-slate-900">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span>4.9</span>
                <span className="text-slate-500 font-apple-medium ml-2">
                  "Best job portal I've ever used - found my dream role in days!"
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-apple-heavy uppercase tracking-widest mt-4">Based on 45,000+ verified user signals</p>
            </div>
          </div>

          {/* Urgency indicator */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-[32px] p-8 max-w-2xl mx-auto shadow-xl shadow-red-500/5">
            <div className="flex items-center justify-center gap-4 text-red-700">
              <Clock className="h-8 w-8 animate-pulse" />
              <div className="text-left">
                <div className="font-apple-heavy text-lg uppercase tracking-tighter">High-Velocity Status</div>
                <div className="text-xs font-apple-medium opacity-80">📢 Most job posts get their first 5 applications within 6 hours.</div>
                <div className="text-xs font-apple-bold mt-1">🔥 Early applicants have 3x higher probability of success.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
