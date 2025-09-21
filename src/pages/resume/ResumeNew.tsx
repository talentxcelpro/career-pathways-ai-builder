import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, Zap, Plane, FileText, Upload, Target, PenTool, 
  Video, Globe, TrendingUp, BarChart3, Users, BookOpen, 
  Sparkles, CheckCircle, ArrowRight, Star
} from 'lucide-react';
import resumePreview from '@/assets/resume-preview-ai.png';

const ResumeNew: React.FC = () => {
  const tools = [
    {
      title: "Template Gallery",
      description: "Choose from 50+ professional resume templates designed by experts",
      badge: "🔥 Most Popular",
      badgeColor: "bg-orange-500",
      stat: "50+ Templates",
      icon: <FileText className="h-6 w-6" />,
      href: "/resume/templates"
    },
    {
      title: "Upload & Parse",
      description: "Upload your existing resume and let AI extract and improve the content",
      badge: "AI Powered",
      badgeColor: "bg-blue-500",
      stat: "AI Powered",
      icon: <Upload className="h-6 w-6" />,
      href: "/resume/upload"
    },
    {
      title: "AI Resume Builder",
      description: "Build your resume from scratch with AI assistance and smart suggestions",
      badge: "🔥 Most Popular",
      badgeColor: "bg-orange-500",
      stat: "Most Popular",
      icon: <Sparkles className="h-6 w-6" />,
      href: "/resume/builder"
    },
    {
      title: "ATS Optimizer",
      description: "Check and optimize your resume for Applicant Tracking Systems",
      badge: "95% Pass Rate",
      badgeColor: "bg-green-500",
      stat: "95% Pass Rate",
      icon: <Target className="h-6 w-6" />,
      href: "/resume/ats-check"
    },
    {
      title: "Cover Letter Studio",
      description: "Create compelling cover letters that match your resume perfectly",
      badge: "Auto-Match",
      badgeColor: "bg-purple-500",
      stat: "Auto-Match",
      icon: <PenTool className="h-6 w-6" />,
      href: "/resume/cover-letter"
    },
    {
      title: "Interview Prep Suite",
      description: "Practice interviews with AI and get personalized feedback",
      badge: "✨ New",
      badgeColor: "bg-cyan-500",
      stat: "AI Coach",
      icon: <Video className="h-6 w-6" />,
      href: "/resume/interview-prep"
    },
    {
      title: "Portfolio Builder",
      description: "Create a stunning online portfolio to showcase your work",
      badge: "Custom Domain",
      badgeColor: "bg-indigo-500",
      stat: "Custom Domain",
      icon: <Globe className="h-6 w-6" />,
      href: "/resume/portfolio"
    },
    {
      title: "Career Intelligence",
      description: "Get market insights, salary data, and career recommendations",
      badge: "Live Data",
      badgeColor: "bg-emerald-500",
      stat: "Live Data",
      icon: <TrendingUp className="h-6 w-6" />,
      href: "/resume/career-intelligence"
    },
    {
      title: "Dashboard",
      description: "Manage all your resumes, cover letters, and applications in one place",
      badge: "Centralized",
      badgeColor: "bg-slate-500",
      stat: "Centralized",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/dashboard"
    },
    {
      title: "Company Tools",
      description: "HR and recruiter tools for job posting and candidate management",
      badge: "For HR",
      badgeColor: "bg-pink-500",
      stat: "For HR",
      icon: <Users className="h-6 w-6" />,
      href: "/employer"
    },
    {
      title: "Learning Hub",
      description: "Career development resources, courses, and skill assessments",
      badge: "Skill Growth",
      badgeColor: "bg-yellow-500",
      stat: "Skill Growth",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/learning"
    },
    {
      title: "Success Analytics",
      description: "Track your application success rate and get improvement insights",
      badge: "Data Driven",
      badgeColor: "bg-violet-500",
      stat: "Data Driven",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/resume/analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Complete TalentXcel Career Toolkit | AI Resume Builder & Career Tools</title>
        <meta name="description" content="Everything you need to build, optimize, and land your next role with AI. Complete career toolkit with resume builder, ATS optimizer, interview prep, and more." />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      
      {/* Apple-style Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-semibold text-gray-900">
              TalentXcel
            </Link>
            <div className="flex items-center space-x-8">
              <Link to="/resume/builder" className="text-gray-600 hover:text-gray-900 transition-colors">
                Resume Builder
              </Link>
              <Link to="/resume/templates" className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </Link>
              <Link to="/auth/login" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Apple-style Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
            Complete Career Toolkit.
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Everything you need to build, optimize, and land your next role with AI.
          </p>
          
          {/* Apple-style CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/resume/builder">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Building Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/resume/upload">
              <Button 
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300"
              >
                Upload Existing Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Apple-style Feature Preview */}
        <div className="mb-24">
          <div className="relative max-w-4xl mx-auto">
            <img
              src={resumePreview}
              alt="Professional resume preview showing Alex Johnson's resume with ATS optimization"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            
            {/* Floating Apple-style Badges */}
            <div className="absolute -left-8 top-1/4 transform -translate-y-1/2 hidden lg:block">
              <div className="bg-green-500 text-white px-6 py-3 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm">
                ATS Optimized
              </div>
            </div>
            
            <div className="absolute -right-8 top-1/3 transform -translate-y-1/2 hidden lg:block">
              <div className="bg-blue-500 text-white px-6 py-3 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI-Powered
              </div>
            </div>
          </div>
        </div>

        {/* Apple-style Tools Grid */}
        <div className="space-y-16">
          <div className="text-center">
            <h2 className="text-5xl font-semibold text-gray-900 mb-6 tracking-tight">
              Professional Career Tools.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete suite of AI-powered tools to accelerate your career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tools.map((tool, index) => (
              <Link key={index} to={tool.href}>
                <Card className="group hover:shadow-xl transition-all duration-500 cursor-pointer hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        {tool.icon}
                      </div>
                      <Badge className={`${tool.badgeColor} text-white text-xs px-3 py-1 rounded-full font-medium`}>
                        {tool.badge}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                        {tool.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm font-medium text-blue-600">
                        {tool.stat}
                      </span>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Apple-style Bottom CTA Section */}
        <div className="mt-32 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-16 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <h2 className="text-5xl font-semibold tracking-tight">
              Ready to transform your career?
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join thousands of professionals who've accelerated their careers with TalentXcel
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link to="/resume/builder">
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Start Free Now
                </Button>
              </Link>
              
              <Link to="/resume/templates">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  Explore Templates
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-12 text-blue-200 pt-8">
              <div className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-3" />
                Free to start
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-3" />
                No credit card required
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-3" />
                Join 10,000+ users
              </div>
            </div>
          </div>
          
          {/* Apple-style background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-1"></div>
        </div>
      </div>
    </div>
  );
};

export default ResumeNew;
