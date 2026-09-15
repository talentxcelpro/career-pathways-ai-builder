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
        <link rel="canonical" href="https://talentxcel.in/resume" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm text-cyan-300 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-cyan-500/30">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">TalentXcel</span>
              AI-Powered Career Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
              Build Your Perfect
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Resume with AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              From AI-powered resume building to interview prep and career intelligence. 
              <span className="text-cyan-300 font-semibold">Everything you need to land your dream job</span> in one powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl shadow-cyan-500/25 border-0 transform hover:scale-105 transition-all duration-300"
                onClick={() => handleFeatureClick('/resume/builder')}
              >
                <Brain className="h-5 w-5 mr-2" />
                Start with AI Builder
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400 backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
                onClick={() => handleFeatureClick('/resume/templates')}
              >
                <FileText className="h-5 w-5 mr-2" />
                Browse Templates
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg shadow-lg">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{stat.value}</div>
                  <div className="text-sm text-cyan-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Complete <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">TalentXcel</span> Career Toolkit
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to build, optimize, and land your next role with AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card 
                  key={feature.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg ${
                    feature.isPopular ? 'ring-2 ring-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/25' : ''
                  }`}
                  onClick={() => handleFeatureClick(feature.path)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-800 group-hover:text-gray-900">{feature.title}</CardTitle>
                          {feature.isPopular && (
                            <Badge className="mt-1 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                              🔥 Most Popular
                            </Badge>
                          )}
                          {feature.isNew && (
                            <Badge className="mt-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                              ✨ New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-500 transition-colors duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed mb-3 text-gray-600">
                      {feature.description}
                    </CardDescription>
                    {feature.badge && (
                      <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700 bg-cyan-50">
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
        <section className="py-16 px-4 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')"}}></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">TalentXcel</span> Success Stories
              </h2>
              <p className="text-xl text-purple-200">
                Join thousands who landed their dream jobs with our AI-powered platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((story, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed mb-4 italic text-white/90">
                      "{story.quote}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-white font-semibold text-sm">
                          {story.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{story.name}</div>
                        <div className="text-xs text-cyan-200">
                          {story.role} at <span className="font-semibold text-cyan-300">{story.company}</span>
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
        <section className="py-20 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          
          <div className="max-w-4xl mx-auto text-center text-white relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-2xl">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl md:text-2xl opacity-95 mb-10 leading-relaxed">
              Join over <span className="font-bold text-cyan-300">2 million professionals</span> who transformed their careers with <span className="bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent font-bold">TalentXcel</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 bg-white text-cyan-600 hover:bg-gray-100 shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold"
                onClick={() => handleFeatureClick('/resume/builder')}
              >
                <Brain className="h-5 w-5 mr-2" />
                Start Building Now - FREE
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-7 border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                onClick={() => handleFeatureClick('/resume/templates')}
              >
                <Eye className="h-5 w-5 mr-2" />
                View 50+ Templates
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ResumeHub;