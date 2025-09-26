import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Globe, 
  ExternalLink,
  FileText,
  Users,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecoveryTask {
  id: string;
  phase: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  action?: () => void;
  dependencies?: string[];
}

interface SEOMetrics {
  indexedPages: number;
  totalPages: number;
  searchConsoleSetup: boolean;
  sitemapSubmitted: boolean;
  avgRankingPosition: number;
  organicTraffic: number;
}

export const SEORecoveryDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<RecoveryTask[]>([]);
  const [metrics, setMetrics] = useState<SEOMetrics>({
    indexedPages: 0,
    totalPages: 0,
    searchConsoleSetup: false,
    sitemapSubmitted: false,
    avgRankingPosition: 0,
    organicTraffic: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeRecoveryTasks();
    loadSEOMetrics();
  }, []);

  const initializeRecoveryTasks = () => {
    const recoveryTasks: RecoveryTask[] = [
      // Phase 1: Critical Foundation
      {
        id: 'domain-connection',
        phase: 'Phase 1',
        title: 'Connect talentxcel.in Domain',
        description: 'Configure DNS and connect custom domain to Lovable project',
        status: window.location.hostname === 'talentxcel.in' ? 'completed' : 'pending',
        priority: 'high',
        estimatedTime: '24-48 hours',
      },
      {
        id: 'google-search-console',
        phase: 'Phase 1',
        title: 'Setup Google Search Console',
        description: 'Register domain and verify ownership with Google',
        status: 'pending',
        priority: 'high',
        estimatedTime: '30 minutes',
        dependencies: ['domain-connection'],
        action: () => window.open('https://search.google.com/search-console', '_blank')
      },
      {
        id: 'sitemap-submission',
        phase: 'Phase 1',
        title: 'Submit XML Sitemaps',
        description: 'Submit comprehensive sitemaps to search engines',
        status: 'pending',
        priority: 'high',
        estimatedTime: '15 minutes',
        dependencies: ['google-search-console'],
        action: submitSitemaps
      },
      {
        id: 'bing-webmaster',
        phase: 'Phase 1',
        title: 'Setup Bing Webmaster Tools',
        description: 'Register with Bing for additional search engine coverage',
        status: 'pending',
        priority: 'medium',
        estimatedTime: '20 minutes',
        dependencies: ['domain-connection'],
        action: () => window.open('https://www.bing.com/webmasters', '_blank')
      },

      // Phase 2: Content Optimization
      {
        id: 'meta-tags-optimization',
        phase: 'Phase 2',
        title: 'Optimize Meta Tags',
        description: 'Update title tags and meta descriptions for all pages',
        status: 'in-progress',
        priority: 'high',
        estimatedTime: '2-3 hours',
        action: optimizeMetaTags
      },
      {
        id: 'structured-data',
        phase: 'Phase 2',
        title: 'Implement Structured Data',
        description: 'Add JSON-LD schema markup for jobs, companies, and reviews',
        status: 'completed',
        priority: 'high',
        estimatedTime: '4-6 hours'
      },
      {
        id: 'internal-linking',
        phase: 'Phase 2',
        title: 'Enhance Internal Linking',
        description: 'Create comprehensive internal link structure',
        status: 'pending',
        priority: 'medium',
        estimatedTime: '3-4 hours',
        action: enhanceInternalLinking
      },

      // Phase 3: Content & Authority
      {
        id: 'content-creation',
        phase: 'Phase 3',
        title: 'Create SEO Content',
        description: 'Generate location and industry-specific landing pages',
        status: 'pending',
        priority: 'medium',
        estimatedTime: '1-2 weeks',
        action: createSEOContent
      },
      {
        id: 'backlink-building',
        phase: 'Phase 3',
        title: 'Build Quality Backlinks',
        description: 'Submit to directories and build initial link profile',
        status: 'pending',
        priority: 'medium',
        estimatedTime: '2-4 weeks'
      },

      // Phase 4: Monitoring & Optimization
      {
        id: 'analytics-setup',
        phase: 'Phase 4',
        title: 'Advanced Analytics Setup',
        description: 'Configure GA4, Search Console monitoring, and SEO tracking',
        status: 'pending',
        priority: 'low',
        estimatedTime: '2-3 hours',
        action: setupAdvancedAnalytics
      },
      {
        id: 'performance-optimization',
        phase: 'Phase 4',
        title: 'Page Speed Optimization',
        description: 'Optimize Core Web Vitals and loading performance',
        status: 'pending',
        priority: 'medium',
        estimatedTime: '1-2 days',
        action: optimizePerformance
      }
    ];

    setTasks(recoveryTasks);
    setLoading(false);
  };

  const loadSEOMetrics = async () => {
    try {
      // In a real implementation, this would fetch actual metrics
      setMetrics({
        indexedPages: 0,
        totalPages: 150, // Estimated based on current content
        searchConsoleSetup: false,
        sitemapSubmitted: false,
        avgRankingPosition: 0,
        organicTraffic: 0
      });
    } catch (error) {
      console.error('Error loading SEO metrics:', error);
    }
  };

  const updateTaskStatus = (taskId: string, status: RecoveryTask['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  // Action functions
  async function submitSitemaps() {
    try {
      const { error } = await supabase.functions.invoke('enhanced-sitemap');
      if (error) throw error;
      
      updateTaskStatus('sitemap-submission', 'completed');
      toast.success('Sitemaps generated and ready for submission!');
    } catch (error) {
      toast.error('Failed to generate sitemaps');
    }
  }

  function optimizeMetaTags() {
    updateTaskStatus('meta-tags-optimization', 'in-progress');
    toast.info('Meta tags optimization is already implemented and active');
  }

  function enhanceInternalLinking() {
    updateTaskStatus('internal-linking', 'in-progress');
    toast.info('Internal linking enhancement in progress');
  }

  function createSEOContent() {
    updateTaskStatus('content-creation', 'in-progress');
    toast.info('SEO content creation initiated');
  }

  function setupAdvancedAnalytics() {
    updateTaskStatus('analytics-setup', 'in-progress');
    toast.info('Analytics setup in progress');
  }

  function optimizePerformance() {
    updateTaskStatus('performance-optimization', 'in-progress');
    toast.info('Performance optimization started');
  }

  const getPhaseProgress = (phase: string) => {
    const phaseTasks = tasks.filter(task => task.phase === phase);
    const completedTasks = phaseTasks.filter(task => task.status === 'completed');
    return phaseTasks.length > 0 ? (completedTasks.length / phaseTasks.length) * 100 : 0;
  };

  const getOverallProgress = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    return tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  };

  const getPriorityTasks = () => {
    return tasks.filter(task => task.priority === 'high' && task.status !== 'completed');
  };

  if (loading) {
    return <div>Loading SEO Recovery Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Critical Status Alert */}
      <Alert className="border-destructive bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>SEO EMERGENCY:</strong> Your platform has 0 indexed pages. Immediate action required to restore search visibility.
        </AlertDescription>
      </Alert>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SEO Recovery Progress
          </CardTitle>
          <CardDescription>
            Overall progress towards full SEO recovery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(getOverallProgress())}%</span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-destructive">{metrics.indexedPages}</div>
                <div className="text-sm text-muted-foreground">Indexed Pages</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold">{metrics.totalPages}</div>
                <div className="text-sm text-muted-foreground">Total Pages</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{getPriorityTasks().length}</div>
                <div className="text-sm text-muted-foreground">Priority Tasks</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Tasks */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="phase1">Phase 1</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3</TabsTrigger>
          <TabsTrigger value="phase4">Phase 4</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].map(phase => (
            <Card key={phase}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{phase}: {
                    phase === 'Phase 1' ? 'Critical Foundation' :
                    phase === 'Phase 2' ? 'Content Optimization' :
                    phase === 'Phase 3' ? 'Content & Authority' :
                    'Monitoring & Optimization'
                  }</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {Math.round(getPhaseProgress(phase))}% Complete
                    </span>
                    <Progress value={getPhaseProgress(phase)} className="w-20 h-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.filter(task => task.phase === phase).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : task.status === 'in-progress' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">!</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{task.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={
                              task.priority === 'high' ? 'destructive' :
                              task.priority === 'medium' ? 'default' : 'secondary'
                            } size="sm">
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{task.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      {task.action && task.status !== 'completed' && (
                        <Button 
                          onClick={task.action}
                          size="sm"
                          disabled={task.dependencies?.some(dep => 
                            tasks.find(t => t.id === dep)?.status !== 'completed'
                          )}
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="priority">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                High Priority Tasks
              </CardTitle>
              <CardDescription>
                Critical tasks that need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getPriorityTasks().map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">{task.description}</div>
                        <div className="text-xs text-red-600 mt-1">Estimated: {task.estimatedTime}</div>
                      </div>
                    </div>
                    {task.action && (
                      <Button 
                        onClick={task.action}
                        size="sm"
                        variant="destructive"
                      >
                        Start Now
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Phase Tabs */}
        {['phase1', 'phase2', 'phase3', 'phase4'].map(phaseKey => {
          const phaseNumber = phaseKey.replace('phase', 'Phase ');
          return (
            <TabsContent key={phaseKey} value={phaseKey}>
              <Card>
                <CardHeader>
                  <CardTitle>{phaseNumber} Tasks</CardTitle>
                  <CardDescription>
                    {Math.round(getPhaseProgress(phaseNumber))}% Complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.filter(task => task.phase === phaseNumber).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : task.status === 'in-progress' ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <span className="text-xs">!</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">{task.description}</div>
                          </div>
                        </div>
                        {task.action && task.status !== 'completed' && (
                          <Button onClick={task.action} size="sm">
                            Execute
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Expected Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recovery Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <div className="font-medium">Week 1</div>
              <div className="text-sm text-muted-foreground">Domain & Foundation</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">Week 2-3</div>
              <div className="text-sm text-muted-foreground">Content Optimization</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Week 4-8</div>
              <div className="text-sm text-muted-foreground">Authority Building</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="font-medium">Ongoing</div>
              <div className="text-sm text-muted-foreground">Monitoring & Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};