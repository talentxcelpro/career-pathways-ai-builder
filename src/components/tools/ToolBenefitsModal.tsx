import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  TrendingUp, 
  Target, 
  Users, 
  Brain,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Shield,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  txc_cost: number;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  icon: React.ComponentType<any>;
}

interface ToolBenefitsModalProps {
  tool: Tool;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onStartTesting?: () => void;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'immediate' | 'career' | 'skills' | 'network';
  impact: 'high' | 'medium' | 'low';
}

interface Feature {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  category: 'ai' | 'analytics' | 'export' | 'collaboration';
}

export const ToolBenefitsModal: React.FC<ToolBenefitsModalProps> = ({ tool, isOpen = false, onOpenChange, onStartTesting }) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  // Sync with external open state
  React.useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };
  const getBenefits = (): Benefit[] => {
    const baseBenefits: Benefit[] = [
      {
        id: 'instant-results',
        title: 'Instant AI-Powered Results',
        description: 'Get immediate, personalized insights using advanced AI algorithms',
        icon: Zap,
        category: 'immediate',
        impact: 'high'
      },
      {
        id: 'career-advancement',
        title: 'Accelerated Career Growth',
        description: 'Fast-track your career progression with data-driven recommendations',
        icon: TrendingUp,
        category: 'career',
        impact: 'high'
      },
      {
        id: 'skill-development',
        title: 'Skill Gap Analysis',
        description: 'Identify and bridge critical skill gaps in your field',
        icon: Target,
        category: 'skills',
        impact: 'medium'
      },
      {
        id: 'network-building',
        title: 'Network Enhancement',
        description: 'Connect with relevant professionals and expand your network',
        icon: Users,
        category: 'network',
        impact: 'medium'
      }
    ];

    // Add category-specific benefits
    const categoryBenefits: Record<string, Benefit[]> = {
      'Interview': [
        {
          id: 'interview-confidence',
          title: 'Interview Confidence Boost',
          description: 'Practice with AI interviewer and get real-time feedback',
          icon: Award,
          category: 'skills',
          impact: 'high'
        }
      ],
      'Resume': [
        {
          id: 'ats-optimization',
          title: 'ATS Optimization',
          description: 'Ensure your resume passes applicant tracking systems',
          icon: Shield,
          category: 'immediate',
          impact: 'high'
        }
      ],
      'Analytics': [
        {
          id: 'data-insights',
          title: 'Data-Driven Insights',
          description: 'Make informed career decisions with comprehensive analytics',
          icon: BarChart3,
          category: 'career',
          impact: 'high'
        }
      ]
    };

    return [...baseBenefits, ...(categoryBenefits[tool.category] || [])];
  };

  // Generate advanced features
  const getAdvancedFeatures = (): Feature[] => {
    return [
      {
        id: 'ai-personalization',
        name: 'AI Personalization Engine',
        description: 'Learns from your preferences and career goals to provide tailored recommendations',
        isPremium: false,
        category: 'ai'
      },
      {
        id: 'realtime-analytics',
        name: 'Real-time Analytics Dashboard',
        description: 'Track your progress and performance metrics in real-time',
        isPremium: false,
        category: 'analytics'
      },
      {
        id: 'export-options',
        name: 'Multiple Export Formats',
        description: 'Export results in PDF, Word, JSON, and other formats',
        isPremium: true,
        category: 'export'
      },
      {
        id: 'team-collaboration',
        name: 'Team Collaboration',
        description: 'Share insights and collaborate with mentors or career coaches',
        isPremium: true,
        category: 'collaboration'
      },
      {
        id: 'advanced-ai',
        name: 'GPT-4 Powered Analysis',
        description: 'Access to the most advanced AI models for superior results',
        isPremium: true,
        category: 'ai'
      },
      {
        id: 'priority-support',
        name: 'Priority Support & Feedback',
        description: 'Get priority access to our support team and expert feedback',
        isPremium: true,
        category: 'collaboration'
      }
    ];
  };

  const benefits = getBenefits();
  const features = getAdvancedFeatures();

  const stats = {
    avgTimeReduction: '75%',
    accuracyImprovement: '92%',
    userSatisfaction: '4.8/5',
    careerAdvancement: '3x faster'
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Star className="h-4 w-4 mr-2" />
          Benefits
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
              {React.createElement(tool.icon, { className: "h-6 w-6 text-purple-600" })}
            </div>
            Benefits & Features: {tool.name}
          </DialogTitle>
          <DialogDescription>
            Discover how {tool.name} can accelerate your career growth and maximize your potential
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="benefits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 rounded-2xl p-1">
            <TabsTrigger value="benefits" className="rounded-xl">Benefits</TabsTrigger>
            <TabsTrigger value="features" className="rounded-xl">Features</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-xl">Stats</TabsTrigger>
            <TabsTrigger value="roadmap" className="rounded-xl">Roadmap</TabsTrigger>
          </TabsList>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <Card 
                  key={benefit.id}
                  className={cn(
                    "transition-all duration-300 hover:shadow-lg cursor-pointer",
                    "border-l-4",
                    benefit.impact === 'high' && "border-l-green-500 bg-green-50/50",
                    benefit.impact === 'medium' && "border-l-yellow-500 bg-yellow-50/50",
                    benefit.impact === 'low' && "border-l-gray-500 bg-gray-50/50"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          benefit.impact === 'high' && "bg-green-100 text-green-600",
                          benefit.impact === 'medium' && "bg-yellow-100 text-yellow-600",
                          benefit.impact === 'low' && "bg-gray-100 text-gray-600"
                        )}>
                          {React.createElement(benefit.icon, { className: "h-5 w-5" })}
                        </div>
                        <div>
                          <CardTitle className="text-base">{benefit.title}</CardTitle>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs mt-1 capitalize",
                              benefit.impact === 'high' && "border-green-500 text-green-700",
                              benefit.impact === 'medium' && "border-yellow-500 text-yellow-700",
                              benefit.impact === 'low' && "border-gray-500 text-gray-700"
                            )}
                          >
                            {benefit.impact} impact
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Free Features
                </h3>
                {features.filter(f => !f.isPremium).map((feature) => (
                  <Card key={feature.id} className="bg-green-50/50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {feature.category === 'ai' && <Brain className="h-4 w-4 text-green-600" />}
                          {feature.category === 'analytics' && <BarChart3 className="h-4 w-4 text-green-600" />}
                          {feature.category === 'export' && <ArrowRight className="h-4 w-4 text-green-600" />}
                          {feature.category === 'collaboration' && <Users className="h-4 w-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">{feature.name}</h4>
                          <p className="text-sm text-green-700 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Premium Features
                </h3>
                {features.filter(f => f.isPremium).map((feature) => (
                  <Card key={feature.id} className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          {feature.category === 'ai' && <Brain className="h-4 w-4 text-purple-600" />}
                          {feature.category === 'analytics' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                          {feature.category === 'export' && <ArrowRight className="h-4 w-4 text-purple-600" />}
                          {feature.category === 'collaboration' && <Users className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-purple-900">{feature.name}</h4>
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
                              Pro
                            </Badge>
                          </div>
                          <p className="text-sm text-purple-700 mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {stats.avgTimeReduction}
                  </div>
                  <div className="text-sm text-blue-700">Time Reduction</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900 mb-1">
                    {stats.accuracyImprovement}
                  </div>
                  <div className="text-sm text-green-700">Accuracy</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-yellow-900 mb-1">
                    {stats.userSatisfaction}
                  </div>
                  <div className="text-sm text-yellow-700">User Rating</div>
                </CardContent>
              </Card>

              <Card className="text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-900 mb-1">
                    {stats.careerAdvancement}
                  </div>
                  <div className="text-sm text-purple-700">Career Growth</div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Success Stories</CardTitle>
                <CardDescription>Real outcomes from tool users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-medium">Sarah M. - Software Engineer</div>
                      <div className="text-sm text-green-700">
                        "Landed 3 interviews in 2 weeks after using this tool. The AI insights were game-changing!"
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-medium">Mike R. - Product Manager</div>
                      <div className="text-sm text-blue-700">
                        "Got promoted 6 months earlier than expected. The skill gap analysis was spot-on!"
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                    <Star className="h-6 w-6 text-purple-600" />
                    <div>
                      <div className="font-medium">Lisa K. - Marketing Director</div>
                      <div className="text-sm text-purple-700">
                        "Increased my market value by 40%. The personalized recommendations were incredible!"
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Career Journey with {tool.name}</CardTitle>
                <CardDescription>
                  Here's how this tool fits into your career advancement strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Assessment & Analysis",
                      description: "Complete comprehensive analysis of your current position",
                      duration: "5-10 minutes",
                      status: "start"
                    },
                    {
                      step: 2,
                      title: "AI-Powered Insights",
                      description: "Receive personalized recommendations and action items",
                      duration: "Instant",
                      status: "process"
                    },
                    {
                      step: 3,
                      title: "Implementation",
                      description: "Apply insights to your career strategy and materials",
                      duration: "1-2 weeks",
                      status: "action"
                    },
                    {
                      step: 4,
                      title: "Track Progress",
                      description: "Monitor improvements and iterate based on results",
                      duration: "Ongoing",
                      status: "monitor"
                    }
                  ].map((step, index) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                        index === 0 && "bg-green-500",
                        index === 1 && "bg-blue-500",
                        index === 2 && "bg-purple-500",
                        index === 3 && "bg-orange-500"
                      )}>
                        {step.step}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{step.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {step.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
          <div>
            <h4 className="font-semibold text-lg">Ready to accelerate your career?</h4>
            <p className="text-sm text-slate-600">Join thousands of professionals already using {tool.name}</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => handleOpenChange(false)}
          >
            Start Using Tool
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};