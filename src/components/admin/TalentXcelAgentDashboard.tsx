import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Briefcase, 
  Building, 
  FileText, 
  Wrench, 
  GraduationCap, 
  Map, 
  TrendingUp,
  Activity,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Share2,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAgentActivityTracking } from '@/hooks/useAgentActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Pending' | 'Failed';
  module: string;
  frequency: string;
  keyKPI: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  status: 'Running' | 'Pending' | 'Completed' | 'Failed';
  frequency: string;
  lastRun?: string;
  nextRun?: string;
  completionRate?: number;
}

interface ModuleStats {
  name: string;
  activeAgents: number;
  completedTasks: number;
  pendingTasks: number;
  viralityScore: number;
  engagement: number;
}

const agentData: Agent[] = [
  {
    id: 'admin-bot',
    name: 'Admin Bot',
    role: 'Platform Operations',
    status: 'Active',
    module: 'All',
    frequency: 'As Needed',
    keyKPI: 'System uptime, fixes, task completions',
    tasks: [
      { id: '1', name: 'System Health Check', status: 'Running', frequency: 'Hourly' },
      { id: '2', name: 'Error Resolution', status: 'Completed', frequency: 'As Needed' }
    ]
  },
  {
    id: 'ananya',
    name: 'Ananya',
    role: 'Community Manager',
    status: 'Active',
    module: 'Network',
    frequency: 'Weekly',
    keyKPI: 'Engagement rate, connections suggested',
    tasks: [
      { id: '3', name: 'Auto-suggest connections', status: 'Running', frequency: '24/7' },
      { id: '4', name: 'Highlight trending posts', status: 'Running', frequency: 'Hourly' },
      { id: '5', name: 'Weekly viral challenges', status: 'Pending', frequency: 'Weekly' }
    ]
  },
  {
    id: 'meera',
    name: 'Meera',
    role: 'Mentorship Coordinator',
    status: 'Active',
    module: 'Network',
    frequency: 'Daily',
    keyKPI: 'Mentorship matches, milestone completions',
    tasks: [
      { id: '6', name: 'Match mentors with mentees', status: 'Running', frequency: 'Daily' },
      { id: '7', name: 'Send success story notifications', status: 'Completed', frequency: 'Daily' }
    ]
  },
  {
    id: 'raj',
    name: 'Raj',
    role: 'Job Matching AI',
    status: 'Active',
    module: 'Jobs',
    frequency: 'Daily',
    keyKPI: 'Job matches sent, alerts clicked',
    tasks: [
      { id: '8', name: 'Scan job postings', status: 'Running', frequency: '24/7' },
      { id: '9', name: 'Send personalized job alerts', status: 'Running', frequency: 'Daily' },
      { id: '10', name: 'Recommend skill upgrades', status: 'Running', frequency: 'Daily' }
    ]
  },
  {
    id: 'ishaan',
    name: 'Ishaan',
    role: 'Career Coach',
    status: 'Active',
    module: 'Jobs & Career Map',
    frequency: 'Daily',
    keyKPI: 'Skill suggestions accepted, career tips used',
    tasks: [
      { id: '11', name: 'Resume optimization suggestions', status: 'Running', frequency: '24/7' },
      { id: '12', name: 'Career milestone tracking', status: 'Running', frequency: 'Daily' }
    ]
  },
  {
    id: 'zoya',
    name: 'Zoya',
    role: 'Upskilling Advisor',
    status: 'Active',
    module: 'Learning & Jobs',
    frequency: 'Daily',
    keyKPI: 'Courses recommended, milestones completed',
    tasks: [
      { id: '13', name: 'Personalized course suggestions', status: 'Running', frequency: 'Daily' },
      { id: '14', name: 'Learning path optimization', status: 'Running', frequency: 'Daily' }
    ]
  },
  {
    id: 'nikki',
    name: 'Nikki',
    role: 'Learning Path Assistant',
    status: 'Active',
    module: 'Learning',
    frequency: 'Daily',
    keyKPI: 'Learning paths suggested, streaks maintained',
    tasks: [
      { id: '15', name: 'Generate learning content', status: 'Running', frequency: 'Daily' },
      { id: '16', name: 'Track learning streaks', status: 'Running', frequency: 'Daily' }
    ]
  },
  {
    id: 'sana',
    name: 'Sana',
    role: 'Content Creator',
    status: 'Active',
    module: 'Employer & Learning',
    frequency: 'Daily',
    keyKPI: 'Posts created, shares/likes',
    tasks: [
      { id: '17', name: 'Create trending content', status: 'Running', frequency: 'Daily' },
      { id: '18', name: 'Highlight company achievements', status: 'Running', frequency: 'Daily' }
    ]
  },
  {
    id: 'arjun',
    name: 'Arjun',
    role: 'Support Specialist',
    status: 'Active',
    module: 'Tools & Services',
    frequency: 'Daily',
    keyKPI: 'Tickets resolved, response time',
    tasks: [
      { id: '19', name: 'Auto-respond to inquiries', status: 'Running', frequency: '24/7' },
      { id: '20', name: 'Recommend platform tools', status: 'Running', frequency: 'Daily' }
    ]
  }
];

