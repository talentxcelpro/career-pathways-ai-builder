import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Users, Eye, Send, TrendingUp, Calendar, Building,
  Mail, Target, Zap, Shield, Sparkles, Activity, Briefcase,
  ArrowUpRight, Clock, MapPin, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CommandCenterStats {
  activeJobs: number;
  totalApplications: number;
  profileViews: number;
  emailsSent: number;
  responseRate: number;
}

export const EmployerCommandCenter = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CommandCenterStats>({
    activeJobs: 0, totalApplications: 0, profileViews: 0, emailsSent: 0, responseRate: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchCommandCenterData();
  }, [user]);

  const fetchCommandCenterData = async () => {
    if (!user) return;
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        supabase.from('jobs').select('*').eq('posted_by', user.id).eq('is_active', true).order('created_at', { ascending: false }).limit(5),
        supabase.from('job_applications').select('*, jobs(title, id)').eq('jobs.posted_by', user.id).order('created_at', { ascending: false }).limit(10)
      ]);
      if (jobsResponse.data) {
        setRecentJobs(jobsResponse.data);
        setStats(prev => ({
          ...prev, activeJobs: jobsResponse.data.length,
          totalApplications: jobsResponse.data.reduce((sum, job) => sum + (job.applications_count || 0), 0),
          profileViews: jobsResponse.data.reduce((sum, job) => sum + (job.views_count || 0), 0)
        }));
      }
      if (applicationsResponse.data) setRecentApplications(applicationsResponse.data);
    } catch (error) { toast.error('Signal transmission failed.'); } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
      <div className="fixed top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      {/* Premium Business Header */}
      <header className="sticky top-0 z-50 glass-pro border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Building className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Business Hub</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-100 text-blue-700 border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[9px] uppercase tracking-widest">ENTERPRISE SIGNAL</Badge>
                <span className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">Active Talent Acquisition Node</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button asChild className="rounded-2xl h-14 px-8 font-apple-heavy bg-slate-950 text-white shadow-2xl shadow-slate-950/20 hover:scale-105 transition-all">
               <Link to="/employer/jobs/new">
                 <Plus className="mr-2 h-5 w-5" /> Deploy New Signal
               </Link>
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Recruitment Matrix Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Matrix', value: stats.activeJobs, icon: Briefcase, color: 'blue' },
            { label: 'Intelligence Metrics', value: stats.totalApplications, icon: Users, color: 'purple' },
            { label: 'Node Visibility', value: stats.profileViews, icon: Eye, color: 'emerald' },
            { label: 'Growth Velocity', value: `${stats.responseRate}%`, icon: Activity, color: 'orange' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[32px] border-white/20 bg-white/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50 group hover:-translate-y-1 transition-all duration-300">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                  stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                  stat.color === 'purple' ? "bg-purple-50 text-purple-600" :
                  stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                )}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">{stat.value}</h3>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Strategic Actions & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="signals" className="space-y-8">
              <div className="flex items-center justify-between">
                <TabsList className="bg-white/40 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50">
                  <TabsTrigger value="signals" className="rounded-xl px-6 font-apple-bold data-[state=active]:bg-slate-950 data-[state=active]:text-white">Live Signals</TabsTrigger>
                  <TabsTrigger value="applicants" className="rounded-xl px-6 font-apple-bold data-[state=active]:bg-slate-950 data-[state=active]:text-white">Active Talent</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="signals">
                <div className="grid gap-6">
                  {recentJobs.map(job => (
                    <motion.div key={job.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <Card className="rounded-[32px] border-white/20 bg-white/60 backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all group border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-6">
                            <div className="h-14 w-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white shrink-0">
                               <Zap className="h-7 w-7" />
                            </div>
                            <div>
                               <h3 className="text-xl font-apple-heavy text-slate-950 mb-1 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                               <div className="flex items-center gap-4 text-xs font-apple-bold text-slate-400 uppercase tracking-widest">
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(job.created_at).toLocaleDateString()}</span>
                                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.applications_count || 0} Signals</span>
                               </div>
                            </div>
                          </div>
                          <Button asChild variant="ghost" className="rounded-xl h-12 px-6 font-apple-bold bg-slate-50 border border-slate-100">
                             <Link to={`/employer/jobs/${job.id}`}>Manage <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="applicants">
                <div className="grid gap-6">
                  {recentApplications.map(app => (
                    <Card key={app.id} className="rounded-[32px] border-white/20 bg-white/60 backdrop-blur-xl p-8 shadow-xl border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-apple-heavy text-xl">
                             {app.application_data?.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                             <h3 className="text-lg font-apple-heavy text-slate-950 mb-1">{app.application_data?.fullName || 'Signal Detected'}</h3>
                             <p className="text-sm font-apple-medium text-slate-500">Matching with: <span className="text-slate-950 font-apple-bold">{app.jobs?.title}</span></p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-lg px-3 py-1 font-apple-bold text-[10px] uppercase tracking-widest">NEW SIGNAL</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[40px] bg-slate-950 p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <Target className="h-24 w-24" />
               </div>
               <h3 className="text-2xl font-apple-heavy mb-8 tracking-tight">Matrix Insights</h3>
               <div className="space-y-6">
                  {[
                    { label: 'Time to Synchronize', value: '12.4 Days', icon: Clock },
                    { label: 'Signal Integrity', value: 'High', icon: Shield },
                    { label: 'Engagement Index', value: '84%', icon: Activity }
                  ].map((insight, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                       <div className="flex items-center gap-3">
                         <insight.icon className="h-4 w-4 text-blue-400" />
                         <span className="text-xs font-apple-bold text-slate-400 uppercase tracking-widest">{insight.label}</span>
                       </div>
                       <span className="text-sm font-apple-heavy">{insight.value}</span>
                    </div>
                  ))}
               </div>
               <Button className="w-full mt-10 rounded-2xl bg-white text-slate-950 font-apple-heavy h-14 hover:scale-[1.02] transition-all">
                  Deep Intelligence Matrix
               </Button>
            </Card>

            <Card className="rounded-[40px] bg-blue-600 p-10 text-white shadow-2xl">
               <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                 <Sparkles className="h-6 w-6" />
               </div>
               <h3 className="text-2xl font-apple-heavy mb-4">Signal Outreach</h3>
               <p className="font-apple-medium text-blue-100 leading-relaxed mb-8">
                 Launch a high-velocity outreach campaign to 2.4k verified Intelligence Metrics matching your current requirements.
               </p>
               <Button asChild variant="ghost" className="w-full rounded-2xl bg-white/10 hover:bg-white/20 border-0 font-apple-heavy h-14">
                 <Link to="/employer/outreach">Initialize Outreach</Link>
               </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployerCommandCenter;
