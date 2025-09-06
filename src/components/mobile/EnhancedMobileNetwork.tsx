import React, { useState, useEffect } from 'react';
import { EnhancedMobileFeed } from './EnhancedMobileFeed';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Bell } from 'lucide-react';

const careerNews = [
  "Global Career News • 5 Tips to Negotiate Salary...",
  "Tech Industry Update • Remote Work Trends 2024...",
  "Professional Development • New Certification Programs...",
  "Market Insights • Top Skills in Demand This Quarter...",
  "Career Growth • Leadership Development Opportunities..."
];

export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % careerNews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">TalentXcel</h1>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        {/* Career News Ticker */}
        <div className="mt-2 py-1 overflow-hidden">
          <div className="text-sm text-muted-foreground transition-all duration-500 ease-in-out">
            {careerNews[currentNewsIndex]}
          </div>
        </div>
      </div>

      {/* Professional Feed */}
      <div className="flex-1 overflow-hidden">
        <EnhancedMobileFeed />
      </div>
    </div>
  );
};