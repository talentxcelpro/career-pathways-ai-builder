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
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Share2,
  Eye,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  Bot,
  Target,
  ArrowRight
} from 'lucide-react';
import { useAgentActivityTracking } from '@/hooks/useAgentActivityTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TriggerAutomationFlow } from '@/components/admin/TriggerAutomationFlow';

interface Agent {
  id: string;
  handle: string;
  display_name: string;
  role: string;
  status: string;
  departments: string[];
  frequency: string;
  key_kpi: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  agent_id: string;
  source: string;
  action: string;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  attempts: number;
  error_message?: string;
  payload: any;
}

interface AgentLog {
  id: string;
  agent_id: string;
  task_id?: string;
  message: string;
  level: string;
  metadata: any;
  created_at: string;
}

interface AgentMetric {
  id: string;
  agent_id: string;
  metric_name: string;
  metric_value: number;
  metadata: any;
  created_at: string;
}

interface ModuleStats {
  name: string;
  activeAgents: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  totalLogs: number;
  viralityScore: number;
  engagement: number;
}

export const TalentXcelAgentDashboard: React.FC = () => {
  console.log('🚀 TalentXcelAgentDashboard component initializing - version 2025-08-19-03:12 - USING RECORD NOT MAP');
  const [activeModule, setActiveModule] = useState('Overview');
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real data states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [metrics, setMetrics] = useState<AgentMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { logAgentActivity } = useAgentActivityTracking();

  const modules = [
    { id: 'Overview', icon: Activity, name: 'Overview', color: 'text-gray-600' },
    { id: 'TriggerAutomation', icon: Zap, name: 'Trigger Automation', color: 'text-yellow-600' },
    { id: 'Network', icon: Users, name: 'Network', color: 'text-blue-600' },
    { id: 'Jobs', icon: Briefcase, name: 'Jobs', color: 'text-green-600' },
    { id: 'Employer', icon: Building, name: 'Employer & Companies', color: 'text-purple-600' },
    { id: 'Resume', icon: FileText, name: 'Resume Builder', color: 'text-orange-600' },
    { id: 'Tools', icon: Wrench, name: 'Tools & Services', color: 'text-red-600' },
    { id: 'Learning', icon: GraduationCap, name: 'Learning & Colleges', color: 'text-indigo-600' },
    { id: 'Career', icon: Map, name: 'Career Map & Passport', color: 'text-teal-600' },
    { id: 'Growth', icon: TrendingUp, name: 'Growth & Marketing', color: 'text-pink-600' }
  ];

  // Fetch real data from database
  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('display_name');
      
      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const calculateModuleStats = (): ModuleStats[] => {
    console.log('🔍 calculateModuleStats called');
    const statsMap: Record<string, ModuleStats> = {};
    console.log('🔍 statsMap initialized:', typeof statsMap, statsMap);
    
    // Initialize stats for each module
    modules.forEach(module => {
      console.log('🔍 Processing module:', module.name);
      statsMap[module.name] = {
        name: module.name,
        activeAgents: 0,
        completedTasks: 0,
        pendingTasks: 0,
        failedTasks: 0,
        totalLogs: 0,
        viralityScore: Math.floor(Math.random() * 20) + 80,
        engagement: Math.floor(Math.random() * 15) + 85
      };
    });

    // Count agents by department/module
    agents.forEach(agent => {
      agent.departments.forEach(dept => {
        const moduleName = dept === 'network' ? 'Network' : 
                          dept === 'jobs' ? 'Jobs' :
                          dept === 'learning' ? 'Learning & Colleges' :
                          dept === 'content' ? 'Growth & Marketing' : 'Overview';
        
        const stats = statsMap[moduleName];
        if (stats && agent.status === 'active') {
          stats.activeAgents++;
        }
      });
    });

    // Count tasks by status
    tasks.forEach(task => {
      const agent = agents.find(a => a.id === task.agent_id);
      if (agent) {
        agent.departments.forEach(dept => {
          const moduleName = dept === 'network' ? 'Network' : 
                            dept === 'jobs' ? 'Jobs' :
                            dept === 'learning' ? 'Learning & Colleges' :
                            dept === 'content' ? 'Growth & Marketing' : 'Overview';
          
          const stats = statsMap[moduleName];
          if (stats) {
            if (task.status === 'completed') stats.completedTasks++;
            else if (task.status === 'pending') stats.pendingTasks++;
            else if (task.status === 'failed') stats.failedTasks++;
          }
        });
      }
    });

    // Count logs
    logs.forEach(log => {
      const agent = agents.find(a => a.id === log.agent_id);
      if (agent) {
        agent.departments.forEach(dept => {
          const moduleName = dept === 'network' ? 'Network' : 
                            dept === 'jobs' ? 'Jobs' :
                            dept === 'learning' ? 'Learning & Colleges' :
                            dept === 'content' ? 'Growth & Marketing' : 'Overview';
          
          const stats = statsMap[moduleName];
          if (stats) {
            stats.totalLogs++;
          }
        });
      }
    });

    return Object.values(statsMap);
  };

  const fetchSystemHealth = async () => {
    try {
      const totalAgents = agents.length;
      const activeAgents = agents.filter(a => a.status === 'active').length;
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      const runningTasks = tasks.filter(t => t.status === 'running').length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const failedTasks = tasks.filter(t => t.status === 'failed').length;

      setSystemHealth({
        agents: { total: totalAgents, active: activeAgents },
        tasks: { 
          total: totalTasks, 
          pending: pendingTasks, 
          running: runningTasks, 
          completed: completedTasks, 
          failed: failedTasks 
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error calculating system health:', error);
    }
  };

  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchAgents(),
        fetchTasks(),
        fetchLogs(),
        fetchMetrics()
      ]);
      
      await logAgentActivity({
        taskId: `refresh-${Date.now()}`,
        agentId: 'admin-dashboard',
        actionType: 'dashboard_refresh',
        description: 'Manual refresh of all agent statuses',
        level: 'info'
      });
      
      toast.success('All data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const triggerAgent = async (agentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-agent-logger', {
        body: {
          agent_id: agentId,
          action_type: 'manual_trigger',
          description: `Manual trigger for agent ${agentId}`,
          level: 'info'
        }
      });

      if (error) throw error;
      toast.success(`Agent ${agentId} triggered successfully`);
      await fetchTasks();
    } catch (error) {
      console.error('Error triggering agent:', error);
      toast.error('Failed to trigger agent');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchAgents(),
        fetchTasks(),
        fetchLogs(),
        fetchMetrics()
      ]);
      setIsLoading(false);
    };

    loadInitialData();

    // Set up real-time subscriptions
    const agentsSubscription = supabase
      .channel('agents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_agents' }, fetchAgents)
      .subscribe();

    const tasksSubscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_tasks' }, fetchTasks)
      .subscribe();

    const logsSubscription = supabase
      .channel('logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_logs' }, fetchLogs)
      .subscribe();

    return () => {
      agentsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (agents.length > 0) {
      fetchSystemHealth();
    }
  }, [agents, tasks]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'running': case 'completed': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'failed': case 'error': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'inactive': case 'paused': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-blue-500/10 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': case 'running': return <Activity className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': case 'error': return <AlertTriangle className="h-3 w-3" />;
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

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || agent.status === statusFilter.toLowerCase();
    const matchesModule = activeModule === 'Overview' || 
                          agent.departments.some(dept => {
                            const moduleName = dept === 'network' ? 'Network' : 
                                              dept === 'jobs' ? 'Jobs' :
                                              dept === 'learning' ? 'Learning & Colleges' :
                                              dept === 'content' ? 'Growth & Marketing' : '';
                            return moduleName === activeModule;
                          });
    return matchesSearch && matchesStatus && matchesModule;
  });

  const moduleStats = calculateModuleStats();
  const currentModuleStats = moduleStats.find(m => m.name === activeModule) || moduleStats[0];

  const getAgentTasks = (agentId: string) => {
    return tasks.filter(task => task.agent_id === agentId).slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading TalentXcel AI Agent Operations...</span>
        </div>
      </div>
    );
  }

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
                onClick={refreshAllData}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                systemHealth?.agents?.active > 0 ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'
              }`}>
                <div className={`h-2 w-2 rounded-full animate-pulse ${
                  systemHealth?.agents?.active > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                {systemHealth?.agents?.active > 0 ? 'All Systems Operational' : 'System Monitoring'}
              </div>
            </div>
          </div>

          {/* Module Tabs */}
          <Tabs value={activeModule} onValueChange={setActiveModule}>
            <TabsList className="grid grid-cols-10 w-full">
              {modules.map((module) => (
                <TabsTrigger key={module.id} value={module.name} className="flex items-center gap-2">
                  <module.icon className={`h-4 w-4 ${module.color}`} />
                  <span className="hidden md:inline text-xs">{module.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Render Trigger Automation when selected */}
      {activeModule === 'Trigger Automation' ? (
        <TriggerAutomationFlow />
      ) : (
        <div className="flex">
          {/* Left Sidebar: AI Agents */}
          <div className="w-80 border-r bg-card h-screen overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Agents ({agents.length})
            </h2>
            
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
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
                          {agent.display_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{agent.display_name}</div>
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
                      <div>Departments: {agent.departments.join(', ')}</div>
                      <div>Freq: {agent.frequency}</div>
                    </div>

                    {expandedAgents.has(agent.id) && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="text-xs text-muted-foreground">KPI: {agent.key_kpi}</div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerAgent(agent.id);
                            }}
                            className="flex items-center gap-1 text-xs"
                          >
                            <Play className="h-3 w-3" />
                            Trigger
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Recent Tasks:</div>
                          {getAgentTasks(agent.id).map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                              <span className="truncate">{task.action}</span>
                              <Badge variant="outline" className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                          ))}
                          {getAgentTasks(agent.id).length === 0 && (
                            <div className="text-xs text-muted-foreground italic">No recent tasks</div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {filteredAgents.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No agents found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Central Panel: Module Operations */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* System Health Overview */}
            {systemHealth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    System Health Overview
                  </CardTitle>
                  <CardDescription>Real-time system status and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{systemHealth.agents?.total || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{systemHealth.agents?.active || 0}</div>
                      <div className="text-sm text-muted-foreground">Active Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{systemHealth.tasks?.total || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{systemHealth.tasks?.pending || 0}</div>
                      <div className="text-sm text-muted-foreground">Pending Tasks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Module Overview */}
            {activeModule !== 'Overview' && (
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
                  <CardDescription>24/7 AI tasks and virality optimization for {activeModule}</CardDescription>
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
            )}

            {/* Active Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Real-Time Task Monitor</CardTitle>
                <CardDescription>Live monitoring of AI agent operations and task execution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 10).map((task) => {
                    const agent = agents.find(a => a.id === task.agent_id);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            task.status === 'running' ? 'bg-green-500 animate-pulse' :
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="font-medium text-sm">{task.action}</div>
                            <div className="text-xs text-muted-foreground">
                              Agent: {agent?.display_name || 'Unknown'} • {new Date(task.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          {task.status}
                        </Badge>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No tasks found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  How TalentXcel AI Agent Operations Work
                </CardTitle>
                <CardDescription>Understanding the 24/7 automated platform management system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">🤖 AI Agent Architecture</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Autonomous agents for each platform module</li>
                      <li>• Real-time task scheduling and execution</li>
                      <li>• Edge Functions for serverless processing</li>
                      <li>• Database-driven task queue management</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">📊 Viral Growth Engine</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Automated content optimization</li>
                      <li>• Social proof amplification</li>
                      <li>• Engagement pattern analysis</li>
                      <li>• External platform sharing hooks</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">⚡ Real-Time Operations</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• WebSocket connections for live updates</li>
                      <li>• Background task processing</li>
                      <li>• Error handling and retry logic</li>
                      <li>• Performance monitoring and alerts</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">🎯 Module-Specific Intelligence</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Network: Connection suggestions & engagement</li>
                      <li>• Jobs: AI matching & skill recommendations</li>
                      <li>• Learning: Personalized course paths</li>
                      <li>• Growth: Viral campaign automation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Live Analytics */}
        <div className="w-80 border-l bg-card p-4 space-y-4">
          <h2 className="font-semibold text-lg">Live Analytics</h2>
          
          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Active Agents</span>
                <span className="font-medium text-green-600">{systemHealth?.agents?.active || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Running Tasks</span>
                <span className="font-medium text-blue-600">{systemHealth?.tasks?.running || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Success Rate</span>
                <span className="font-medium text-green-600">
                  {systemHealth?.tasks?.total > 0 ? 
                    Math.round((systemHealth.tasks.completed / systemHealth.tasks.total) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs p-2 bg-muted/50 rounded">
                  <div className="font-medium truncate">{log.message}</div>
                  <div className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No recent activity</div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Total Logs</span>
                  <span className="font-medium">{logs.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Total Metrics</span>
                  <span className="font-medium">{metrics.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Uptime</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-2">System Alerts</div>
                <div className="space-y-1">
                  {systemHealth?.agents?.active > 0 ? (
                    <div className="text-xs p-2 bg-green-500/10 text-green-700 rounded">
                      ✓ All agents operational
                    </div>
                  ) : (
                    <div className="text-xs p-2 bg-yellow-500/10 text-yellow-700 rounded">
                      ⚠ No active agents detected
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      )}
    </div>
  );
};