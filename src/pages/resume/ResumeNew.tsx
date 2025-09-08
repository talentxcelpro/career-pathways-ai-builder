import React from 'react';
import { Helmet } from 'react-helmet-async';
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
      href: "/resume/dashboard"
    },
    {
      title: "Company Tools",
      description: "HR and recruiter tools for job posting and candidate management",
      badge: "For HR",
      badgeColor: "bg-pink-500",
      stat: "For HR",
      icon: <Users className="h-6 w-6" />,
      href: "/resume/company-tools"
    },
    {
      title: "Learning Hub",
      description: "Career development resources, courses, and skill assessments",
      badge: "Skill Growth",
      badgeColor: "bg-yellow-500",
      stat: "Skill Growth",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/resume/learning-hub"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Helmet>
        <title>Complete TalentXcel Career Toolkit | AI Resume Builder & Career Tools</title>
        <meta name="description" content="Everything you need to build, optimize, and land your next role with AI. Complete career toolkit with resume builder, ATS optimizer, interview prep, and more." />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Complete TalentXcel Career Toolkit
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Everything you need to build, optimize, and land your next role with AI
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/resume/builder'}
              >
                Start Building Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-white px-8 py-6 text-lg font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                onClick={() => window.location.href = '/resume/upload'}
              >
                Upload Existing Resume
              </Button>
            </div>
          </div>

          {/* Right Side - Resume Preview */}
          <div className="relative">
            <div className="relative max-w-md mx-auto">
              <img
                src={resumePreview}
                alt="Professional resume preview showing Alex Johnson's resume with ATS optimization"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              
              {/* Floating Badges */}
              <div className="absolute -left-4 top-1/4 transform -translate-y-1/2">
                <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-lg">
                  ATS Optimized
                </Badge>
              </div>
              
              <div className="absolute -right-4 top-1/3 transform -translate-y-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI-Power
                </Badge>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 transform translate-y-1/2">
                <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
                  Hired at Top
                  <Plane className="h-4 w-4" />
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Professional Career Tools
            </h2>
            <p className="text-xl text-slate-600">
              Complete suite of AI-powered tools to accelerate your career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border-slate-200 hover:border-blue-300"
                onClick={() => window.location.href = tool.href}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      {tool.icon}
                    </div>
                    <Badge className={`${tool.badgeColor} text-white text-xs px-2 py-1`}>
                      {tool.badge}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-blue-600">
                      {tool.stat}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of professionals who've accelerated their careers with TalentXcel
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/resume/builder'}
              >
                <Star className="mr-2 h-5 w-5" />
                Start Free Now
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300"
                onClick={() => window.location.href = '/resume/templates'}
              >
                Explore Templates
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-blue-200 pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Free to start
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Join 10,000+ users
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeNew;
