import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Award,
  MessageSquare,
  Mic,
  Phone,
  Briefcase,
  Map,
  BarChart3,
  Lightbulb,
  Zap,
  Star,
  CheckCircle,
  Clock,
  Globe,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateMetaTags } from '@/utils/metaTags';

const CareerPlatformShowcase: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel - Complete AI Career Development Platform | Professional Success Platform',
      description: 'The most comprehensive AI-powered career development platform. Features AI coaching, interview simulation, skills assessment, career roadmaps, and real-time market intelligence.'
    });
  }, []);

  const platformFeatures = [
    {
      category: 'AI-Powered Coaching',
      features: [
        {
          icon: <Brain className="h-6 w-6" />,
          title: 'AI Career Coach',
          description: 'Intelligent text-based career guidance with personalized recommendations',
          status: 'active',
          link: '/ai/advanced-hub'
        },
        {
          icon: <Mic className="h-6 w-6" />,
          title: 'Voice AI Coach',
          description: 'Natural voice conversations with WebSocket real-time audio',
          status: 'active',
          link: '/ai/advanced-hub'
        },
        {
          icon: <Phone className="h-6 w-6" />,
          title: 'WebRTC Voice Chat',
          description: 'Low-latency peer-to-peer voice coaching with OpenAI Realtime API',
          status: 'premium',
          link: '/ai/advanced-hub'
        }
      ]
    },
    {
      category: 'Interview & Assessment',
      features: [
        {
          icon: <MessageSquare className="h-6 w-6" />,
          title: 'AI Interview Simulator',
          description: 'Realistic interview practice with real-time feedback and scoring',
          status: 'active',
          link: '/ai/advanced-hub'
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: 'Skills Assessment',
          description: 'Comprehensive skill gap analysis and development tracking',
          status: 'active',
          link: '/skills-assessment'
        },
        {
          icon: <Award className="h-6 w-6" />,
          title: 'Career Credibility Score',
          description: 'Professional credibility measurement and improvement insights',
          status: 'active',
          link: '/ai/advanced-hub'
        }
      ]
    },
    {
      category: 'Career Intelligence',
      features: [
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: 'Predictive Analytics',
          description: 'AI-powered career trajectory forecasting and market trends',
          status: 'active',
          link: '/ai/advanced-hub'
        },
        {
          icon: <Globe className="h-6 w-6" />,
          title: 'Real-time Market Data',
          description: 'Live job market intelligence and industry insights',
          status: 'active',
          link: '/career-intelligence'
        },
        {
          icon: <Users className="h-6 w-6" />,
          title: 'Networking Intelligence',
          description: 'Smart professional networking recommendations and strategies',
          status: 'active',
          link: '/ai/advanced-hub'
        }
      ]
    },
    {
      category: 'Planning & Development',
      features: [
        {
          icon: <Map className="h-6 w-6" />,
          title: 'Career Roadmap Generator',
          description: 'AI-generated personalized career development plans',
          status: 'active',
          link: '/roadmap'
        },
        {
          icon: <Target className="h-6 w-6" />,
          title: 'Goal Management',
          description: 'Smart goal setting and milestone tracking system',
          status: 'active',
          link: '/career-goals'
        },
        {
          icon: <Briefcase className="h-6 w-6" />,
          title: 'Career Passport',
          description: 'Comprehensive career profile and achievement tracking',
          status: 'active',
          link: '/dashboard'
        }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="text-xs">Active</Badge>;
      case 'premium':
        return <Badge variant="secondary" className="text-xs gap-1"><Star className="h-3 w-3" />Premium</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Coming Soon</Badge>;
    }
  };

  const stats = [
    { label: 'AI Models Integrated', value: '5+', icon: <Brain className="h-5 w-5" /> },
    { label: 'Career Features', value: '25+', icon: <Rocket className="h-5 w-5" /> },
    { label: 'Voice Interfaces', value: '3', icon: <Mic className="h-5 w-5" /> },
    { label: 'Real-time APIs', value: '10+', icon: <Zap className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="default" className="gap-1">
              <Zap className="h-3 w-3" />
              Complete Platform
            </Badge>
            <Badge variant="outline">
              AI-Powered
            </Badge>
            <Badge variant="secondary">
              Real-time Features
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Complete AI Career Platform
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Experience the most comprehensive AI-powered career development platform ever built. 
            From voice coaching to predictive analytics, everything you need for professional success.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-1 text-primary mb-1">
                  {stat.icon}
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                <Rocket className="h-5 w-5" />
                Launch Full Platform
              </Button>
            </Link>
            <Link to="/ai/advanced-hub">
              <Button size="lg" variant="outline" className="gap-2">
                <Brain className="h-5 w-5" />
                Try AI Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Complete Feature Overview</h2>
            <p className="text-muted-foreground text-lg">
              Every tool you need for accelerated career development in one integrated platform
            </p>
          </div>

          <div className="space-y-12">
            {platformFeatures.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-semibold mb-6 text-center">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {category.features.map((feature, featureIndex) => (
                    <Card key={featureIndex} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            {feature.icon}
                          </div>
                          {getStatusBadge(feature.status)}
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{feature.description}</p>
                        <Link to={feature.link}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            disabled={feature.status === 'coming-soon'}
                          >
                            {feature.status === 'coming-soon' ? 'Coming Soon' : 'Explore Feature'}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Technical Excellence</h2>
            <p className="text-muted-foreground text-lg">
              Built with cutting-edge technology for superior performance and user experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Advanced AI Models</h4>
                <p className="text-sm text-muted-foreground">GPT-4.1, GPT-5, and specialized career AI models</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">WebRTC Integration</h4>
                <p className="text-sm text-muted-foreground">Low-latency peer-to-peer voice communication</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Real-time Processing</h4>
                <p className="text-sm text-muted-foreground">Instant feedback and live data updates</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-8 w-8 text-primary mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Cloud-Native</h4>
                <p className="text-sm text-muted-foreground">Supabase backend with edge functions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Progress */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Completion Status</h2>
            <p className="text-muted-foreground text-lg">
              Track the development progress of our comprehensive career platform
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">AI Features Implementation</span>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Progress value={100} className="h-3" />

                <div className="flex items-center justify-between">
                  <span className="font-medium">Voice Integration</span>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Progress value={100} className="h-3" />

                <div className="flex items-center justify-between">
                  <span className="font-medium">Career Tools</span>
                  <span className="text-sm text-muted-foreground">95%</span>
                </div>
                <Progress value={95} className="h-3" />

                <div className="flex items-center justify-between">
                  <span className="font-medium">Platform Integration</span>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <Progress value={100} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Experience the Future of Career Development
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join the most advanced AI-powered career platform. Everything you need for professional success, 
            powered by cutting-edge technology and intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="gap-2">
                <Rocket className="h-5 w-5" />
                Launch Complete Platform
              </Button>
            </Link>
            <Link to="/ai/advanced-hub">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Brain className="h-5 w-5" />
                Explore AI Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerPlatformShowcase;