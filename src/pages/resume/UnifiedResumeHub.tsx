import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Sparkles, FileText, Target, BarChart3, Mail, Video, Globe } from "lucide-react";
import { Helmet } from "react-helmet-async";
import talentxcelLogo from "@/assets/talentxcel-logo.webp";

const UnifiedResumeHub = () => {
  const navigate = useNavigate();

  const primaryActions = [
    {
      icon: Upload,
      title: "Upload Resume",
      description: "Get instant AI improvements",
      badge: "Fast Track",
      onClick: () => navigate("/resume/upload"),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Start from Scratch",
      description: "AI-guided resume builder",
      badge: "Most Popular",
      onClick: () => navigate("/resume/build"),
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const tools = [
    {
      icon: FileText,
      title: "My Resumes",
      description: "View & manage all resumes",
      path: "/resume/dashboard",
      color: "text-blue-600"
    },
    {
      icon: Target,
      title: "ATS Checker",
      description: "Optimize for job systems",
      path: "/resume/ats-check",
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track resume performance",
      path: "/resume/analytics",
      color: "text-orange-600"
    },
    {
      icon: Mail,
      title: "Cover Letters",
      description: "AI-powered cover letters",
      path: "/resume/cover-letter",
      color: "text-purple-600"
    },
    {
      icon: Video,
      title: "Interview Prep",
      description: "Practice with AI coach",
      path: "/resume/interview-prep",
      color: "text-red-600"
    },
    {
      icon: Globe,
      title: "Portfolio",
      description: "Build your web presence",
      path: "/resume/portfolio",
      color: "text-teal-600"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Resume Builder | AI-Powered ATS-Optimized Resumes</title>
        <meta name="description" content="Build professional, ATS-optimized resumes with AI assistance. Upload existing resumes or start from scratch with intelligent suggestions." />
        <link rel="canonical" href="https://talentxcel.in/resume" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Logo in top-left corner */}
          <div className="absolute top-6 left-6">
            <img 
              src={talentxcelLogo} 
              alt="TalentXcel Logo" 
              className="h-10 w-10 object-contain"
            />
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              TalentXcel AI-Powered Resume Builder
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Build Your Perfect Resume
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create ATS-optimized resumes with AI assistance. Stand out from the competition and land your dream job.
            </p>
          </div>

          {/* Primary Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
            {primaryActions.map((action) => (
              <Card 
                key={action.title}
                className="relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={action.onClick}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {action.badge}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{action.title}</CardTitle>
                  <CardDescription className="text-base">{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full group-hover:scale-105 transition-transform" size="lg">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tools Grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Career Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card 
                  key={tool.title}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate(tool.path)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <tool.icon className={`h-8 w-8 ${tool.color}`} />
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Features */}
          <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Why Choose TalentXcel?</CardTitle>
              <CardDescription>Built by career experts, powered by AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">95%</div>
                  <p className="text-sm text-muted-foreground">ATS Pass Rate</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">50+</div>
                  <p className="text-sm text-muted-foreground">Professional Templates</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">AI</div>
                  <p className="text-sm text-muted-foreground">Powered Intelligence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UnifiedResumeHub;
