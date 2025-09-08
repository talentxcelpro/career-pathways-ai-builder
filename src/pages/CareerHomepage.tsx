import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ComprehensiveCareerDashboard from '@/components/dashboard/ComprehensiveCareerDashboard';
import CareerRoadmapGenerator from '@/components/career/CareerRoadmapGenerator';
import { updateMetaTags } from '@/utils/metaTags';

const CareerHomepage: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel - AI-Powered Career Development Platform | Professional Growth & Success',
      description: 'Transform your career with AI-powered coaching, interview simulation, skill assessment, and personalized roadmaps. Join thousands of professionals achieving their career goals.'
    });
  }, []);

  const aiFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI Career Coach',
      description: 'Personalized career guidance with intelligent conversation',
      link: '/ai/advanced-hub',
      badge: 'Text & Voice',
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'Interview Simulator',
      description: 'Practice with AI-powered interview scenarios',
      link: '/ai/advanced-hub',
      badge: 'Real-time Feedback',
      color: 'bg-green-500/10 text-green-600'
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: 'Voice Chat AI',
      description: 'Natural voice conversations with career expert',
      link: '/ai/advanced-hub',
      badge: 'WebRTC',
      color: 'bg-purple-500/10 text-purple-600'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Career Analytics',
      description: 'Predictive insights and market intelligence',
      link: '/ai/advanced-hub',
      badge: 'Predictive',
      color: 'bg-orange-500/10 text-orange-600'
    }
  ];

  const careerTools = [
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Goal Management',
      description: 'Set and track your professional objectives',
      link: '/career-goals',
      stats: '85% success rate'
    },
    {
      icon: <Map className="h-8 w-8" />,
      title: 'Career Roadmap',
      description: 'Personalized development path planning',
      link: '/career-roadmap',
      stats: 'AI-generated'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Skills Assessment',
      description: 'Comprehensive skill gap analysis',
      link: '/skills-assessment',
      stats: '200+ skills'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Network Analysis',
      description: 'Professional networking intelligence',
      link: '/networking',
      stats: 'Smart insights'
    }
  ];

  return (
    <Routes>
      <Route path="/dashboard" element={<ComprehensiveCareerDashboard />} />
      <Route path="/roadmap" element={<CareerRoadmapGenerator />} />
      <Route path="/" element={
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="max-w-7xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="gap-1">
                  <Zap className="h-3 w-3" />
                  AI-Powered
                </Badge>
                <Badge variant="outline">
                  New: WebRTC Voice Chat
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Transform Your Career with AI
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Experience the future of career development with our comprehensive AI-powered platform. 
                Get personalized coaching, practice interviews, and accelerate your professional growth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2">
                    <Brain className="h-5 w-5" />
                    Launch Career Dashboard
                  </Button>
                </Link>
                <Link to="/ai/advanced-hub">
                  <Button size="lg" variant="outline" className="gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Try AI Coach
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* AI Features Section */}
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Next-Generation AI Career Tools</h2>
                <p className="text-muted-foreground text-lg">
                  Cutting-edge AI technology meets personalized career development
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {aiFeatures.map((feature, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                        {feature.icon}
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {feature.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <Link to={feature.link}>
                        <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Try Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Career Tools Section */}
          <section className="py-16 px-4 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Comprehensive Career Development</h2>
                <p className="text-muted-foreground text-lg">
                  Everything you need to plan, track, and accelerate your professional growth
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {careerTools.map((tool, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                        {tool.icon}
                      </div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{tool.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {tool.stats}
                        </Badge>
                        <Link to={tool.link}>
                          <Button variant="ghost" size="sm">
                            Explore →
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-muted-foreground">Career Goals Achieved</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">95%</div>
                  <div className="text-muted-foreground">Interview Success Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">12x</div>
                  <div className="text-muted-foreground">Faster Career Progression</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">AI Coach Availability</div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Join thousands of professionals who have transformed their careers with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Star className="h-5 w-5" />
                    Start Your Journey
                  </Button>
                </Link>
                <Link to="/ai/advanced-hub">
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent border-white text-white hover:bg-white hover:text-primary">
                    <Brain className="h-5 w-5" />
                    Experience AI Coaching
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      } />
    </Routes>
  );
};

export default CareerHomepage;