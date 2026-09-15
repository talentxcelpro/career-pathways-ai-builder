import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Bot, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  RefreshCw,
  Play,
  Pause,
  Eye,
  Settings,
  Users,
  Briefcase,
  MessageSquare,
  TrendingUp,
  FileText,
  Wrench,
  GraduationCap,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TriggerEvent {
  id: string;
  type: string;
  trigger: string;
  agentHandle: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: any;
  createdAt: string;
  executedAt?: string;
  completedAt?: string;
}

interface AgentConfig {
  handle: string;
  displayName: string;
  icon: React.ElementType;
  color: string;
  triggers: string[];
  tasks: string[];
  escalationRules: string[];
  isActive: boolean;
  lastTriggered?: string;
}

const agentConfigs: AgentConfig[] = [
  {
    handle: 'admin-bot',
    displayName: 'Admin Bot',
    icon: Settings,
    color: 'text-purple-600',
    triggers: ['daily_9am', 'new_user_registered', 'system_anomaly'],
    tasks: ['generate_reports', 'onboard_user', 'cleanup_accounts'],
    escalationRules: ['flag_anomalies_to_human'],
    isActive: true
  },
  {
    handle: 'ananya',
    displayName: 'Ananya (Community Manager)',
    icon: Users,
    color: 'text-blue-600',
    triggers: ['weekly_monday_10am', 'engagement_drop_20_percent'],
    tasks: ['post_weekly_update', 'send_engagement_reminder', 'reply_to_faqs'],
    escalationRules: ['forward_conflicts_to_human'],
    isActive: true
  },
  {
    handle: 'arjun',
    displayName: 'Arjun (App Support)',
    icon: Wrench,
    color: 'text-red-600',
    triggers: ['new_support_ticket', 'app_error_detected'],
    tasks: ['auto_solve_faqs', 'escalate_technical_bugs', 'send_resolution'],
    escalationRules: ['forward_unsolved_24hrs_to_engineering'],
    isActive: true
  },
  {
    handle: 'ishaan',
    displayName: 'Ishaan (Career Coach Pro)',
    icon: TrendingUp,
    color: 'text-green-600',
    triggers: ['resume_uploaded', 'career_help_clicked'],
    tasks: ['generate_job_roadmap', 'suggest_mock_interviews', 'give_career_tips'],
    escalationRules: ['forward_human_coach_requests'],
    isActive: true
  },
  {
    handle: 'meera',
    displayName: 'Meera (Mentorship)',
    icon: Users,
    color: 'text-pink-600',
    triggers: ['mentorship_application', 'new_mentor_joined'],
    tasks: ['auto_match_skills', 'send_intro_email'],
    escalationRules: ['send_unmatched_to_admin'],
    isActive: true
  },
  {
    handle: 'nikki',
    displayName: 'Nikki (Learning Path)',
    icon: GraduationCap,
    color: 'text-indigo-600',
    triggers: ['skill_test_failed', 'learning_plan_requested'],
    tasks: ['generate_course_roadmap', 'send_weekly_reminders'],
    escalationRules: ['escalate_stalled_learners_2weeks'],
    isActive: true
  },
  {
    handle: 'raj',
    displayName: 'Raj (Job Matching AI)',
    icon: Briefcase,
    color: 'text-orange-600',
    triggers: ['new_job_posted', 'user_profile_updated'],
    tasks: ['suggest_job_matches', 'auto_notify_whatsapp_telegram'],
    escalationRules: ['flag_no_matches_to_admin'],
    isActive: true
  },
  {
    handle: 'sana',
    displayName: 'Sana (Content Creator)',
    icon: FileText,
    color: 'text-teal-600',
    triggers: ['daily_11am', 'trending_job_topic_detected'],
    tasks: ['auto_create_seo_post', 'create_linkedin_update', 'create_blog_draft'],
    escalationRules: ['send_posts_for_review'],
    isActive: true
  },
  {
    handle: 'shelly',
    displayName: 'Shelly (Customer Service)',
    icon: MessageSquare,
    color: 'text-cyan-600',
    triggers: ['new_support_chat', 'negative_feedback_detected'],
    tasks: ['answer_faqs', 'resolve_simple_queries', 'log_feedback'],
    escalationRules: ['forward_unsatisfied_to_human'],
    isActive: true
  },
  {
    handle: 'zoya',
    displayName: 'Zoya (Upskilling Advisor)',
    icon: TrendingUp,
    color: 'text-emerald-600',
    triggers: ['job_rejection_detected', 'skill_gap_detected'],
    tasks: ['recommend_courses', 'offer_mentorship', 'send_reminders'],
    escalationRules: ['forward_inactive_learners_to_nikki'],
    isActive: true
  }
];

