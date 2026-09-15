import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Target,
  Calendar,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Plus,
  Bot,
  Sparkles,
  Trophy,
  Zap
} from 'lucide-react';
import { CareerPassportCard } from '@/components/profile/CareerPassportCard';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useNavigatorContext } from '@/components/ai/NavigatorProvider';

export function StudentCommandCenter() {
  const { careerPassport, getNextMilestone } = useCareerPassport();
  const { openNavigator } = useNavigatorContext();
  const nextMilestone = getNextMilestone();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-black rounded-[32px] p-10 border border-white/10 shadow-2xl group transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-50 group-hover:opacity-70 transition-opacity" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-4">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md px-3 py-1 text-xs font-apple-medium mb-2">
              <Sparkles className="w-3 h-3 mr-2 text-yellow-400" />
              Performance CareerIntelligence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-apple-bold text-white tracking-tighter leading-none">
              Your Professional <br />
              <span className="text-gradient-pro">
                CommandCenter
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md font-apple-regular">
              Analyze your career trajectory, discover high-impact modules, and build your professional legacy.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button
              onClick={() => openNavigator('CommandCenter')}
              size="lg"
              className="bg-white text-slate-950 hover:bg-slate-200 rounded-xl px-8 h-14 font-apple-semibold shadow-xl"
            >
              <Bot className="h-5 w-5 mr-2" />
              Ask TalentXcel Navigator
            </Button>
            <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 12.4k Active</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> 98% Match</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* High-Performance Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Resumes', count: careerPassport?.resumes_count || 0, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { icon: Briefcase, label: 'Applied', count: careerPassport?.jobs_applied_count || 0, color: 'text-green-400', bg: 'bg-green-400/10' },
              { icon: GraduationCap, label: 'Skills', count: careerPassport?.certifications_count || 0, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { icon: Award, label: 'Score', count: careerPassport?.career_readiness_score || 0, color: 'text-orange-400', bg: 'bg-orange-400/10' }
            ].map((stat, i) => (
              <Card key={i} className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all cursor-default overflow-hidden group">
                <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardContent className="p-6 text-center relative z-10">
                  <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-3xl font-bold text-white mb-1">{stat.count}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-apple-semibold">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Career Insights & Roadmap */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden group">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-pink-400" />
                  AI Career Roadmap
                </CardTitle>
                <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">Alpha</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent" />
                <div className="space-y-8 pl-10">
                  <div className="relative">
                    <div className="absolute -left-12 top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                    <h4 className="text-white font-apple-semibold">Optimize Your Professional Identity</h4>
                    <p className="text-slate-400 text-sm mt-1">AI suggests updating your technical skills to include "Generative AI" for a 40% higher match rate.</p>
                  </div>
                  <div className="relative opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="absolute -left-12 top-0 w-4 h-4 rounded-full bg-slate-700" />
                    <h4 className="text-slate-300 font-apple-semibold">Expand Your Network Tier</h4>
                    <p className="text-slate-500 text-sm mt-1">Connect with 5 senior developers in your field to unlock "Mentor Match" features.</p>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 shadow-lg shadow-blue-600/20">
                Generate Full Roadmap
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Module Discovery Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-apple-bold text-white">Featured Modules</h3>
              <Button variant="link" className="text-blue-400 text-sm hover:text-blue-300">View All 100+</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: FileText, label: 'Resume Builder', sub: 'AI-Guided', color: 'from-blue-500 to-blue-600' },
                { icon: Zap, label: 'Skill Assessor', sub: 'Pro Vetting', color: 'from-purple-500 to-purple-600' },
                { icon: Users, label: 'Smart Connect', sub: 'AI Networking', color: 'from-green-500 to-green-600' },
                { icon: Briefcase, label: 'Job Matcher', sub: 'Reverse Search', color: 'from-orange-500 to-orange-600' },
                { icon: BookOpen, label: 'Learning Hub', sub: 'Curated Paths', color: 'from-cyan-500 to-cyan-600' },
                { icon: Trophy, label: 'Rewards', sub: 'Play & Earn', color: 'from-pink-500 to-pink-600' }
              ].map((module, i) => (
                <Button key={i} variant="outline" className="h-24 bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 flex flex-col items-center justify-center gap-1 group rounded-2xl p-0 overflow-hidden">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${module.color} text-white mb-1 group-hover:scale-110 transition-transform`}>
                    <module.icon className="h-5 w-5" />
                  </div>
                  <span className="text-white text-xs font-apple-semibold">{module.label}</span>
                  <span className="text-[10px] text-slate-500 font-apple-regular">{module.sub}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CareerPassportCard />
          
          {/* Intelligence CommandCenter Card */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
            <CardHeader className="bg-blue-600/10 border-b border-white/5">
              <CardTitle className="text-sm font-apple-bold text-blue-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Industry Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 uppercase tracking-widest font-apple-semibold">
                    <span>Market Demand</span>
                    <span className="text-green-400">+12% High</span>
                  </div>
                  <Progress value={85} className="h-1.5 bg-white/5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 uppercase tracking-widest font-apple-semibold">
                    <span>Skill Competition</span>
                    <span className="text-blue-400">Moderate</span>
                  </div>
                  <Progress value={45} className="h-1.5 bg-white/5" />
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs text-slate-400 font-apple-regular">
                  <span className="text-yellow-400 font-apple-bold">Trending:</span> Cloud Architecture is seeing a massive surge in the Bangalore region this week.
                </p>
              </div>
              
              <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-xl h-10 text-xs">
                View Full Intelligence Report
              </Button>
            </CardContent>
          </Card>

          {/* Achievement Progress */}
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-none overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-none">Level 14</Badge>
              </div>
              <h3 className="text-white font-apple-bold text-lg mb-1">Rising Talent</h3>
              <p className="text-white/70 text-sm font-apple-regular mb-4">You're in the top 5% of active job seekers this month.</p>
              <Progress value={72} className="h-2 bg-white/20" />
              <p className="text-white/60 text-[10px] mt-2 text-right">720 / 1000 XP to Level 15</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



