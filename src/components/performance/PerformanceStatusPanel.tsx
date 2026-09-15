import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTurbo } from '@/hooks/useTurbo';
import { Activity, Zap, Cpu, HardDrive, Shield, Activity as ActivityIcon, Radio, BarChart3, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const PerformanceStatusPanel: React.FC = () => {
  const { getMetrics } = useTurbo('PerformanceStatusPanel');
  const metrics = getMetrics();

  const getPerformanceGrade = (metric: number | undefined, thresholds: { good: number; needs: number }) => {
    if (!metric) return { grade: 'SYNCHRONIZING', color: 'slate' };
    if (metric <= thresholds.good) return { grade: 'OPTIMAL', color: 'emerald' };
    if (metric <= thresholds.needs) return { grade: 'NOMINAL', color: 'amber' };
    return { grade: 'CRITICAL', color: 'rose' };
  };

  const performanceMetrics = [
    {
      name: 'Platform Speed',
      value: metrics.renderTime,
      unit: 'ms',
      icon: Zap,
      grade: getPerformanceGrade(metrics.renderTime, { good: 16, needs: 50 }),
      description: 'Latency of platform interface synthesis'
    },
    {
      name: 'System Density',
      value: metrics.renderCount,
      unit: 'x',
      icon: ActivityIcon,
      grade: getPerformanceGrade(metrics.renderCount, { good: 50, needs: 100 }),
      description: 'Component frequency per platform cycle'
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-[40px] bg-slate-950 border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none rotate-12">
           <Cpu className="h-48 w-48 text-blue-500" />
        </div>
        
        <div className="flex items-center justify-between mb-10 relative z-10">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                 <h3 className="text-xl font-apple-heavy text-white tracking-tight">Engine Monitor</h3>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-apple-bold text-slate-500 uppercase tracking-widest">TalentXcel Diagnostics</span>
                 </div>
              </div>
           </div>
           <Badge className="bg-white/5 text-slate-400 border border-white/10 rounded-lg px-2 py-0.5 font-apple-heavy text-[9px] tracking-widest uppercase">REAL-TIME</Badge>
        </div>

        <div className="grid gap-6 relative z-10">
          {performanceMetrics.map((metric, i) => (
            <motion.div 
               key={metric.name} 
               initial={{ x: -20, opacity: 0 }} 
               animate={{ x: 0, opacity: 1 }} 
               transition={{ delay: i * 0.1 }}
               className="p-6 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <metric.icon className="h-5 w-5 text-blue-400" />
                   </div>
                   <div>
                      <h4 className="text-sm font-apple-heavy text-white">{metric.name}</h4>
                      <p className="text-[10px] font-apple-medium text-slate-500 leading-relaxed max-w-[200px]">{metric.description}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xl font-apple-heavy text-white tracking-tighter">
                      {metric.value ? `${Math.round(metric.value)}${metric.unit}` : 'SYNCHRONIZING'}
                   </p>
                   <span className={cn(
                     "text-[8px] font-apple-heavy px-2 py-0.5 rounded-md uppercase tracking-widest mt-2 inline-block",
                     metric.grade.color === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
                     metric.grade.color === 'amber' ? "bg-amber-500/10 text-amber-400" :
                     metric.grade.color === 'rose' ? "bg-rose-500/10 text-rose-400" : "bg-white/5 text-slate-400"
                   )}>
                      {metric.grade.grade}
                   </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card className="rounded-[40px] bg-white border border-slate-200/50 p-8 shadow-xl relative overflow-hidden">
         <div className="flex items-center gap-3 mb-6">
            <HardDrive className="h-4 w-4 text-slate-400" />
            <h4 className="text-[10px] font-apple-heavy text-slate-400 uppercase tracking-widest">Memory Allocation</h4>
         </div>
         <div className="space-y-4">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-2xl font-apple-heavy text-slate-950 tracking-tighter">42.8 <span className="text-xs text-slate-400 font-apple-bold uppercase">MB</span></p>
                  <p className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest mt-0.5">Heap Synchronized</p>
               </div>
               <Badge className="bg-slate-100 text-slate-500 border-0 rounded-lg px-2 py-0.5 font-apple-bold text-[8px] uppercase tracking-widest">SAFE RANGE</Badge>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '42.8%' }} className="h-full bg-blue-600 rounded-full" />
            </div>
            <div className="flex justify-between text-[8px] font-apple-heavy text-slate-300 uppercase tracking-widest">
               <span>0 MB</span>
               <span>Available Platform Memory</span>
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
         {[
           { label: 'Security Protection', value: 'AES-256', icon: Shield },
           { label: 'Platform Uptime', value: '99.98%', icon: Clock }
         ].map((feat, i) => (
           <Card key={i} className="rounded-[32px] bg-white border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
              <feat.icon className="h-5 w-5 text-blue-600 mb-3" />
              <p className="text-[9px] font-apple-heavy text-slate-400 uppercase tracking-widest mb-1">{feat.label}</p>
              <h5 className="text-sm font-apple-heavy text-slate-950">{feat.value}</h5>
           </Card>
         ))}
      </div>
    </div>
  );
};