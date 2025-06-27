import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
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
  Star
} from 'lucide-react';
import ToolsNavigation from '@/components/tools/ToolsNavigation';

const Tools = () => {
  const tools = [
    {
      id: 'resume-check',
      title: 'Resume Checker',
      description: 'Check ATS compatibility and get optimization suggestions',
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: ['ATS Scoring', 'Keyword Analysis', 'Format Check'],
      popular: true
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter Generator',
      description: 'AI-powered personalized cover letters for any job',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: ['AI Writing', 'Job Matching', 'Multiple Tones'],
      popular: true
    },
    {
      id: 'salary-analyzer',
      title: 'Salary Analyzer',
      description: 'Get salary insights and negotiation data for your role',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      features: ['Market Rates', 'Negotiation Tips', 'Trends'],
      popular: false
    },
    {
      id: 'market-insights',
      title: 'Market Insights',
      description: 'Industry trends, demand stats, and growth analytics',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: ['Industry Analysis', 'Demand Trends', 'Growth Stats'],
      popular: false
    },
    {
      id: 'interview-prep',
      title: 'Interview Prep',
      description: 'AI mock interviews and practice sessions',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: ['Mock Interviews', 'Feedback', 'Common Questions'],
      popular: true
    },
    {
      id: 'ai-assistant',
      title: 'AI Career Assistant',
      description: 'Get personalized career guidance and advice',
      icon: Brain,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      features: ['Career Guidance', 'Strategy Advice', 'Skill Recommendations'],
      popular: false
    },
    {
      id: 'profile-score',
      title: 'Profile Score',
      description: 'AI analysis of your profile with improvement suggestions',
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      features: ['Profile Analysis', 'Completion Score', 'Optimization Tips'],
      popular: false
    }
  ];

  const stats = [
    { label: 'Tools Available', value: '7', icon: Sparkles },
    { label: 'AI-Powered', value: '100%', icon: Brain },
    { label: 'Avg. Time Saved', value: '2hrs', icon: Clock },
    { label: 'Users Helped', value: '10K+', icon: Users }
  ];

  const quickActions = [
    {
      title: 'Tools Dashboard',
      description: 'Access all tools with enhanced interface',
      icon: BarChart3,
      path: '/tools/dashboard',
      color: 'text-blue-600'
    },
    {
      title: 'Results History',
      description: 'View and manage your saved results',
      icon: History,
      path: '/tools/dashboard',
      color: 'text-green-600'
    },
    {
      title: 'Analytics',
      description: 'Track your tool usage and progress',
      icon: BarChart3,
      path: '/tools/dashboard',
      color: 'text-purple-600'
    },
    {
      title: 'Favorites',
      description: 'Quick access to your favorite tools',
      icon: Star,
      path: '/tools/dashboard',
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToolsNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Career Tools</h1>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.path}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow relative">
              {tool.popular && (
                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-gray-600">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {tool.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/tools/${tool.id}`} className="block">
                    <Button className="w-full">
                      Try {tool.title}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Career?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of professionals who've transformed their careers with our AI tools.
              </p>
              <div className="space-x-4">
                <Link to="/tools/dashboard">
                  <Button size="lg" variant="secondary">
                    Open Dashboard
                  </Button>
                </Link>
                <Link to="/tools/ai-assistant">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                    Start with AI Assistant
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tools;
