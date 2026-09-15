import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Compass, Target, TrendingUp, Clock, Award, MapPin, 
  ArrowRight, CheckCircle, Star, Users, Zap, Shield, 
  Sparkles, Activity, Layers, Brain, Sparkle, Globe,
  ArrowUpRight, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const Pathfinder = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [pathsGenerated, setPathsGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const careerPaths = [
    {
      id: 1, title: "Principal Solution Architect", match: 94, timeline: "18-24 months",
      salary: "$180k - $240k", growth: "Exponential", demand: "Elite",
      steps: ["Master distributed system architecture", "Lead cross-functional intelligence strategy", "Optimize enterprise-scale performance nodes", "Mentor strategic engineering leads"],
      skills: ["System Design", "Cloud Arch", "Strategic Leadership", "Node.js", "K8s"],
      companies: ["TalentXcel", "NVIDIA", "OpenAI", "Anthropic"]
    },
    {
      id: 2, title: "Intelligence Strategy Lead", match: 88, timeline: "24-30 months",
      salary: "$160k - $210k", growth: "High Velocity", demand: "Premium",
      steps: ["Architect multi-market intelligence roadmaps", "Synthesize user intelligence signals", "Lead strategic discovery cycles", "Optimize conversion matrices"],
      skills: ["Strategic Discovery", "Product Architecture", "Market Intelligence", "Agile"],
      companies: ["Apple", "Stripe", "Linear", "Vercel"]
    },
    {
      id: 3, title: "Engineering Director", match: 91, timeline: "3-4 years",
      salary: "$220k - $300k", growth: "Sustained", demand: "Critical",
      steps: ["Design organizational engineering matrices", "Execute global technical recruitment", "Manage high-performance department budgets", "Establish cultural engineering standards"],
      skills: ["Org Design", "Budgeting", "Talent Acquisition", "Conflict Resolution"],
      companies: ["Google", "Meta", "Amazon", "Netflix"]
    }
  ];

  const handleGeneratePaths = () => {
    if (!currentRole.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setPathsGenerated(true);
      setGenerating(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center shadow-2xl">
              <Compass className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-apple-heavy text-slate-950 tracking-tight leading-none">Pathfinder</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-600 text-white border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[9px] uppercase tracking-widest">INTELLIGENCE ACTIVE</Badge>
                <span className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Trajectory Discovery Engine</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {!pathsGenerated ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-apple-heavy tracking-tighter text-slate-950 mb-6 leading-tight">Map Your Professional Evolution</h2>
              <p className="text-xl font-apple-medium text-slate-500 leading-relaxed">
                Provide your professional parameters to architect a strategic roadmap tailored to your performance baseline.
              </p>
            </div>

            <Card className="rounded-[48px] bg-white border border-slate-200/50 p-12 shadow-2xl relative overflow-hidden">
               {generating ? (
                 <div className="py-20 text-center space-y-8">
                    <div className="relative h-24 w-24 mx-auto">
                       <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full" />
                       <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                       <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                       <h3 className="text-3xl font-apple-heavy text-slate-950 tracking-tight">Synchronizing Intelligence</h3>
                       <p className="text-slate-400 font-apple-medium text-lg mt-2">Discovering high-fidelity roadmaps across the global ecosystem...</p>
                    </div>
                    <div className="max-w-md mx-auto h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5 }} className="h-full bg-blue-600 shadow-lg" />
                    </div>
                 </div>
               ) : (
                 <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Current Role</label>
                          <Input 
                             placeholder="e.g. Senior Product Architect" 
                             className="h-16 rounded-[20px] bg-slate-50 border-slate-100 text-slate-950 placeholder:text-slate-300 font-apple-heavy text-lg focus:border-blue-500/50 transition-all"
                             value={currentRole}
                             onChange={(e) => setCurrentRole(e.target.value)}
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Core Skills</label>
                          <Input 
                             placeholder="e.g. TypeScript, System Design, AI" 
                             className="h-16 rounded-[20px] bg-slate-50 border-slate-100 text-slate-950 placeholder:text-slate-300 font-apple-heavy text-lg focus:border-blue-500/50 transition-all"
                             value={skills}
                             onChange={(e) => setSkills(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest ml-1">Strategic Interest</label>
                       <Input 
                          placeholder="e.g. High-growth startups, Technical Leadership, Deep Tech" 
                          className="h-16 rounded-[20px] bg-slate-50 border-slate-100 text-slate-950 placeholder:text-slate-300 font-apple-heavy text-lg focus:border-blue-500/50 transition-all"
                          value={interests}
                          onChange={(e) => setInterests(e.target.value)}
                       />
                    </div>
                    <Button 
                       onClick={handleGeneratePaths}
                       disabled={!currentRole.trim()}
                       className="w-full h-20 rounded-[28px] bg-slate-950 text-white font-apple-heavy text-xl hover:scale-[1.02] transition-all shadow-2xl shadow-slate-950/20"
                    >
                       Discover Evolution Roadmaps <ArrowRight className="ml-3 h-7 w-7" />
                    </Button>
                 </div>
               )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: 'Intelligence Analysis', desc: 'Projected market value evolution.', icon: TrendingUp },
                 { title: 'Performance Roadmap', desc: 'Step-by-step capability indexing.', icon: MapPin },
                 { title: 'Ecosystem Velocity', desc: 'Real-time hiring demand metrics.', icon: Activity }
               ].map((feat, i) => (
                 <div key={i} className="p-10 rounded-[40px] bg-white border border-slate-100 text-center hover:shadow-2xl transition-all border group">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                       <feat.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-apple-heavy text-slate-950 text-lg mb-3 tracking-tight">{feat.title}</h3>
                    <p className="text-sm font-apple-medium text-slate-500 leading-relaxed">{feat.desc}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <div>
                <h2 className="text-4xl font-apple-heavy text-slate-950 tracking-tighter leading-none">Recommended Roadmaps</h2>
                <p className="text-xl text-slate-500 font-apple-medium mt-3">High-fidelity roadmaps optimized for your performance identity.</p>
              </div>
              <Button variant="ghost" onClick={() => setPathsGenerated(false)} className="rounded-2xl h-14 px-8 font-apple-heavy bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                Update Parameters <Target className="ml-3 h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-10">
              {careerPaths.map((path, idx) => (
                <motion.div key={path.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}>
                  <Card className="rounded-[48px] bg-white border border-slate-200/50 p-12 shadow-2xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative border">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                      <Zap className="h-64 w-64 text-blue-600" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                          <div className="flex items-center gap-4 mb-3">
                             <h3 className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">{path.title}</h3>
                             <Badge className="bg-blue-600 text-white border-0 rounded-xl h-8 px-4 font-apple-heavy text-[10px] tracking-widest">{path.match}% PERFORMANCE MATCH</Badge>
                          </div>
                          <div className="flex items-center gap-8">
                             <span className="flex items-center gap-3 text-xs font-apple-bold text-slate-400 uppercase tracking-widest"><Clock className="h-5 w-5" /> {path.timeline}</span>
                             <span className="flex items-center gap-3 text-xs font-apple-bold text-slate-400 uppercase tracking-widest"><TrendingUp className="h-5 w-5" /> {path.salary}</span>
                             <span className="flex items-center gap-3 text-xs font-apple-bold text-emerald-600 uppercase tracking-widest"><Sparkles className="h-5 w-5" /> {path.growth} Evolution</span>
                          </div>
                        </div>
                        <Badge className="bg-slate-100 text-slate-500 border-0 rounded-2xl h-10 px-6 font-apple-heavy text-xs uppercase tracking-widest">{path.demand} Demand</Badge>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-10 border-t border-slate-100">
                        <div>
                           <h4 className="text-[11px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-8 flex items-center">
                              <Layers className="h-5 w-5 text-blue-600 mr-3" /> Strategic Execution
                           </h4>
                           <div className="space-y-6">
                              {path.steps.map((step, sidx) => (
                                <div key={sidx} className="flex items-start gap-6 group/step">
                                   <div className="h-8 w-8 rounded-xl bg-slate-50 text-slate-950 flex items-center justify-center font-apple-heavy text-xs mt-0.5 group-hover/step:bg-blue-600 group-hover/step:text-white transition-all shadow-inner">
                                      {sidx + 1}
                                   </div>
                                   <p className="text-base font-apple-medium text-slate-600 leading-relaxed">{step}</p>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-10">
                           <div>
                              <h4 className="text-[11px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-6">Required Capabilities</h4>
                              <div className="flex flex-wrap gap-3">
                                 {path.skills.map((skill, skidx) => (
                                   <Badge key={skidx} className="bg-slate-50 text-slate-600 border border-slate-100 rounded-xl h-10 px-6 font-apple-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                      {skill}
                                   </Badge>
                                 ))}
                              </div>
                           </div>
                           <div>
                              <h4 className="text-[11px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-6">Target Ecosystem Matrices</h4>
                              <div className="flex flex-wrap gap-3">
                                 {path.companies.map((company, cidx) => (
                                   <Badge key={cidx} className="bg-white text-slate-400 border border-slate-100 rounded-xl h-10 px-6 font-apple-bold text-xs shadow-sm">
                                      {company}
                                   </Badge>
                                 ))}
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 mt-12 pt-10 border-t border-slate-100">
                         <Button variant="ghost" className="rounded-2xl h-14 px-10 font-apple-heavy bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-950 transition-all">
                            Analyze Deep Details
                         </Button>
                         <Button className="rounded-2xl h-14 px-10 font-apple-heavy bg-slate-950 text-white shadow-2xl hover:scale-105 transition-all text-base">
                            Initialize Sync <ArrowUpRight className="ml-3 h-5 w-5" />
                         </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Pathfinder;