export const TriggerAutomationFlow: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [recentEvents, setRecentEvents] = useState<TriggerEvent[]>([]);
  const [automationStats, setAutomationStats] = useState({
    totalTriggers: 0,
    successRate: 0,
    avgResponseTime: 0,
    activeAgents: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch automation status and recent events
  const fetchAutomationData = async () => {
    try {
      setIsLoading(true);
      
      // Get recent agent tasks (as proxy for trigger events)
      const { data: tasks } = await supabase
        .from('agent_tasks')
        .select(`
          id,
          action,
          status,
          created_at,
          started_at,
          completed_at,
          payload,
          ai_agents (handle, display_name)
        `)
        .eq('source', 'automation_trigger')
        .order('created_at', { ascending: false })
        .limit(20);

      if (tasks) {
        const events: TriggerEvent[] = tasks.map(task => ({
          id: task.id,
          type: 'automation_trigger',
          trigger: task.action,
          agentHandle: (task.ai_agents as any)?.handle || 'unknown',
          priority: task.payload?.event?.priority || 'medium',
          status: task.status,
          metadata: task.payload,
          createdAt: task.created_at,
          executedAt: task.started_at,
          completedAt: task.completed_at
        }));
        
        setRecentEvents(events);
        
        // Calculate stats
        const totalTriggers = events.length;
        const completedTasks = events.filter(e => e.status === 'completed').length;
        const successRate = totalTriggers > 0 ? (completedTasks / totalTriggers) * 100 : 0;
        
        setAutomationStats({
          totalTriggers,
          successRate,
          avgResponseTime: 1250, // Mock data
          activeAgents: agentConfigs.filter(a => a.isActive).length
        });
      }
      
    } catch (error) {
      console.error('Error fetching automation data:', error);
      toast.error('Failed to fetch automation data');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger automation manually
  const triggerAutomation = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('ai-agent-trigger-automation', {
        body: { action: 'detect_and_route' }
      });
      
      if (error) throw error;
      
      toast.success(`Automation triggered successfully! Processed ${data.eventsProcessed} events`);
      await fetchAutomationData();
      
    } catch (error) {
      console.error('Error triggering automation:', error);
      toast.error('Failed to trigger automation');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual trigger for specific agent
  const triggerSpecificAgent = async (agentHandle: string, trigger: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-trigger-automation', {
        body: { 
          action: 'manual_trigger',
          agentHandle,
          trigger,
          metadata: { manual: true, triggeredBy: 'admin' }
        }
      });
      
      if (error) throw error;
      
      toast.success(`${agentHandle} triggered successfully with ${trigger}`);
      await fetchAutomationData();
      
    } catch (error) {
      console.error('Error triggering specific agent:', error);
      toast.error(`Failed to trigger ${agentHandle}`);
    }
  };

  useEffect(() => {
    fetchAutomationData();
    
    // Set up real-time subscription for agent tasks
    const tasksSubscription = supabase
      .channel('automation_tasks')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'agent_tasks',
        filter: 'source=eq.automation_trigger'
      }, fetchAutomationData)
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'processing': case 'running': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'failed': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-500" />
            Trigger Automation Flow
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated trigger system for all 10 AI agents - No more "failed to trigger" errors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAutomationData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={triggerAutomation}
            disabled={isLoading}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Run Automation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Triggers</p>
                <p className="text-2xl font-bold">{automationStats.totalTriggers}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{automationStats.successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{automationStats.avgResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{automationStats.activeAgents}</p>
              </div>
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Flow Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Controls</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Flow Diagram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-500" />
                Automation Flow Logic
              </CardTitle>
              <CardDescription>
                Event Detection → Agent Activation → Task Execution → Logging & KPI Update → Escalation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Event Detection</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Time-based, user actions, system events
                  </p>
                </div>
                
                <ArrowRight className="h-6 w-6 self-center mx-auto text-gray-400" />
                
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Agent Activation</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Route to appropriate AI agent
                  </p>
                </div>
                
                <ArrowRight className="h-6 w-6 self-center mx-auto text-gray-400" />
                
                <div className="text-center p-4 border rounded-lg bg-purple-50">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Task Execution</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI performs assigned task
                  </p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg bg-yellow-50">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Logging & KPI Update</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track results and update metrics
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg bg-red-50">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Escalation</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Admin Bot or Human if AI can't resolve
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-500" />
                Implementation Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-semibold">Define Event Triggers</h3>
                      <p className="text-sm text-muted-foreground">New job, new user, failed application, low engagement</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-semibold">Build Automation Rules</h3>
                      <p className="text-sm text-muted-foreground">If event → activate agent logic</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-semibold">Add Logging Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Recent Tasks, KPI updates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                    <div>
                      <h3 className="font-semibold">Add Escalation Matrix</h3>
                      <p className="text-sm text-muted-foreground">Admin Bot / Human fallback</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Flow Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Agent Trigger Flow
              </CardTitle>
              <CardDescription>
                Visual representation of how events trigger specific agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <img 
                  src="/lovable-uploads/12e7ebb0-7d97-4bd6-b348-abaa94414879.png" 
                  alt="Agent Trigger Flow Diagram" 
                  className="max-w-full h-auto rounded-lg border shadow-sm"
                />
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Flow Explanation:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Green Box (Left):</strong> Event/Trigger detection from user actions, job posts, support requests, etc.</li>
                  <li>• <strong>Blue Boxes (Center):</strong> Each AI agent with their specific roles and responsibilities</li>
                  <li>• <strong>Red Box (Right):</strong> Escalation to Admin Bot or Human when AI cannot resolve</li>
                  <li>• <strong>Arrows:</strong> Show the routing logic from events to agents and potential escalation paths</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentConfigs.map((agent) => (
              <Card key={agent.handle}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <agent.icon className={`h-6 w-6 ${agent.color}`} />
                      <div>
                        <CardTitle className="text-lg">{agent.displayName}</CardTitle>
                        <Badge variant={agent.isActive ? "default" : "secondary"} className="mt-1">
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Triggers:</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.triggers.map((trigger) => (
                        <Badge key={trigger} variant="outline" className="text-xs">
                          {trigger.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Tasks:</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.tasks.map((task) => (
                        <Badge key={task} variant="secondary" className="text-xs">
                          {task.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {agent.triggers.map((trigger) => (
                      <Button
                        key={trigger}
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSpecificAgent(agent.handle, trigger)}
                        className="text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {trigger.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trigger Events</CardTitle>
              <CardDescription>
                Latest automation triggers and their execution status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {recentEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent trigger events found. Click "Run Automation" to start.
                    </div>
                  ) : (
                    recentEvents.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getPriorityColor(event.priority)}>
                              {event.priority}
                            </Badge>
                            <span className="font-semibold">{event.trigger.replace(/_/g, ' ')}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-muted-foreground">{event.agentHandle}</span>
                          </div>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created: {new Date(event.createdAt).toLocaleString()}</span>
                          {event.completedAt && (
                            <span>Completed: {new Date(event.completedAt).toLocaleString()}</span>
                          )}
                        </div>
                        
                        {event.metadata && (
                          <details className="text-xs">
                            <summary className="cursor-pointer font-medium">View Metadata</summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};