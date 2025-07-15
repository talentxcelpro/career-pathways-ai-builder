import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Calculator, MapPin, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AICareerHub = () => {
  const aiTools = [
    {
      id: 'co-pilot',
      title: 'AI Career Co-Pilot',
      description: 'Your personal AI assistant for career growth and opportunities',
      icon: <Brain className="h-8 w-8" />,
      features: ['Daily career insights', 'Job recommendations', 'Skill gap analysis', 'Career roadmaps'],
      link: '/career-map/ai-copilot',
      badge: 'Popular'
    },
    {
      id: 'job-match',
      title: 'Job Match Engine',
      description: 'AI-powered job matching with detailed compatibility scores',
      icon: <Target className="h-8 w-8" />,
      features: ['97% match accuracy', 'Skills analysis', 'Salary insights', 'Company fit'],
      link: '/career-map/job-match-engine',
      badge: 'New'
    },
    {
      id: 'pathfinder',
      title: 'Career Pathfinder',
      description: 'Create personalized roadmaps to achieve your career goals',
      icon: <MapPin className="h-8 w-8" />,
      features: ['Goal-based planning', 'Milestone tracking', 'Market insights', 'Timeline optimization'],
      link: '/career-map/pathfinder'
    },
    {
      id: 'roi-engine',
      title: 'Learning ROI Engine',
      description: 'Calculate return on investment for courses and certifications',
      icon: <Calculator className="h-8 w-8" />,
      features: ['ROI analysis', 'Salary projections', 'Market data', 'Risk assessment'],
      link: '/career-map/learning-roi'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Career Intelligence Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leverage cutting-edge AI technology to accelerate your career growth with personalized insights, 
            intelligent job matching, and data-driven career planning.
          </p>
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {aiTools.map((tool) => (
            <Card key={tool.id} className="relative hover:shadow-xl transition-all duration-300 group">
              {tool.badge && (
                <div className="absolute -top-3 -right-3 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    {tool.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                    {tool.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Zap className="h-3 w-3 mr-2 text-blue-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link to={tool.link}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Launch {tool.title}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            AI-Powered Career Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">96.7%</div>
              <div className="text-sm text-gray-600">Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">450%</div>
              <div className="text-sm text-gray-600">Average ROI</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
              <div className="text-sm text-gray-600">Career Goal Achievement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">18 Days</div>
              <div className="text-sm text-gray-600">Average Time to Hire</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICareerHub;