import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  Sparkles, 
  FileText, 
  Target, 
  BarChart3, 
  Mail, 
  Video, 
  Globe,
  TrendingUp,
  Zap,
  Crown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import talentxcelLogo from "@/assets/talentxcel-logo.webp";

const UnifiedResumeHub = () => {
  const navigate = useNavigate();

  const primaryActions = [
    {
      icon: Upload,
      title: "Upload Resume",
      description: "Instant precision enhancements",
      badge: "Fast Track",
      onClick: () => navigate("/resume/upload"),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Start from Scratch",
      description: "Guided performance builder",
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
      path: "/resume/CommandCenter",
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
      title: "CareerAnalytics",
      description: "Track resume performance",
      path: "/resume/CareerAnalytics",
      color: "text-orange-600"
    },
    {
      icon: Mail,
      title: "Cover Letters",
      description: "Context-aware cover letters",
      path: "/resume/cover-letter",
      color: "text-purple-600"
    },
    {
      icon: Video,
      title: "Interview Prep",
      description: "Practice with Navigator",
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
        <title>Resume Builder | Performance ATS-Optimized Resumes</title>
        <meta name="description" content="Build professional, ATS-optimized resumes with expert intelligence. Upload existing resumes or start from scratch with precision suggestions." />
        <link rel="canonical" href="https://talentxcel.in/resume" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 glass border-slate-100 text-primary px-4 py-2 rounded-full text-xs font-apple-bold uppercase tracking-widest mb-6">
              <Sparkles className="h-4 w-4" />
              TalentXcel Pro Resume Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-apple-bold mb-6 tracking-tighter text-slate-900">
              Build Your <br />
              <span className="text-gradient-pro">Perfect Resume</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8 font-apple-regular leading-relaxed">
              Create FAANG-approved, ATS-optimized resumes with advanced contextual intelligence.
            </p>
          </div>

          {/* High-Impact CareerAnalytics Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="glass-pro border-white/20 text-slate-900 overflow-hidden relative group transition-all duration-500 hover:shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">Profile Views</CardTitle>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-5xl font-apple-bold mt-2 tracking-tighter text-slate-900">1,284</div>
                <p className="text-green-600 text-xs flex items-center gap-1 mt-3 font-apple-bold">
                  <Sparkles className="w-3 h-3" /> +14% this week
                </p>
              </CardHeader>
            </Card>
            <Card className="glass-pro border-white/20 text-slate-900 overflow-hidden relative group transition-all duration-500 hover:shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">Precision Score</CardTitle>
                  <Crown className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-5xl font-apple-bold mt-2 text-purple-600 tracking-tighter">92/100</div>
                <p className="text-slate-500 text-xs mt-3 font-apple-medium">
                  Top 2% in Silicon Valley
                </p>
              </CardHeader>
            </Card>
            <Card className="glass-pro border-white/20 text-slate-900 overflow-hidden relative group transition-all duration-500 hover:shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">Interview Invites</CardTitle>
                  <Zap className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-5xl font-apple-bold mt-2 tracking-tighter text-slate-900">12</div>
                <p className="text-pink-600 text-xs flex items-center gap-1 mt-3 font-apple-bold">
                  <Target className="w-3 h-3" /> 3 High-Priority matches
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* Primary Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
            {primaryActions.map((action) => (
              <Card 
                key={action.title}
                className="relative overflow-hidden bg-white/5 backdrop-blur-md border-white/10 group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-3xl"
                onClick={action.onClick}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <action.icon className="h-7 w-7" />
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-3 py-1 text-xs">
                      {action.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl font-apple-bold mb-2">{action.title}</CardTitle>
                  <CardDescription className="text-lg text-slate-400 font-apple-regular">{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90 h-14 rounded-2xl text-lg font-apple-semibold shadow-xl shadow-primary/20" size="lg">
                    Build Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Templates Preview */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-apple-bold mb-2">Premium Pro Templates</h2>
                <p className="text-slate-400">FAANG-approved designs used by top professionals.</p>
              </div>
              <Button variant="outline" className="border-white/10 rounded-xl h-12 px-6">Explore All 50+</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Silicon Valley", category: "Tech Elite", score: 98 },
                { name: "Executive Slate", category: "Leadership", score: 95 },
                { name: "Creative Minimal", category: "Design", score: 92 },
                { name: "Modern Professional", category: "Corporate", score: 96 }
              ].map((template, i) => (
                <div key={i} className="group relative aspect-[3/4] bg-slate-900 rounded-3xl border border-white/10 overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-500 shadow-2xl hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <Button size="sm" className="bg-white text-slate-950 font-apple-semibold rounded-xl px-6">Preview Pro</Button>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-400 font-apple-semibold uppercase tracking-widest">{template.category}</p>
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] px-1.5 h-4">ATS {template.score}</Badge>
                    </div>
                    <h4 className="text-white font-apple-bold text-sm">{template.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-apple-bold mb-10 text-center">Navigator Toolkit</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card 
                  key={tool.title}
                  className="group cursor-pointer bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                  onClick={() => navigate(tool.path)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-white/5 group-hover:border-primary/30 transition-colors">
                        <tool.icon className={`h-6 w-6 ${tool.color}`} />
                      </div>
                      <CardTitle className="text-xl font-apple-semibold">{tool.title}</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400 font-apple-regular leading-relaxed">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Comparison */}
          <Card className="bg-slate-950 border border-white/10 overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 pointer-events-none" />
            <CardHeader className="text-center pt-10 relative z-10">
              <CardTitle className="text-3xl font-apple-bold mb-3 text-white">Why Professionals Choose TalentXcel</CardTitle>
              <CardDescription className="text-slate-400 text-lg">Beyond just a resume builder. A full career CommandCenter.</CardDescription>
            </CardHeader>
            <CardContent className="pb-10 relative z-10">
              <div className="grid md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto mt-8">
                <div>
                  <div className="text-5xl font-apple-bold text-blue-400 mb-3 tracking-tighter">95%</div>
                  <h4 className="text-white font-apple-semibold mb-2">ATS Pass Rate</h4>
                  <p className="text-slate-500 text-sm font-apple-regular">Tested against 45+ major tracking systems including Workday and Greenhouse.</p>
                </div>
                <div>
                  <div className="text-5xl font-apple-bold text-purple-400 mb-3 tracking-tighter">Core</div>
                  <h4 className="text-white font-apple-semibold mb-2">Contextual Intelligence</h4>
                  <p className="text-slate-500 text-sm font-apple-regular">Suggestions tailored to your specific industry, role, and career stage.</p>
                </div>
                <div>
                  <div className="text-5xl font-apple-bold text-pink-400 mb-3 tracking-tighter">24/7</div>
                  <h4 className="text-white font-apple-semibold mb-2">Live Support</h4>
                  <p className="text-slate-500 text-sm font-apple-regular">Expert career coaching and technical help whenever you need it.</p>
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




