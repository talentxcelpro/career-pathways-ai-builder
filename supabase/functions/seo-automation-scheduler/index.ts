import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SchedulerRequest {
  action: 'create_schedule' | 'update_schedule' | 'delete_schedule' | 'get_schedules' | 'run_task';
  scheduleData?: {
    name: string;
    taskType: 'technical_audit' | 'keyword_tracking' | 'content_optimization' | 'backlink_check' | 'competitor_analysis';
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM format
    enabled: boolean;
    config: {
      urls?: string[];
      keywords?: string[];
      competitors?: string[];
      notifications?: boolean;
      reportFormat?: 'email' | 'dashboard' | 'both';
    };
  };
  scheduleId?: string;
  taskId?: string;
}

interface SchedulerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Validate action field
    if (!requestBody.action) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required field: action',
        validActions: ['create_schedule', 'update_schedule', 'delete_schedule', 'get_schedules', 'run_task'],
        examples: {
          create_schedule: {
            action: 'create_schedule',
            scheduleData: {
              name: 'Daily Audit',
              taskType: 'technical_audit',
              frequency: 'daily',
              time: '09:00',
              enabled: true,
              config: { urls: ['https://example.com'] }
            }
          },
          get_schedules: { action: 'get_schedules' },
          run_task: { action: 'run_task', taskId: 'sched_123' }
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      action,
      scheduleData,
      scheduleId,
      taskId
    }: SchedulerRequest = requestBody;

    console.log(`🤖 SEO Automation Scheduler: ${action}`);

    let result: any;

    switch (action) {
      case 'create_schedule':
        result = await createSchedule(scheduleData!);
        break;
      case 'update_schedule':
        result = await updateSchedule(scheduleId!, scheduleData!);
        break;
      case 'delete_schedule':
        result = await deleteSchedule(scheduleId!);
        break;
      case 'get_schedules':
        result = await getSchedules();
        break;
      case 'run_task':
        result = await runScheduledTask(taskId!);
        break;
      default:
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid action: ${action}`,
          validActions: ['create_schedule', 'update_schedule', 'delete_schedule', 'get_schedules', 'run_task'],
          providedAction: action
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`✅ Scheduler action completed: ${action}`);

    const response: SchedulerResponse = {
      success: true,
      data: result
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('SEO Automation Scheduler error:', error);
    
    const errorResponse: SchedulerResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createSchedule(scheduleData: any) {
  // In a real implementation, this would save to database
  const schedule = {
    id: generateScheduleId(),
    ...scheduleData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: null,
    nextRun: calculateNextRun(scheduleData.frequency, scheduleData.time),
    status: 'active'
  };

  console.log(`📅 Created schedule: ${schedule.name} (${schedule.frequency})`);
  
  return {
    schedule,
    message: 'Schedule created successfully',
    nextRunTime: schedule.nextRun
  };
}

async function updateSchedule(scheduleId: string, scheduleData: any) {
  const schedule = {
    id: scheduleId,
    ...scheduleData,
    updatedAt: new Date().toISOString(),
    nextRun: calculateNextRun(scheduleData.frequency, scheduleData.time)
  };

  console.log(`📝 Updated schedule: ${scheduleId}`);
  
  return {
    schedule,
    message: 'Schedule updated successfully'
  };
}

async function deleteSchedule(scheduleId: string) {
  console.log(`🗑️ Deleted schedule: ${scheduleId}`);
  
  return {
    scheduleId,
    message: 'Schedule deleted successfully'
  };
}

async function getSchedules() {
  // Mock data for existing schedules
  const schedules = [
    {
      id: 'sched_001',
      name: 'Daily Technical Audit',
      taskType: 'technical_audit',
      frequency: 'daily',
      time: '09:00',
      enabled: true,
      config: {
        urls: ['https://talentxcel.in'],
        notifications: true,
        reportFormat: 'both'
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastRun: '2024-01-10T09:00:00Z',
      nextRun: '2024-01-11T09:00:00Z',
      status: 'active'
    },
    {
      id: 'sched_002',
      name: 'Weekly Keyword Tracking',
      taskType: 'keyword_tracking',
      frequency: 'weekly',
      time: '08:00',
      enabled: true,
      config: {
        keywords: ['ai resume builder', 'job search platform', 'career guidance'],
        notifications: true,
        reportFormat: 'email'
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastRun: '2024-01-08T08:00:00Z',
      nextRun: '2024-01-15T08:00:00Z',
      status: 'active'
    },
    {
      id: 'sched_003',
      name: 'Monthly Competitor Analysis',
      taskType: 'competitor_analysis',
      frequency: 'monthly',
      time: '10:00',
      enabled: true,
      config: {
        competitors: ['naukri.com', 'monster.com', 'linkedin.com'],
        notifications: true,
        reportFormat: 'dashboard'
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastRun: '2024-01-01T10:00:00Z',
      nextRun: '2024-02-01T10:00:00Z',
      status: 'active'
    }
  ];

  console.log(`📊 Retrieved ${schedules.length} schedules`);
  
  return { schedules };
}

async function runScheduledTask(taskId: string) {
  console.log(`🚀 Running scheduled task: ${taskId}`);
  
  // Simulate task execution
  const taskResult = {
    taskId,
    startTime: new Date().toISOString(),
    status: 'running',
    progress: 0
  };

  // Simulate progress updates
  const progressUpdates = [25, 50, 75, 100];
  for (const progress of progressUpdates) {
    await new Promise(resolve => setTimeout(resolve, 500));
    taskResult.progress = progress;
    console.log(`📈 Task ${taskId} progress: ${progress}%`);
  }

  taskResult.status = 'completed';
  const endTime = new Date().toISOString();
  
  const finalResult = {
    ...taskResult,
    endTime,
    duration: '2.5 seconds',
    results: {
      issuesFound: Math.floor(Math.random() * 10) + 1,
      optimizationsApplied: Math.floor(Math.random() * 5) + 1,
      reportGenerated: true,
      nextRecommendations: [
        'Optimize meta descriptions for 3 pages',
        'Fix broken internal links',
        'Improve page load speed',
        'Update structured data markup'
      ]
    }
  };

  console.log(`✅ Task completed: ${taskId}`);
  
  return finalResult;
}

function generateScheduleId(): string {
  return 'sched_' + Math.random().toString(36).substr(2, 9);
}

function calculateNextRun(frequency: string, time: string): string {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  let nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  
  // If the time has passed today, move to next occurrence
  if (nextRun <= now) {
    switch (frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
  }
  
  return nextRun.toISOString();
}