const moduleStats: ModuleStats[] = [
  { name: 'Network', activeAgents: 2, completedTasks: 145, pendingTasks: 3, viralityScore: 87, engagement: 94 },
  { name: 'Jobs', activeAgents: 2, completedTasks: 289, pendingTasks: 5, viralityScore: 92, engagement: 89 },
  { name: 'Employer & Companies', activeAgents: 1, completedTasks: 76, pendingTasks: 2, viralityScore: 78, engagement: 85 },
  { name: 'Resume Builder', activeAgents: 1, completedTasks: 198, pendingTasks: 1, viralityScore: 85, engagement: 92 },
  { name: 'Tools & Services', activeAgents: 1, completedTasks: 134, pendingTasks: 2, viralityScore: 71, engagement: 88 },
  { name: 'Learning & Colleges', activeAgents: 2, completedTasks: 167, pendingTasks: 4, viralityScore: 89, engagement: 96 },
  { name: 'Career Map & Passport', activeAgents: 1, completedTasks: 98, pendingTasks: 3, viralityScore: 83, engagement: 91 }
];

export const TalentXcelAgentDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState('Network');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { logAgentActivity } = useAgentActivityTracking();

  const modules = [
    { id: 'Network', icon: Users, name: 'Network', color: 'text-blue-600' },
    { id: 'Jobs', icon: Briefcase, name: 'Jobs', color: 'text-green-600' },
    { id: 'Employer', icon: Building, name: 'Employer & Companies', color: 'text-purple-600' },
    { id: 'Resume', icon: FileText, name: 'Resume Builder', color: 'text-orange-600' },
    { id: 'Tools', icon: Wrench, name: 'Tools & Services', color: 'text-red-600' },
    { id: 'Learning', icon: GraduationCap, name: 'Learning & Colleges', color: 'text-indigo-600' },
    { id: 'Career', icon: Map, name: 'Career Map & Passport', color: 'text-teal-600' },
    { id: 'Growth', icon: TrendingUp, name: 'Growth & Marketing', color: 'text-pink-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': case 'Running': case 'Completed': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'Failed': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': case 'Running': return <Activity className="h-3 w-3" />;
      case 'Completed': return <CheckCircle className="h-3 w-3" />;
      case 'Pending': return <Clock className="h-3 w-3" />;
      case 'Failed': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const toggleAgentExpansion = (agentId: string) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedAgents(newExpanded);
  };

  const refreshAllAgents = async () => {
    setIsRefreshing(true);
    try {
      await logAgentActivity({
        taskId: `refresh-${Date.now()}`,
        agentId: 'admin-dashboard',
        actionType: 'dashboard_refresh',
        description: 'Manual refresh of all agent statuses',
        level: 'info'
      });
      toast.success('Agent statuses refreshed');
    } catch (error) {
      toast.error('Failed to refresh agents');
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const filteredAgents = agentData.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || agent.status === statusFilter;
    const matchesModule = activeModule === 'All' || agent.module === activeModule || agent.module === 'All';
    return matchesSearch && matchesStatus && matchesModule;
  });

  const currentModuleStats = moduleStats.find(m => m.name === activeModule) || moduleStats[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">TalentXcel AI Agent Operations</h1>
              <p className="text-muted-foreground">24/7 AI-powered platform management & virality optimization</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAllAgents}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-700 rounded-full text-sm">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>

          {/* Module Tabs */}
          <Tabs value={activeModule} onValueChange={setActiveModule}>
            <TabsList className="grid grid-cols-8 w-full">
              {modules.map((module) => (
                <TabsTrigger key={module.id} value={module.name} className="flex items-center gap-2">
                  <module.icon className={`h-4 w-4 ${module.color}`} />
                  <span className="hidden md:inline">{module.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar: AI Agents */}
        <div className="w-80 border-r bg-card h-screen overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg mb-3">AI Agents</h2>
            
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleAgentExpansion(agent.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(agent.status)}>
                          {getStatusIcon(agent.status)}
                          {agent.status}
                        </Badge>
                        {expandedAgents.has(agent.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Module: {agent.module}</div>
                      <div>Freq: {agent.frequency}</div>
                    </div>

                    {expandedAgents.has(agent.id) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="text-xs text-muted-foreground">KPI: {agent.keyKPI}</div>
                        <div className="space-y-1">
                          {agent.tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                              <span>{task.name}</span>
                              <Badge variant="outline" className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Central Panel: Module Operations */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Module Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {modules.find(m => m.name === activeModule)?.icon && 
                    React.createElement(modules.find(m => m.name === activeModule)!.icon, { 
                      className: `h-5 w-5 ${modules.find(m => m.name === activeModule)?.color}` 
                    })
                  }
                  {activeModule} Operations
                </CardTitle>
                <CardDescription>24/7 AI tasks and virality optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{currentModuleStats.activeAgents}</div>
                    <div className="text-sm text-muted-foreground">Active Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{currentModuleStats.completedTasks}</div>
                    <div className="text-sm text-muted-foreground">Completed Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{currentModuleStats.pendingTasks}</div>
                    <div className="text-sm text-muted-foreground">Pending Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{currentModuleStats.viralityScore}%</div>
                    <div className="text-sm text-muted-foreground">Virality Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Active Tasks & Automation</CardTitle>
                <CardDescription>Real-time monitoring of {activeModule} AI operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAgents.flatMap(agent => agent.tasks).slice(0, 8).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          task.status === 'Running' ? 'bg-green-500 animate-pulse' :
                          task.status === 'Completed' ? 'bg-green-500' :
                          task.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-sm">{task.name}</div>
                          <div className="text-xs text-muted-foreground">Frequency: {task.frequency}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Virality Hooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Virality Hooks & Growth
                </CardTitle>
                <CardDescription>AI-driven viral growth mechanisms for {activeModule}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Active Campaigns</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                        <span className="text-sm">Weekly Challenges</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded">
                        <span className="text-sm">Achievement Sharing</span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700">Running</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Growth Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>External Shares</span>
                        <span className="font-medium">+23% ↗</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Referrals</span>
                        <span className="font-medium">+18% ↗</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Analytics */}
        <div className="w-80 border-l bg-card p-4 space-y-4">
          <h2 className="font-semibold text-lg">AI Growth & Analytics</h2>
          
          {/* Viral Campaign Bot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Viral Campaign Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Referrals Sent</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Rewards Claimed</span>
                <span className="font-medium">892</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Engagement Rate</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </CardContent>
          </Card>

          {/* Trend Hunter AI */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trend Hunter AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Topics Scanned</span>
                <span className="font-medium">2,156</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Posts Generated</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Engagement Score</span>
                <span className="font-medium text-blue-600">87%</span>
              </div>
            </CardContent>
          </Card>

          {/* Social Proof AI */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Social Proof AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Milestones Highlighted</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Top Performers</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>External Shares</span>
                <span className="font-medium text-purple-600">312</span>
              </div>
            </CardContent>
          </Card>

          {/* Live Analytics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Live Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Active Users/Hour</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Content Engagement</span>
                  <span className="font-medium text-green-600">96%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Virality Score</span>
                  <span className="font-medium text-blue-600">89%</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">Recent Alerts</div>
                <div className="space-y-1">
                  <div className="text-xs p-2 bg-green-500/10 text-green-700 rounded">
                    ✓ Viral post detected: +47% engagement
                  </div>
                  <div className="text-xs p-2 bg-blue-500/10 text-blue-700 rounded">
                    ↗ Referral spike: +23% new users
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};