import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, Zap, Plane, FileText, Upload, Target, PenTool, 
  Video, Globe, TrendingUp, BarChart3, Users, BookOpen, 
  Sparkles, CheckCircle, ArrowRight, Star, Brain, Shield,
  MessageSquare, Coffee, Calendar, Award
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
      icon: <FileText className="h-5 w-5" />,
      href: "/resume/templates"
    },
    {
      title: "Upload & Parse",
      description: "Upload your existing resume and let AI extract and improve the content",
      badge: "AI Powered",
      badgeColor: "bg-blue-500",
      stat: "AI Powered",
      icon: <Upload className="h-5 w-5" />,
      href: "/resume-builder/upload-enhanced"
    },
    {
      title: "AI Resume Builder",
      description: "Build your resume from scratch with AI assistance and smart suggestions",
      badge: "🔥 Most Popular",
      badgeColor: "bg-orange-500",
      stat: "Most Popular",
      icon: <Sparkles className="h-5 w-5" />,
      href: "/resume/builder"
    },
    {
      title: "ATS Optimizer",
      description: "Check and optimize your resume for Applicant Tracking Systems",
      badge: "95% Pass Rate",
      badgeColor: "bg-green-500",
      stat: "95% Pass Rate",
      icon: <Target className="h-5 w-5" />,
      href: "/tools/resume-check"
    },
    {
      title: "Cover Letter AI",
      description: "Generate personalized cover letters that match your resume perfectly",
      badge: "New",
      badgeColor: "bg-purple-500",
      stat: "AI Generated",
      icon: <PenTool className="h-5 w-5" />,
      href: "/tools/cover-letter"
    },
    {
      title: "Interview Prep",
      description: "Practice with AI-powered mock interviews tailored to your industry",
      badge: "AI Trainer",
      badgeColor: "bg-cyan-500",
      stat: "Mock Interviews",
      icon: <Video className="h-5 w-5" />,
      href: "/tools/interview-prep"
    },
    {
      title: "LinkedIn Optimizer",
      description: "Optimize your LinkedIn profile to attract recruiters and opportunities",
      badge: "Pro Feature",
      badgeColor: "bg-blue-600",
      stat: "3x More Views",
      icon: <Globe className="h-5 w-5" />,
      href: "/tools/profile-optimizer"
    },
    {
      title: "Salary Analyzer",
      description: "Get data-driven insights for successful salary negotiations",
      badge: "Market Data",
      badgeColor: "bg-emerald-500",
      stat: "Real-time Data",
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/tools/salary-analyzer"
    },
    {
      title: "Skills Assessment",
      description: "Identify skill gaps and get personalized learning recommendations",
      badge: "Skill Builder",
      badgeColor: "bg-amber-500",
      stat: "Gap Analysis",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/tools/skill-assessor"
    },
    {
      title: "Job Matcher AI",
      description: "Get AI-powered job recommendations based on your profile and preferences",
      badge: "Smart Match",
      badgeColor: "bg-violet-500",
      stat: "Perfect Matches",
      icon: <Brain className="h-5 w-5" />,
      href: "/tools/job-matcher"
    },
    {
      title: "Career Analytics",
      description: "Track your job search progress and get actionable insights",
      badge: "Analytics",
      badgeColor: "bg-indigo-500",
      stat: "Success Metrics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/career-goals"
    },
    {
      title: "Networking Assistant",
      description: "Build professional relationships with AI-powered networking strategies",
      badge: "Smart Connect",
      badgeColor: "bg-pink-500",
      stat: "Network Growth",
      icon: <Users className="h-5 w-5" />,
      href: "/network"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <Helmet>
        <title>Resume Builder - Complete TalentXcel Career Toolkit | AI-Powered Resume Creation</title>
        <meta name="description" content="Everything you need to build, optimize, and land your next role with AI. Create professional resumes with our intelligent resume builder." />
        <meta name="keywords" content="resume builder, AI resume, career toolkit, job application, professional resume, ATS optimized" />
        <link rel="canonical" href="https://talentxcel.in/resume" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Main Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
            Complete TalentXcel
            <br />
            Career Toolkit
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Everything you need to build, optimize, and land your next role with AI
          </p>

          {/* Primary Action Buttons */}
          <div className="space-y-3 md:space-y-4 mb-8 md:mb-16 px-4">
            <Link to="/resume" className="block">
              <Button 
                size="lg"
                className="w-full max-w-md h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Start Building Resume
                <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </Link>
            
            <Link to="/resume/upload" className="block">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full max-w-md h-12 md:h-14 text-base md:text-lg font-semibold border-2 border-border hover:bg-muted/50 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <Upload className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                Upload Existing Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Resume Preview Section */}
        <div className="relative px-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-4 md:p-8">
              <div className="relative max-w-xs md:max-w-md mx-auto">
                {/* Resume Preview Image */}
                <div className="bg-white rounded-xl shadow-lg p-3 md:p-6 relative">
                  <img 
                    src={resumePreview} 
                    alt="Professional Resume Preview - Alex Johnson" 
                    className="w-full h-auto rounded-lg"
                    loading="eager"
                  />
                  
                  {/* Floating Badges */}
                  <div className="absolute -top-1 md:-top-2 -left-1 md:-left-2">
                    <Badge className="bg-green-500 text-white font-semibold px-2 md:px-3 py-1 rounded-full shadow-lg text-xs md:text-sm">
                      ATS Optimized
                    </Badge>
                  </div>
                  
                  <div className="absolute -bottom-1 md:-bottom-2 -right-1 md:-right-2">
                    <Badge className="bg-blue-500 text-white font-semibold px-3 md:px-4 py-1 md:py-2 rounded-full shadow-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                      <span className="text-sm md:text-lg">⚡</span>
                      AI-Power
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16 mb-20">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>95% ATS Pass Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>50+ Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Used by 100k+ Professionals</span>
            </div>
          </div>
        </div>

        {/* Complete Career Toolkit - 12 Tools Grid */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Career Toolkit
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to accelerate your career journey with AI-powered tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Link key={index} to={tool.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {tool.icon}
                      </div>
                      <Badge className={`${tool.badgeColor} text-white text-xs px-2 py-1`}>
                        {tool.badge}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <span className="text-xs font-medium text-primary">
                        {tool.stat}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeNew;