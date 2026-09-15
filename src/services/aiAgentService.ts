import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/useProfile';

export interface PersonalizedAIAgent {
  username: string;
  userId: string;
  profile?: Profile;
  careerGoals?: string[];
  skillsGap?: string[];
  preferredIndustries?: string[];
  targetRoles?: string[];
  salaryExpectations?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface DailyBriefing {
  greeting: string;
  jobMatches: JobMatch[];
  networkUpdates: NetworkUpdate[];
  learningTasks: LearningTask[];
  careerInsights: CareerInsight[];
  proactiveActions: ProactiveAction[];
  resumeScore?: number;
  profileViews?: number;
  marketTrends?: MarketTrend[];
}

export interface JobMatch {
  jobId: string;
  title: string;
  company: string;
  matchScore: number;
  salaryRange: string;
  urgency: 'high' | 'medium' | 'low';
  location: string;
  reasonsToApply: string[];
  deadlineHours?: number;
}

export interface NetworkUpdate {
  type: 'profile_view' | 'connection_request' | 'post_engagement' | 'industry_activity';
  title: string;
  description: string;
  actionable: boolean;
  suggestedAction?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LearningTask {
  type: 'skill_gap' | 'certification' | 'trending_skill' | 'interview_prep';
  title: string;
  description: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  moduleLink?: string;
  progress?: number;
}

export interface CareerInsight {
  type: 'salary_trend' | 'skill_demand' | 'industry_growth' | 'competition_analysis';
  title: string;
  insight: string;
  actionable: boolean;
  impact: 'high' | 'medium' | 'low';
}

export interface ProactiveAction {
  type: 'resume_update' | 'profile_optimization' | 'networking' | 'application' | 'learning';
  title: string;
  description: string;
  ctaText: string;
  urgency: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  quickAction?: boolean;
}

export interface MarketTrend {
  category: 'skills' | 'roles' | 'industries' | 'salaries';
  trend: string;
  change: number;
  timeframe: string;
  relevantToUser: boolean;
}

export interface ProactiveNotification {
  id: string;
  type: 'job_deadline' | 'profile_view_spike' | 'new_connections' | 'learning_reminder' | 'market_opportunity';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  suggestedActions?: string[];
  expiresAt?: string;
  userId: string;
  createdAt: string;
}

class AIAgentService {
  private static instance: AIAgentService;
  
  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  async initializePersonalizedAgent(userId: string): Promise<PersonalizedAIAgent> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const username = profile?.full_name?.split(' ')[0] || 'there';

      return {
        username,
        userId,
        profile,
        careerGoals: [],
        skillsGap: [],
        preferredIndustries: [],
        targetRoles: [],
        salaryExpectations: { min: 0, max: 0, currency: 'USD' }
      };
    } catch (error) {
      console.error('Failed to initialize personalized agent:', error);
      return { username: 'there', userId };
    }
  }

  async generateDailyBriefing(agent: PersonalizedAIAgent): Promise<DailyBriefing> {
    const timeOfDay = this.getTimeOfDay();
    const greeting = `Good ${timeOfDay} ${agent.username}! Here's your career digest for today.`;

    // Mock data for demonstration
    return {
      greeting,
      jobMatches: [
        {
          jobId: '1',
          title: 'Senior Developer',
          company: 'TechCorp',
          matchScore: 87,
          salaryRange: '$80k - $120k',
          urgency: 'high',
          location: 'Remote',
          reasonsToApply: ['Great salary match', 'Remote work', 'Growing company'],
          deadlineHours: 24
        }
      ],
      networkUpdates: [
        {
          type: 'profile_view',
          title: 'Profile views increased by 23%',
          description: 'Your profile is getting more attention this week',
          actionable: true,
          suggestedAction: 'Share a professional update',
          priority: 'medium'
        }
      ],
      learningTasks: [
        {
          type: 'skill_gap',
          title: 'Complete SQL Advanced Module',
          description: 'You\'re 1 module away from completing your SQL learning path',
          estimatedTime: '45 minutes',
          priority: 'high',
          progress: 85
        }
      ],
      careerInsights: [
        {
          type: 'skill_demand',
          title: 'Python demand up 15%',
          insight: 'Python skills are increasingly in demand in your target industry',
          actionable: true,
          impact: 'high'
        }
      ],
      proactiveActions: [
        {
          type: 'resume_update',
          title: 'Optimize resume for ATS',
          description: 'Your resume score could improve by 15 points',
          ctaText: 'Run ATS Check',
          urgency: 'medium',
          estimatedImpact: '+15% interview callbacks',
          quickAction: true
        }
      ],
      resumeScore: 78,
      profileViews: 156,
      marketTrends: [
        {
          category: 'skills',
          trend: 'AI/ML skills',
          change: 25,
          timeframe: 'last month',
          relevantToUser: true
        }
      ]
    };
  }

  async createProactiveNotification(
    userId: string, 
    type: ProactiveNotification['type'],
    data: Partial<ProactiveNotification>
  ): Promise<void> {
    console.log('Creating proactive notification:', { userId, type, data });
  }

  async getActiveNotifications(userId: string): Promise<ProactiveNotification[]> {
    return [];
  }

  async runATSCheck(userId: string, resumeContent: any): Promise<{ score: number; issues: string[]; fixes: string[] }> {
    return { score: 78, issues: ['Missing keywords'], fixes: ['Add relevant skills'] };
  }

  async tailorResumeToJob(userId: string, resumeContent: any, jobDescription: string): Promise<{ tailoredResume: any; coverLetter: string; changes: string[] }> {
    return { tailoredResume: resumeContent, coverLetter: 'Generated cover letter', changes: ['Updated skills section'] };
  }

  async generateInterviewKit(userId: string, jobDescription: string, userProfile: any): Promise<{ questions: string[]; tips: string[]; mock: any }> {
    return { questions: ['Tell me about yourself'], tips: ['Be confident'], mock: null };
  }

  async generateNetworkingContent(userId: string, goal: string, userProfile: any): Promise<{ posts: string[]; hashtags: string[]; targets: string[] }> {
    return { posts: ['Professional update post'], hashtags: ['#career'], targets: ['Industry leaders'] };
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}

export const aiAgentService = AIAgentService.getInstance();