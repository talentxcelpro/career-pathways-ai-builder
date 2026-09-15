import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Wallet, Globe, Shield } from 'lucide-react';

const serviceHighlights = [
  { icon: MessageCircle, title: "Unified chat & calling service", description: "One platform for all communication" },
  { icon: Phone, title: "Native calling technology", description: "Works even when app is closed" },
  { icon: Wallet, title: "Integrated wallet & micro-tasks", description: "Earn and pay seamlessly" },
  { icon: Globe, title: "Low-bandwidth optimized", description: "Designed for Indian networks" },
  { icon: Shield, title: "Privacy-first infrastructure", description: "Your data stays yours" },
];

export const ChatrServiceSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'webos', 'blackberry', 'windows phone'];
      setIsMobile(mobileKeywords.some(keyword => userAgent.includes(keyword)));
    };
    checkDevice();
  }, []);

  const handlePrimaryCTA = () => {
    window.open('https://chatr.chat', '_blank');
  };

  const handleSecondaryCTA = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) {
      // Placeholder for Play Store link
      window.open('https://play.google.com/store/apps', '_blank');
    } else {
      window.open('https://chatr.chat', '_blank');
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Content */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Services / Technologies
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            CHATR — A Communication Service
            <span className="block text-primary">by TalentXcel</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
            Chat, call, earn, pay, and collaborate — all in one platform.
          </p>
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-10">
            A next-gen communication technology built by TalentXcel.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {isMobile ? (
              <>
                <Button 
                  onClick={handleSecondaryCTA}
                  size="lg"
                  className="min-w-[200px] h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Install CHATR App
                </Button>
                <Button 
                  onClick={handlePrimaryCTA}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] h-14 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  Open CHATR Web
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handlePrimaryCTA}
                  size="lg"
                  className="min-w-[200px] h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Open CHATR
                </Button>
                <Button 
                  onClick={handleSecondaryCTA}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px] h-14 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  Install CHATR App
                </Button>
              </>
            )}
          </div>

          {/* Trust Line */}
          <p className="text-sm text-muted-foreground/70">
            CHATR is a core service operated by <span className="font-semibold text-foreground">TalentXcel Technologies</span>
          </p>
        </div>

        {/* Service Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {serviceHighlights.map((highlight, index) => (
            <div 
              key={index}
              className="group p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/30 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <highlight.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">
                {highlight.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Compliance */}
        <div className="text-center pt-8 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-1">
            © 2026 TalentXcel Services Pvt Ltd
          </p>
          <p className="text-xs text-muted-foreground/70">
            CHATR (chatr.chat / chatrchat.in) is an official brand and communication service operated by TalentXcel Services Pvt Ltd.
          </p>
        </div>
      </div>
    </section>
  );
};
