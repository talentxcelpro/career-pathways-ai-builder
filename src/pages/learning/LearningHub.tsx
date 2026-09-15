import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Target, Award, Flame, TrendingUp, BarChart3, 
  Lightbulb, Users, CheckCircle, Clock, Star, ArrowRight, 
  Play, Zap, Shield, Sparkles, Activity, Layers, Brain, 
  Globe, ArrowUpRight, Briefcase, Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LearningHub() {
  const stats = [
    { label: "Skill Modules", value: "150+", icon: Layers, color: 'blue' },
    { label: "Capability Tracks", value: "12", icon: Target, color: 'purple' },
    { label: "Daily Intensity", value: "8 Days", icon: Flame, color: 'orange' },
    { label: "Talent Score Pulse", value: "94%", icon: Activity, color: 'emerald' }
  ];

  const capabilityTracks = [
    {
      title: "Full Stack Mastery",
      detail: "Master high-performance distributed systems and modern web architectures.",
      icon: Layers,
      color: "blue",
      progress: 65
    },
    {
      title: "AI Product Strategy",
      detail: "Learn to build and scale AI-driven professional intelligence tools.",
      icon: Brain,
      color: "purple",
      progress: 42
    },
    {
      title: "Leadership & Culture",
      detail: "Architect high-performance teams and professional organizational identity.",
      icon: Target,
      color: "emerald",
      progress: 15
    }
  ];

  const featuredSignals = [
    { title: "Advanced Neural Architectures", students: "1.2k", level: "Elite", duration: "45h", rating: 4.9 },
    { title: "Strategic Market Synthesis", students: "840", level: "Senior", duration: "32h", rating: 4.8 },
    { title: "High-Fidelity UI Design", students: "2.4k", level: "Advanced", duration: "28h", rating: 4.7 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-[24px] bg-slate-950 flex items-center justify-center shadow-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">Skill Hub</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-600 text-white border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[9px] uppercase tracking-widest">TALENTXCEL ACADEMY</Badge>
                <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Capability Indexing & Verification</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Button asChild variant="ghost" className="rounded-2xl h-14 px-8 font-apple-heavy bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
               <Link to="/learning/my-courses">My Repository</Link>
             </Button>
             <Button asChild className="rounded-2xl h-14 px-8 font-apple-heavy bg-slate-950 text-white shadow-2xl shadow-slate-950/20 hover:scale-105 transition-all">
               <Link to="/learning/courses">Explore Modules</Link>
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Capability Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[40px] border-slate-200 bg-white/80 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all group border">
                <div className={cn(
                  "h-14 w-14 rounded-[20px] flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm",
                  stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                  stat.color === 'purple' ? "bg-purple-50 text-purple-600" :
                  stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                )}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-4xl font-apple-heavy text-slate-950 tracking-tighter">{stat.value}</h3>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Roadmaps & Next Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Active Capability Roadmaps</h2>
              <Button variant="ghost" className="text-xs font-apple-heavy text-blue-600 hover:text-blue-700 uppercase tracking-widest">Global Index</Button>
            </div>
            
            <div className="grid gap-6">
              {capabilityTracks.map((track, i) => (
                <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }}>
                  <Card className="rounded-[40px] border-slate-200 bg-white/80 backdrop-blur-xl p-10 shadow-xl border group hover:shadow-2xl transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-start gap-6">
                        <div className={cn(
                          "h-20 w-20 rounded-[28px] flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110",
                          track.color === 'blue' ? "bg-blue-600 text-white shadow-blue-500/20" :
                          track.color === 'purple' ? "bg-purple-600 text-white shadow-purple-500/20" : "bg-emerald-600 text-white shadow-emerald-500/20"
                        )}>
                          <track.icon className="h-10 w-10" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-apple-heavy text-slate-950 mb-2">{track.title}</h3>
                          <p className="text-base font-apple-medium text-slate-500 leading-relaxed max-w-sm">{track.detail}</p>
                        </div>
                      </div>
                      <div className="w-full md:w-64 space-y-4">
                         <div className="flex justify-between text-[11px] font-apple-heavy text-slate-400 uppercase tracking-widest">
                            <span>Synchronization</span>
                            <span>{track.progress}%</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${track.progress}%` }} 
                              className="h-full bg-slate-950 rounded-full" 
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                         </div>
                         <Button className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-950 font-apple-bold text-sm hover:bg-slate-100 transition-all">Continue Execution</Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
             <Card className="rounded-[48px] bg-slate-950 p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                   <Award className="h-24 w-24" />
                </div>
                <h3 className="text-2xl font-apple-heavy mb-8 tracking-tight">Verified Credentials</h3>
                <div className="space-y-6">
                   {[
                     { label: 'Cloud Architecture', date: 'Oct 2023', icon: Shield },
                     { label: 'Strategic Product', date: 'Sep 2023', icon: Zap },
                     { label: 'Engineering Lead', date: 'Aug 2023', icon: Star }
                   ].map((cert, i) => (
                     <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                           <cert.icon className="h-5 w-5 text-blue-400" />
                           <span className="text-xs font-apple-heavy text-slate-300 uppercase tracking-widest">{cert.label}</span>
                        </div>
                        <span className="text-[10px] font-apple-heavy text-slate-500">{cert.date}</span>
                     </div>
                   ))}
                </div>
                <Button className="w-full mt-10 rounded-2xl bg-white text-slate-950 font-apple-heavy h-16 hover:scale-[1.02] transition-all shadow-xl">
                   Market Identity Passport
                </Button>
             </Card>

             <Card className="rounded-[40px] bg-blue-600 p-10 text-white shadow-2xl group hover:shadow-blue-500/20 transition-all">
                <div className="h-14 w-14 bg-white/20 rounded-[20px] flex items-center justify-center mb-6">
                   <Brain className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-apple-heavy mb-4">Intelligence Feed</h3>
                <p className="font-apple-medium text-blue-100 text-lg leading-relaxed mb-8">
                   Index your professional growth by aligning your capability roadmaps with real-time market signals.
                </p>
                <Button asChild variant="ghost" className="w-full rounded-2xl bg-white/10 hover:bg-white/20 border-0 font-apple-heavy h-16 text-lg">
                   <Link to="/navigator">Synchronize Identity</Link>
                </Button>
             </Card>
          </div>
        </div>

        {/* Featured Modules */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Premium Skill Modules</h2>
              <Link to="/learning/courses" className="text-xs font-apple-heavy text-blue-600 hover:scale-105 transition-all">VIEW ALL REPOSITORIES</Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredSignals.map((signal, i) => (
                <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 + i * 0.1 }}>
                  <Card className="rounded-[40px] border-slate-200 bg-white/80 backdrop-blur-xl p-10 shadow-xl hover:shadow-2xl transition-all border group">
                    <div className="flex justify-between items-start mb-8">
                       <Badge className="bg-slate-100 text-slate-500 border-0 rounded-lg px-3 py-1 font-apple-bold text-[9px] uppercase tracking-widest">{signal.level} tier</Badge>
                       <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-amber-500 fill-current" />
                          <span className="text-xs font-apple-heavy text-slate-950">{signal.rating}</span>
                       </div>
                    </div>
                    <h3 className="text-xl font-apple-heavy text-slate-950 mb-4 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">{signal.title}</h3>
                    <div className="flex items-center gap-6 text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-10">
                       <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {signal.students}</span>
                       <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {signal.duration}</span>
                    </div>
                    <Button className="w-full h-14 rounded-2xl bg-slate-950 text-white font-apple-heavy text-sm hover:scale-[1.02] transition-all shadow-xl">
                       Initialize Module <ArrowUpRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}
