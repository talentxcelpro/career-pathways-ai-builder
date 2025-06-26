
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { StatsCard } from '@/components/ui/stats-card';
import { ActionCard } from '@/components/ui/action-card';
import { 
  FileCheck, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  MessageSquare, 
  Brain, 
  Award,
  Sparkles,
  Clock,
  Users,
  BarChart3,
  History,
  Star,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Activity
} from 'lucide-react';
import ToolsNavigation from '@/components/tools/ToolsNavigation';

const Tools = () => {
  const tools = [
    {
      id: 'resume-check',
      title: 'Resume Checker',
      description: 'AI-powered ATS optimization and scoring',
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
      features: ['ATS Scoring', 'Keyword Analysis', 'Format Check'],
      popular: true,
      usage: '2.3k uses'
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter AI',
      description: 'Personalized cover letters in seconds',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-emerald-600',
      features: ['AI Writing', 'Job Matching', 'Multiple Tones'],
      popular: true,
      usage: '1.8k uses'
    },
    {
      id: 'salary-analyzer',
      title: 'Salary Intelligence',
      description: 'Real-time market data and negotiation insights',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      gradient: 'from-yellow-500 to-orange-500',
      features: ['Market Rates', 'Negotiation Tips', 'Trends'],
      popular: false,
      usage: '956 uses'
    },
    {
      id: 'market-insights',
      title: 'Market Pulse',
      description: 'Industry trends and demand analytics',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-indigo-600',
      features: ['Industry Analysis', 'Demand Trends', 'Growth Stats'],
      popular: false,
      usage: '743 uses'
    },
    {
      id: 'interview-prep',
      title: 'Interview Simulator',
      description: 'AI-powered mock interviews with feedback',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-red-500',
      features: ['Mock Interviews', 'AI Feedback', 'Common Questions'],
      popular: true,
      usage: '1.2k uses'
    },
    {
      id: 'ai-assistant',
      title: 'Career Copilot',
      description: 'Your personal AI career strategist',
      icon: Brain,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      gradient: 'from-indigo-500 to-purple-500',
      features: ['Career Guidance', 'Strategy Advice', 'Skill Recommendations'],
      popular: false,
      usage: '891 uses'
    },
    {
      id: 'profile-score',
      title: 'Profile Optimizer',
      description: 'AI analysis with actionable improvements',
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      gradient: 'from-red-500 to-pink-500',
      features: ['Profile Analysis', 'Completion Score', 'Optimization Tips'],
      popular: false,
      usage: '654 uses'
    }
  ];

  const stats = [
    { 
      title: 'AI Tools', 
      value: '7', 
      subtitle: 'Available now',
      icon: Sparkles, 
      trend: { value: '+2 new', isPositive: true },
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Time Saved', 
      value: '2.5hrs', 
      subtitle: 'Per user avg',
      icon: Clock, 
      trend: { value: '+15%', isPositive: true },
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      title: 'Users Helped', 
      value: '12.8K', 
      subtitle: 'This month',
      icon: Users, 
      trend: { value: '+24%', isPositive: true },
      gradient: 'from-purple-500 to-indigo-600'
    },
    { 
      title: 'Success Rate', 
      value: '94%', 
      subtitle: 'User satisfaction',
      icon: Target, 
      trend: { value: '+3%', isPositive: true },
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const quickActions = [
    {
      title: 'Smart Dashboard',
      description: 'Advanced analytics and collaboration tools',
      icon: BarChart3,
      path: '/tools/dashboard',
      gradient: 'from-blue-500 to-purple-500',
      featured: true,
      badge: 'Enhanced'
    },
    {
      title: 'Results Vault',
      description: 'Your saved results and analysis history',
      icon: History,
      path: '/tools/dashboard',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      title: 'AI Insights',
      description: 'Personalized recommendations and trends',
      icon: Lightbulb,
      path: '/tools/dashboard',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Favorites Hub',
      description: 'Quick access to your most-used tools',
      icon: Star,
      path: '/tools/dashboard',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ToolsNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Rocket className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">AI Career Acceleration Suite</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-6">
              Transform your career with cutting-edge AI tools designed for the modern professional
            </p>
            <div className="flex justify-center gap-3">
              <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Zap className="h-4 w-4 mr-2" />
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Access</h2>
              <p className="text-sm text-gray-600">Jump into your workflow faster</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 text-xs">4 Features</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                {...action}
                onClick={() => window.location.href = action.path}
              />
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI-Powered Tools</h2>
              <p className="text-sm text-gray-600">Professional-grade career enhancement tools</p>
            </div>
            <Link to="/tools/dashboard">
              <Button variant="outline" size="sm" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-2" />
                Advanced Dashboard
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                {tool.popular && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs shadow-lg">
                      Popular
                    </Badge>
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-900">{tool.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{tool.usage}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Link to={`/tools/${tool.id}`} className="block">
                      <Button className="w-full text-sm h-9 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        <Sparkles className="h-3 w-3 mr-2" />
                        Launch Tool
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white border-0 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <CardContent className="relative z-10 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">Ready to Accelerate Your Career?</h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their careers with our AI-powered tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tools/dashboard">
                <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Open Smart Dashboard
                </Button>
              </Link>
              <Link to="/tools/ai-assistant">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                  <Brain className="h-4 w-4 mr-2" />
                  Try AI Assistant
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tools;
