import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Database, Zap, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OptimizationTask {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  category: 'performance' | 'security' | 'cost';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedTime: string;
  expectedBenefit: string;
}

export const PerformanceOptimizer: React.FC = () => {
  const [tasks, setTasks] = useState<OptimizationTask[]>([
    {
      id: 'composite-indexes',
      title: 'Add Composite Indexes',
      description: 'Optimize database queries with composite indexes for jobs, profiles, and applications',
      impact: 'high',
      effort: 'low',
      category: 'performance',
      status: 'pending',
      progress: 0,
      estimatedTime: '30 minutes',
      expectedBenefit: '200-300% query speed improvement'
    },
    {
      id: 'connection-pooling',
      title: 'Edge Function Connection Pooling',
      description: 'Implement connection pooling to reduce database connection overhead',
      impact: 'high',
      effort: 'medium',
      category: 'performance',
      status: 'pending',
      progress: 0,
      estimatedTime: '2 hours',
      expectedBenefit: '60-80% reduction in cold starts'
    },
    {
      id: 'response-caching',
      title: 'API Response Caching',
      description: 'Add intelligent caching for frequently accessed endpoints',
      impact: 'high',
      effort: 'medium',
      category: 'performance',
      status: 'pending',
      progress: 0,
      estimatedTime: '3 hours',
      expectedBenefit: '85-95% cache hit rate'
    },
    {
      id: 'image-optimization',
      title: 'Image Optimization & CDN',
      description: 'Optimize images and implement CDN for faster loading',
      impact: 'medium',
      effort: 'medium',
      category: 'performance',
      status: 'pending',
      progress: 0,
      estimatedTime: '4 hours',
      expectedBenefit: '40-60% faster page loads'
    },
    {
      id: 'bundle-optimization',
      title: 'Bundle Size Optimization',
      description: 'Code splitting and tree shaking to reduce bundle size',
      impact: 'medium',
      effort: 'low',
      category: 'performance',
      status: 'pending',
      progress: 0,
      estimatedTime: '1 hour',
      expectedBenefit: '30-50% smaller bundles'
    }
  ]);

  const [running, setRunning] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'cost': return <Database className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const runOptimization = async (taskId: string) => {
    setRunning(true);
    
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    // Update task status to running
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: 'running', progress: 0 };
    setTasks(updatedTasks);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], progress: i };
        setTasks([...updatedTasks]);
      }

      // Call the appropriate optimization function
      if (taskId === 'composite-indexes') {
        await supabase.functions.invoke('system-optimizer', {
          body: { action: 'add_composite_indexes' }
        });
      } else if (taskId === 'connection-pooling') {
        await supabase.functions.invoke('system-optimizer', {
          body: { action: 'optimize_connections' }
        });
      } else {
        await supabase.functions.invoke('system-optimizer', {
          body: { action: 'general_optimization', task: taskId }
        });
      }

      // Mark as completed
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: 'completed', progress: 100 };
      setTasks([...updatedTasks]);

    } catch (error) {
      console.error('Optimization failed:', error);
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: 'failed', progress: 0 };
      setTasks([...updatedTasks]);
    } finally {
      setRunning(false);
    }
  };

  const runAllOptimizations = async () => {
    for (const task of tasks.filter(t => t.status === 'pending')) {
      await runOptimization(task.id);
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const overallProgress = (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Optimizer</h2>
          <p className="text-muted-foreground">
            Optimize system performance, security, and costs
          </p>
        </div>
        <Button 
          onClick={runAllOptimizations} 
          disabled={running}
          className="bg-primary hover:bg-primary/90"
        >
          {running ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Run All Optimizations
            </>
          )}
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed Tasks</span>
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {overallProgress === 100 ? 'All optimizations completed!' : `${Math.round(overallProgress)}% complete`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tasks */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(task.category)}
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getImpactColor(task.impact) as any}>
                    {task.impact} impact
                  </Badge>
                  <Badge variant={getEffortColor(task.effort) as any}>
                    {task.effort} effort
                  </Badge>
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <div className="font-medium">{task.estimatedTime}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Benefit:</span>
                    <div className="font-medium">{task.expectedBenefit}</div>
                  </div>
                </div>

                {task.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => runOptimization(task.id)}
                    disabled={running || task.status === 'completed' || task.status === 'running'}
                    variant={task.status === 'completed' ? 'outline' : 'default'}
                    size="sm"
                  >
                    {task.status === 'completed' ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : task.status === 'running' ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Optimize
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};