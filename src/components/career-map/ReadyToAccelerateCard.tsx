import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Rocket, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReadyToAccelerateCardProps {
  userName?: string;
  currentRole?: string;
  className?: string;
}

export const ReadyToAccelerateCard: React.FC<ReadyToAccelerateCardProps> = ({
  userName = "your",
  currentRole = "Junior Developer",
  className = ""
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Status Badge */}
      <div className="mb-6">
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 max-w-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800 font-medium">Currently: {currentRole}</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            AI recommends focusing on HTML and CSS to accelerate your progress.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 border-0 text-white overflow-hidden">
        <CardContent className="p-8 text-center relative">
          {/* Background decoration */}
          <div className="absolute top-6 right-6 w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Your personalized roadmap is ready. Take the next step with AI-powered insights 
              tailored specifically for {userName === "your" ? "you" : userName}.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/career-map/ai-roadmap-builder">
                <Button 
                  size="lg" 
                  className="bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-sm px-8 py-3 rounded-xl font-semibold text-lg min-w-[200px]"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Create My Roadmap
                </Button>
              </Link>
              <Link to="/career-map/skills-gap">
                <Button 
                  size="lg" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold text-lg min-w-[200px]"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Analyze My Skills
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};