import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Upload, Brain, Target, Mail, MessageCircle, 
  Briefcase, TrendingUp, BarChart3, Building2, GraduationCap, 
  Eye, Star, ArrowRight, CheckCircle, Users, Trophy, Zap 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  path: string;
  badge?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

const ResumeHub = () => {
  const navigate = useNavigate();

  const features: FeatureCard[] = [
    {
      id: 'templates',
      title: 'Template Gallery',
      description: 'Choose from 50+ professional resume templates designed by experts',
      icon: FileText,
      path: '/resume/templates',
      badge: '50+ Templates',
      isPopular: true
    },
    {
      id: 'upload',
      title: 'Upload & Parse',
      description: 'Upload your existing resume and let AI extract and improve the content',
      icon: Upload,
      path: '/resume/upload',
      badge: 'AI Powered'
    },
    {
      id: 'builder',
      title: 'AI Resume Builder',
      description: 'Build your resume from scratch with AI assistance and smart suggestions',
      icon: Brain,
      path: '/resume/builder',
      badge: 'Most Popular',
      isPopular: true
    },
    {
      id: 'ats',
      title: 'ATS Optimizer',
      description: 'Check and optimize your resume for Applicant Tracking Systems',
      icon: Target,
      path: '/resume/ats-check',
      badge: '95% Pass Rate'
    },
    {
      id: 'cover-letter',
      title: 'Cover Letter Studio',
      description: 'Create compelling cover letters that match your resume perfectly',
      icon: Mail,
      path: '/resume/cover-letter',
      badge: 'Auto-Match'
    },
    {
      id: 'interview',
      title: 'Interview Prep Suite',
      description: 'Practice interviews with AI and get personalized feedback',
      icon: MessageCircle,
      path: '/resume/interview-prep',
      badge: 'AI Coach',
      isNew: true
    },
    {
      id: 'portfolio',
      title: 'Portfolio Builder',
      description: 'Create a stunning online portfolio to showcase your work',
      icon: Briefcase,
      path: '/resume/portfolio',
      badge: 'Custom Domain'
    },
    {
      id: 'intelligence',
      title: 'Career Intelligence',
      description: 'Get market insights, salary data, and career recommendations',
      icon: TrendingUp,
      path: '/resume/career-intelligence',
      badge: 'Live Data'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Manage all your resumes, cover letters, and applications in one place',
      icon: BarChart3,
      path: '/resume/dashboard',
      badge: 'Centralized'
    },
    {
      id: 'company',
      title: 'Company Tools',
      description: 'HR and recruiter tools for job posting and candidate management',
      icon: Building2,
      path: '/resume/company-tools',
      badge: 'For HR'
    },
    {
      id: 'learning',
      title: 'Learning Hub',
      description: 'Career development resources, courses, and skill assessments',
      icon: GraduationCap,
      path: '/resume/learning-hub',
      badge: 'Skill Growth'
    },
    {
      id: 'analytics',
      title: 'Success Analytics',
      description: 'Track your application success rate and get improvement insights',
      icon: Eye,
      path: '/resume/analytics',
      badge: 'Data Driven'
    }
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  const stats = [
    { value: '2M+', label: 'Resumes Created', icon: FileText },
    { value: '85%', label: 'Interview Rate', icon: Target },
    { value: '4.9/5', label: 'User Rating', icon: Star },
    { value: '10K+', label: 'Companies Trust Us', icon: Building2 }
  ];

  const successStories = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'Google',
      quote: 'Got 3 FAANG interviews within a week of using TalentXcel AI Resume Builder'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Marketing Manager',
      company: 'Meta',
      quote: 'The ATS optimization helped my resume pass all screening filters'
    },
    {
      name: 'Emily Johnson',
      role: 'Data Scientist',
      company: 'Microsoft',
      quote: 'Interview prep with AI gave me the confidence to land my dream job'
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Resume Builder | Create Professional Resumes | TalentXcel</title>
        <meta 
          name="description" 
          content="Build professional resumes with AI. ATS-optimized templates, interview prep, portfolio builder, and career intelligence. Join 2M+ successful job seekers." 
        />
        <meta name="keywords" content="resume builder, AI resume, ATS optimization, cover letter, interview prep, portfolio builder, career tools" />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered Career Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Build Your Perfect Resume
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              From AI-powered resume building to interview prep and career intelligence. 
              Everything you need to land your dream job in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => handleFeatureClick('/resume/builder')}
              >
                <Brain className="h-5 w-5 mr-2" />
                Start with AI Builder
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => handleFeatureClick('/resume/templates')}
              >
                <FileText className="h-5 w-5 mr-2" />
                Browse Templates
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Career Toolkit</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build, optimize, and land your next role
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card 
                  key={feature.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    feature.isPopular ? 'ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => handleFeatureClick(feature.path)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          {feature.isPopular && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Most Popular
                            </Badge>
                          )}
                          {feature.isNew && (
                            <Badge className="mt-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-3">
                      {feature.description}
                    </CardDescription>
                    {feature.badge && (
                      <Badge variant="outline" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands who landed their dream jobs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story, index) => (
                <Card key={index} className="bg-background">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed mb-4 italic">
                      "{story.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {story.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{story.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {story.role} at {story.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Workflows */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Workflows</h2>
              <p className="text-xl text-muted-foreground">
                Follow these proven paths to career success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Start Flow */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Quick Start (15 mins)</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Choose from Template Gallery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">AI fills content automatically</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">ATS optimization check</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Download & apply</span>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => handleFeatureClick('/resume/templates')}>
                  Start Quick Flow
                </Button>
              </Card>

              {/* Complete Flow */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Complete Flow (1 hour)</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">AI Resume Builder from scratch</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Create matching cover letter</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Practice with Interview Prep</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Build online portfolio</span>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => handleFeatureClick('/resume/builder')}>
                  Start Complete Flow
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary via-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join over 2 million professionals who transformed their careers with TalentXcel
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6"
                onClick={() => handleFeatureClick('/resume/builder')}
              >
                <Brain className="h-5 w-5 mr-2" />
                Start Building Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary"
                onClick={() => handleFeatureClick('/resume/templates')}
              >
                <Eye className="h-5 w-5 mr-2" />
                View Templates
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ResumeHub;