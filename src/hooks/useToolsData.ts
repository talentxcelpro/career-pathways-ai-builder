import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ADMIN_EMAILS = [
  'talentxcelpro@gmail.com',
  'arsh.wani@gmail.com'
];

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  slug: string;
  icon_name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ToolUsage {
  id: string;
  user_id: string;
  tool_slug: string;
  tool_name: string;
  usage_type: string;
  input_data: any;
  output_data: any;
  completion_status: string;
  duration_seconds: number;
  feedback_rating?: number;
  feedback_text?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedResult {
  id: string;
  user_id: string;
  tool_slug: string;
  result_title: string;
  result_type: string;
  result_data: any;
  is_favorite: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER 26 TOOLS REGISTRY (8 CATEGORIES)
// Analytics (3) | Career (4) | Interview (4) | JobSearch (3)
// Networking (3) | Profile (3) | Resume (3) | Skills (3)
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_26_TOOLS: Tool[] = [
  // Analytics (3)
  {
    id: 'tool-analytics-1',
    name: 'Resume Performance Insights',
    slug: 'resume-performance-insights',
    category: 'Analytics',
    description: 'Track resume engagement, recruiter views, and conversion rates across job platforms.',
    icon_name: 'PieChart',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-analytics-2',
    name: 'Career Growth Score',
    slug: 'career-growth-score',
    category: 'Analytics',
    description: 'Calculate comprehensive career velocity, promotion readiness, and salary growth trajectory.',
    icon_name: 'Award',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-analytics-3',
    name: 'Career SWOT Analysis',
    slug: 'career-swot-analysis',
    category: 'Analytics',
    description: 'Identify strengths, weaknesses, growth opportunities, and threats to your career advancement.',
    icon_name: 'Shield',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },

  // Career (4)
  {
    id: 'tool-career-1',
    name: 'AI Career Pathfinder',
    slug: 'ai-career-pathfinder',
    category: 'Career',
    description: 'AI-driven career roadmap generator with step-by-step role milestones and skills requirements.',
    icon_name: 'Target',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-career-2',
    name: 'Role Fit Evaluator',
    slug: 'role-fit-evaluator',
    category: 'Career',
    description: 'Evaluate compatibility and qualification gaps for target industry job descriptions.',
    icon_name: 'Search',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-career-3',
    name: 'Career Change Navigator',
    slug: 'career-change-navigator',
    category: 'Career',
    description: 'Plan seamless cross-industry career pivots and map transferable skills.',
    icon_name: 'ArrowRightLeft',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-career-4',
    name: 'Career Pathfinder',
    slug: 'career-pathfinder',
    category: 'Career',
    description: 'Strategic career discovery matching personal aptitudes with future market demands.',
    icon_name: 'Compass',
    is_active: true,
    sort_order: 4,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },

  // Interview (4)
  {
    id: 'tool-interview-1',
    name: 'Mock Interview Simulator',
    slug: 'mock-interview-simulator',
    category: 'Interview',
    description: 'Interactive AI-simulated technical and behavioral interviews with real-time feedback.',
    icon_name: 'Video',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-interview-2',
    name: 'Interview Q&A Bank',
    slug: 'interview-qa-bank',
    category: 'Interview',
    description: 'Curated repository of top technical and leadership interview questions with optimal answers.',
    icon_name: 'MessageSquare',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-interview-3',
    name: 'STAR Answer Generator',
    slug: 'star-answer-generator',
    category: 'Interview',
    description: 'Transform project experiences into structured Situation-Task-Action-Result narratives.',
    icon_name: 'Star',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-interview-4',
    name: 'Interview Readiness Score',
    slug: 'interview-readiness-score',
    category: 'Interview',
    description: 'Assess technical readiness, communication clarity, and confidence metrics before interviews.',
    icon_name: 'Award',
    is_active: true,
    sort_order: 4,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },

  // JobSearch (3)
  {
    id: 'tool-jobsearch-1',
    name: 'AI Job Match GPT',
    slug: 'ai-job-match-gpt',
    category: 'JobSearch',
    description: 'Semantic AI engine matching your verified candidate profile against active hiring openings.',
    icon_name: 'Briefcase',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-jobsearch-2',
    name: 'Smart Apply Tool',
    slug: 'smart-apply-tool',
    category: 'JobSearch',
    description: 'Automated 1-click tailored application package builder for high-priority job listings.',
    icon_name: 'Send',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-jobsearch-3',
    name: 'Job Matcher',
    slug: 'job-matcher',
    category: 'JobSearch',
    description: 'Filter verified job postings based on salary expectations, location preferences, and skill fit.',
    icon_name: 'Briefcase',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },

  // Networking (3)
  {
    id: 'tool-networking-1',
    name: 'Network Growth Tracker',
    slug: 'network-growth-tracker',
    category: 'Networking',
    description: 'Monitor outreach pipelines, response rates, and connection relationships across industry leads.',
    icon_name: 'Network',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-networking-2',
    name: 'AI Outreach Generator',
    slug: 'ai-outreach-generator',
    category: 'Networking',
    description: 'Personalized cold outreach message and connection request generator for recruiters and peers.',
    icon_name: 'Send',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-networking-3',
    name: 'Mentor Connect Tool',
    slug: 'mentor-connect-tool',
    category: 'Networking',
    description: 'Connect with verified industry mentors, schedule 1-on-1 sessions, and track advice.',
    icon_name: 'Users',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },

  // Profile (3)
  {
    id: 'tool-profile-1',
    name: 'Profile Scorer',
    slug: 'profile-scorer',
    category: 'Profile',
    description: 'Evaluate LinkedIn and platform profile completeness, keyword strength, and search visibility.',
    icon_name: 'User',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-profile-2',
    name: 'Professional Bio Writer',
    slug: 'professional-bio-writer',
    category: 'Profile',
    description: 'Generate high-impact executive summaries and candidate bios tailored for portfolios.',
    icon_name: 'Edit3',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-profile-3',
    name: 'AI Profile Optimizer',
    slug: 'ai-profile-optimizer',
    category: 'Profile',
    description: 'AI optimization for social and professional profiles to boost recruiter search rankings.',
    icon_name: 'Sparkles',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },

  // Resume (3)
  {
    id: 'tool-resume-1',
    name: 'AI Resume Builder',
    slug: 'resume-builder',
    category: 'Resume',
    description: 'Build ATS-optimized, modern resumes with auto-formatting and AI bullet point enhancement.',
    icon_name: 'FileText',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-resume-2',
    name: 'Resume Optimizer',
    slug: 'resume-optimizer',
    category: 'Resume',
    description: 'Scan and optimize existing resumes against ATS parsing standards and action verbs.',
    icon_name: 'FileText',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-resume-3',
    name: 'Resume Tailor Tool',
    slug: 'resume-tailor-tool',
    category: 'Resume',
    description: 'Dynamically customize bullet points and skills for specific job descriptions.',
    icon_name: 'Scissors',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },

  // Skills (3)
  {
    id: 'tool-skills-1',
    name: 'Skill Assessor',
    slug: 'skill-assessor',
    category: 'Skills',
    description: 'Assess domain competencies with verified diagnostic tests and benchmark scores.',
    icon_name: 'BookOpen',
    is_active: true,
    sort_order: 1,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-skills-2',
    name: 'Skill Gap Analyzer',
    slug: 'skill-gap-analyzer',
    category: 'Skills',
    description: 'Compare current verified skills with target job market requirements to uncover gaps.',
    icon_name: 'Target',
    is_active: true,
    sort_order: 2,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  },
  {
    id: 'tool-skills-3',
    name: 'Skill Assessment Engine',
    slug: 'skill-assessment-engine',
    category: 'Skills',
    description: 'Automated skill evaluation with practical challenges and verified achievement badges.',
    icon_name: 'Award',
    is_active: true,
    sort_order: 3,
    created_at: '2026-08-20T00:00:00Z',
    updated_at: '2026-08-20T00:00:00Z'
  }
];

export const useToolsData = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>(DEFAULT_26_TOOLS);
  const [toolUsage, setToolUsage] = useState<ToolUsage[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = Boolean(
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())
  );

  // Fetch tools from database with fallback to DEFAULT_26_TOOLS
  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_registry')
        .select('*')
        .eq('is_active', true)
        .order('category, sort_order');

      if (error) {
        console.warn('Using default 26 tools due to Supabase query error:', error.message);
        setTools(DEFAULT_26_TOOLS);
        return;
      }
      if (data && data.length >= 26) {
        setTools(data);
      } else {
        setTools(DEFAULT_26_TOOLS);
      }
    } catch (error) {
      console.warn('Using default 26 tools catalog fallback');
      setTools(DEFAULT_26_TOOLS);
    }
  };

  // Fetch user's tool usage
  const fetchToolUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tool_usage_enhanced')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setToolUsage(data || []);
    } catch (error) {
      console.error('Error fetching tool usage:', error);
    }
  };

  // Fetch saved results
  const fetchSavedResults = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tool_saved_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedResults(data || []);
    } catch (error) {
      console.error('Error fetching saved results:', error);
    }
  };

  // Log tool usage
  const logToolUsage = async (
    toolSlug: string,
    toolName: string,
    inputData: any = {},
    usageType: string = 'single_use'
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tool_usage_enhanced')
        .insert({
          user_id: user.id,
          tool_slug: toolSlug,
          tool_name: toolName,
          usage_type: usageType,
          input_data: inputData,
          completion_status: 'started'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging tool usage:', error);
      return null;
    }
  };

  // Update tool usage completion
  const updateToolUsage = async (
    usageId: string,
    outputData: any = {},
    completionStatus: 'completed' | 'failed' | 'abandoned' = 'completed',
    durationSeconds: number = 0
  ) => {
    try {
      const { error } = await supabase
        .from('tool_usage_enhanced')
        .update({
          output_data: outputData,
          completion_status: completionStatus,
          duration_seconds: durationSeconds,
          updated_at: new Date().toISOString()
        })
        .eq('id', usageId);

      if (error) throw error;
      await fetchToolUsage();
    } catch (error) {
      console.error('Error updating tool usage:', error);
    }
  };

  // Save tool result
  const saveToolResult = async (
    toolSlug: string,
    title: string,
    resultData: any,
    resultType: 'report' | 'analysis' | 'recommendation' | 'document' | 'data' = 'report',
    tags: string[] = []
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tool_saved_results')
        .insert({
          user_id: user.id,
          tool_slug: toolSlug,
          result_title: title,
          result_type: resultType,
          result_data: resultData,
          tags: tags
        })
        .select()
        .single();

      if (error) throw error;
      await fetchSavedResults();
      toast.success('Result saved successfully');
      return data;
    } catch (error) {
      console.error('Error saving tool result:', error);
      toast.error('Failed to save result');
      return null;
    }
  };

  // Filter tools based on category and search
  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get tool categories with counts
  const toolCategories = tools.reduce((acc, tool) => {
    acc[tool.category] = (acc[tool.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get usage stats
  const usageStats = {
    totalUsage: toolUsage.length,
    completedUsage: toolUsage.filter(u => u.completion_status === 'completed').length,
    favoriteTools: savedResults.filter(r => r.is_favorite).length,
    recentActivity: toolUsage.slice(0, 5)
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchTools(),
        fetchToolUsage(),
        fetchSavedResults()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  return {
    tools,
    filteredTools,
    toolUsage,
    savedResults,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    toolCategories,
    usageStats,
    isAdmin,
    logToolUsage,
    updateToolUsage,
    saveToolResult,
    refetch: () => Promise.all([fetchTools(), fetchToolUsage(), fetchSavedResults()])
  };
};