import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentRecommendations } from '@/components/intelligent/ContentRecommendations';
import { SmartNotifications } from '@/components/intelligent/SmartNotifications';
import { OnlineUsersWidget } from '@/components/presence/OnlineUsersWidget';
import { EnhancedNotificationCenter } from '@/components/engagement/EnhancedNotificationCenter';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  Briefcase,
  Play,
  Bell,
  BarChart3,
  Activity,
  Target,
  Zap,
  Brain,
  Compass,
  ChevronRight
} from 'lucide-react';

interface IntelligentCommandCenterProps {
  className?: string;
  currentModule?: 'reels' | 'network' | 'jobs' | 'profile';
}

export const IntelligentCommandCenter: React.FC<IntelligentCommandCenterProps> = ({
  className,
  currentModule = 'network'
}) => {
  const [activeTab, setActiveTab] = useState('recommendations');

  const getModuleStats = () => {
    return {
      reels: { engagement: 87, views: 15420, trending: 12 },
      network: { engagement: 92, TalentNetwork: 847, trending: 8 },
      jobs: { engagement: 78, matches: 23, trending: 5 }
    };
  };

  const stats = getModuleStats();

  return (
    <div className={cn("space-y-8", className)}>
      {/* Intelligence Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-pro border-white/20 shadow-xl overflow-hidden group">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Strategic Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">
                  {stats[currentModule]?.engagement || 85}%
                </span>
                <Badge className="bg-purple-500/10 text-purple-600 border-none px-2 py-0.5 font-apple-heavy text-[9px] uppercase tracking-widest">
                  Optimal
                </Badge>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                  style={{ width: `${stats[currentModule]?.engagement || 85}%` }}
                />
              </div>
              <p className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">
                Machine learning model active
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-pro border-white/20 shadow-xl overflow-hidden group">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Real-time Signal
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">
                    {currentModule === 'reels' ? '8.4K' : currentModule === 'network' ? '912' : '1.2K'}
                  </span>
                  <p className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest mt-1">
                    {currentModule === 'reels' ? 'Active Viewers' : currentModule === 'network' ? 'Syncing Now' : 'Live Matches'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-apple-heavy text-emerald-600 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-apple-bold text-slate-500 uppercase tracking-widest">
                  {currentModule === 'reels' ? 'Global reach expanding' : 'Intelligent matchmaking active'}
                </p>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-pro border-white/20 shadow-xl overflow-hidden group">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Target Precision
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">
                  94%
                </span>
                <Badge className="bg-blue-500/10 text-blue-600 border-none px-2 py-0.5 font-apple-heavy text-[9px] uppercase tracking-widest">
                  High Fit
                </Badge>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[94%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              </div>
              <p className="text-[10px] font-apple-bold text-slate-400 uppercase tracking-widest">
                Relevance improving via Pulseback
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Intelligence Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex h-14 w-full items-center justify-start gap-8 bg-transparent border-b border-slate-100 rounded-none px-0">
          {[
            { id: 'recommendations', label: 'Discover', icon: Compass },
            { id: 'notifications', label: 'Alerts', icon: Bell },
            { id: 'presence', label: 'Presence', icon: Users },
            { id: 'engagement', label: 'Activity', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className={cn(
                  "relative h-full px-0 bg-transparent border-none shadow-none rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none group",
                  active ? "text-primary" : "text-slate-400 hover:text-slate-950"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", active ? "text-primary" : "text-slate-400")} />
                  <span className="text-xs font-apple-bold uppercase tracking-[0.1em]">{tab.label}</span>
                </div>
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-scale-in" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-8">
          <TabsContent value="recommendations" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ContentRecommendations module="reels" maxItems={4} className="lg:col-span-1" />
              <ContentRecommendations module="network" maxItems={4} className="lg:col-span-1" />
              <ContentRecommendations module="jobs" maxItems={4} className="lg:col-span-1" />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SmartNotifications maxItems={8} />
              </div>
              <div className="space-y-6">
                <Card className="glass-pro border-white/20 p-6 shadow-xl rounded-[32px]">
                  <h3 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mb-6">Signals Insight</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Click Rate', value: '78%', trend: '+4%' },
                      { label: 'Relevance', value: '91%', trend: 'Steady' },
                      { label: 'Total Today', value: '12', trend: 'Normal' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-white">
                        <span className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">{item.label}</span>
                        <div className="text-right">
                          <p className="text-sm font-apple-bold text-slate-950">{item.value}</p>
                          <p className="text-[9px] font-apple-heavy text-emerald-500">{item.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="bg-slate-900 text-white p-6 shadow-xl rounded-[32px]">
                  <h3 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-500 mb-6">Quick Response</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-apple-bold text-white hover:bg-white/10 rounded-xl px-4 py-6">
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-blue-400" />
                        Management Settings
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-30" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-apple-bold text-white hover:bg-white/10 rounded-xl px-4 py-6">
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-emerald-400" />
                        Refine Preferences
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-30" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presence" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OnlineUsersWidget maxUsers={12} showModule={true} currentModule={currentModule} />
              </div>
              <div className="space-y-6">
                <Card className="glass-pro border-white/20 p-6 shadow-xl rounded-[32px]">
                  <h3 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mb-6">Presence Matrix</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">Peak Velocity</p>
                        <p className="text-sm font-apple-bold text-slate-950">9-11 AM, 6-8 PM</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">Top Module</span>
                        <Badge className="bg-primary/10 text-primary border-none font-apple-heavy text-[9px] uppercase tracking-widest">Network</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">Engagement Momentum</span>
                        <span className="text-sm font-apple-bold text-emerald-600">+23%</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="glass-pro border-white/20 p-6 shadow-xl rounded-[32px]">
                  <h3 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mb-6">Operational Spread</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Strategic Reels', value: 35, color: 'bg-purple-500' },
                      { label: 'Professional Network', value: 45, color: 'bg-blue-500' },
                      { label: 'Job Pipeline', value: 20, color: 'bg-emerald-500' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-apple-heavy uppercase tracking-widest">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="text-slate-950">{item.value}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6 outline-none">
            <EnhancedNotificationCenter />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};


