import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerItem {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonAction: string;
  gradient: string;
  icon: string;
}

const banners: BannerItem[] = [
  {
    id: '1',
    title: '🧠 Mock Interview with AI',
    description: 'Practice with AI interviewer and get instant feedback',
    buttonText: 'Start Practice',
    buttonAction: '/interview-prep',
    gradient: 'from-purple-500 to-indigo-600',
    icon: '🎤'
  },
  {
    id: '2',
    title: '🛠️ Resume Analysis',
    description: 'Get AI-powered insights to improve your resume',
    buttonText: 'Analyze Resume',
    buttonAction: '/resume-analysis',
    gradient: 'from-blue-500 to-cyan-600',
    icon: '📄'
  },
  {
    id: '3',
    title: '💼 New Companies Hiring',
    description: 'Discover 150+ companies that started hiring this week',
    buttonText: 'View Companies',
    buttonAction: '/companies',
    gradient: 'from-green-500 to-emerald-600',
    icon: '🏢'
  }
];

export const JobsBanner: React.FC = () => {
  const [currentBanner, setCurrentBanner] = React.useState(0);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  React.useEffect(() => {
    const interval = setInterval(nextBanner, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = banners[currentBanner];

  return (
    <div className="relative bg-gradient-to-r from-gray-50 to-blue-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden">
          <div className={`bg-gradient-to-r ${current.gradient} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{current.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{current.title}</h3>
                    <p className="text-white/90 text-sm">{current.description}</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                  onClick={() => window.location.href = current.buttonAction}
                >
                  {current.buttonText}
                </Button>
              </div>
            </CardContent>
          </div>
          
          {/* Navigation */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevBanner}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={nextBanner}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentBanner ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};