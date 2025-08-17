import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActivityLogEntry {
  taskId?: string;
  agentId?: string;
  actionType: string;
  description: string;
  metadata?: Record<string, any>;
  level?: 'info' | 'warn' | 'error';
}

interface AgentMetrics {
  agentId: string;
  tasksCompleted: number;
  tasksTotal: number;
  successRate: number;
  contentCreated: number;
  emailsSent: number;
  lastActivity: string;
}

export const useAgentActivityTracking = () => {
  const [isLogging, setIsLogging] = useState(false);

  // Enhanced logging function for agent activities
  const logAgentActivity = async (entry: ActivityLogEntry) => {
    setIsLogging(true);
    try {
      const { error } = await supabase.functions.invoke('enhanced-agent-logger', {
        body: {
          task_id: entry.taskId,
          agent_id: entry.agentId,
          action_type: entry.actionType,
          description: entry.description,
          metadata: entry.metadata || {},
          level: entry.level || 'info'
        }
      });

      if (error) {
        console.error('Error logging agent activity:', error);
        // Fallback to direct database insertion
        await supabase.from('agent_logs').insert({
          task_id: entry.taskId,
          agent_id: entry.agentId,
          message: entry.description,
          level: entry.level || 'info',
          metadata: {
            action_type: entry.actionType,
            ...entry.metadata
          }
        });
      }
    } catch (error: any) {
      console.error('Failed to log agent activity:', error);
      toast.error(`Logging failed: ${error.message}`);
    } finally {
      setIsLogging(false);
    }
  };

  // Specific logging functions for common activities
  const logContentCreation = async (agentId: string, taskId: string, content: {
    type: string;
    title: string;
    id?: string;
    engagement?: Record<string, any>;
  }) => {
    await logAgentActivity({
      taskId,
      agentId,
      actionType: 'content_created',
      description: `Created ${content.type}: "${content.title}"`,
      metadata: {
        content_type: content.type,
        content_title: content.title,
        content_id: content.id,
        engagement_metrics: content.engagement
      },
      level: 'info'
    });
  };

  const logEmailSent = async (agentId: string, taskId: string, email: {
    recipientCount: number;
    subject: string;
    type: string;
    success: boolean;
  }) => {
    await logAgentActivity({
      taskId,
      agentId,
      actionType: 'email_sent',
      description: `Sent ${email.type} email to ${email.recipientCount} recipients: "${email.subject}"`,
      metadata: {
        recipient_count: email.recipientCount,
        email_subject: email.subject,
        email_type: email.type,
        success: email.success
      },
      level: email.success ? 'info' : 'error'
    });
  };

  const logJobPosting = async (agentId: string, taskId: string, job: {
    title: string;
    company: string;
    id?: string;
    applications?: number;
  }) => {
    await logAgentActivity({
      taskId,
      agentId,
      actionType: 'job_posted',
      description: `Posted job: "${job.title}" at ${job.company}`,
      metadata: {
        job_title: job.title,
        job_company: job.company,
        job_id: job.id,
        applications_received: job.applications || 0
      },
      level: 'info'
    });
  };

  const logTaskExecution = async (agentId: string, taskId: string, execution: {
    action: string;
    status: 'started' | 'completed' | 'failed';
    duration?: number;
    error?: string;
    output?: any;
  }) => {
    await logAgentActivity({
      taskId,
      agentId,
      actionType: 'task_execution',
      description: `Task ${execution.action} ${execution.status}${execution.duration ? ` in ${execution.duration}ms` : ''}`,
      metadata: {
        task_action: execution.action,
        execution_status: execution.status,
        execution_duration_ms: execution.duration,
        error_message: execution.error,
        task_output: execution.output
      },
      level: execution.status === 'failed' ? 'error' : 'info'
    });
  };

  const logPerformanceMetric = async (agentId: string, metric: {
    name: string;
    value: number;
    unit?: string;
    context?: Record<string, any>;
  }) => {
    await logAgentActivity({
      agentId,
      actionType: 'performance_metric',
      description: `Performance metric: ${metric.name} = ${metric.value}${metric.unit || ''}`,
      metadata: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_unit: metric.unit,
        metric_context: metric.context
      },
      level: 'info'
    });
  };

  // Fetch agent metrics for dashboard
  const getAgentMetrics = async (agentId?: string): Promise<AgentMetrics[]> => {
    try {
      let agentsQuery = supabase.from('ai_agents').select('*');
      if (agentId) {
        agentsQuery = agentsQuery.eq('id', agentId);
      }

      const { data: agents, error: agentsError } = await agentsQuery;
      if (agentsError) throw agentsError;

      const metrics: AgentMetrics[] = [];

      for (const agent of agents || []) {
        // Get task statistics
        const { data: tasks } = await supabase
          .from('agent_tasks')
          .select('status, completed_at')
          .eq('agent_id', agent.id);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Get activity metrics from logs
        const { data: contentLogs } = await supabase
          .from('agent_logs')
          .select('created_at')
          .eq('agent_id', agent.id)
          .contains('metadata', { action_type: 'content_created' });

        const { data: emailLogs } = await supabase
          .from('agent_logs')
          .select('created_at')
          .eq('agent_id', agent.id)
          .contains('metadata', { action_type: 'email_sent' });

        const lastActivity = tasks?.find(t => t.completed_at)?.completed_at || agent.updated_at;

        metrics.push({
          agentId: agent.id,
          tasksCompleted: completedTasks,
          tasksTotal: totalTasks,
          successRate,
          contentCreated: contentLogs?.length || 0,
          emailsSent: emailLogs?.length || 0,
          lastActivity
        });
      }

      return metrics;
    } catch (error: any) {
      console.error('Error fetching agent metrics:', error);
      toast.error(`Failed to fetch agent metrics: ${error.message}`);
      return [];
    }
  };

  return {
    // Core logging
    logAgentActivity,
    isLogging,

    // Specific activity loggers
    logContentCreation,
    logEmailSent,
    logJobPosting,
    logTaskExecution,
    logPerformanceMetric,

    // Metrics
    getAgentMetrics
  };
};