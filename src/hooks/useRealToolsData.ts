import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import * as LucideIcons from 'lucide-react';

interface RealTool {
  id: string;
  name: string;
  description: string;
  category: string;
  slug: string;
  icon_name: string;
  icon: React.ReactNode;
  txc_cost: number;
  difficulty: string;
  estimated_time: string;
  is_premium: boolean;
  required_completions: number;
  unlock_level: number;
  isLocked: boolean;
  isCompleted: boolean;
  progress: number;
  usageCount: number;
}

interface UserStats {
  totalTools: number;
  completedTools: number;
  currentStreak: number;
  totalTXC: number;
  userLevel: number;
  nextLevelProgress: number;
}

export const useRealToolsData = () => {
  const { user } = useAuth();
  const { balance } = useTokenBalance();

  // Fetch tools from database
  const { data: tools = [], isLoading: toolsLoading, error: toolsError } = useQuery({
    queryKey: ['tools-registry'],
    queryFn: async () => {
      console.log('🔍 Fetching tools from database...');
      const { data, error } = await supabase
        .from('tool_registry')
        .select('*')
        .eq('is_active', true)
        .order('category, sort_order');
      
      if (error) {
        console.error('❌ Error fetching tools:', error);
        throw error;
      }
      console.log('✅ Tools fetched:', data?.length, 'tools');
      return data || [];
    }
  });

  // Log errors
  if (toolsError) {
    console.error('Tools fetch error:', toolsError);
  }

  // Fetch user's tool usage data
  const { data: userUsage = [], isLoading: usageLoading } = useQuery({
    queryKey: ['user-tool-usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tool_usage_enhanced')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch user profile for name
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, current_streak')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Process tools with real data
  const realTools = useMemo((): RealTool[] => {
    if (!tools.length) return [];

    return tools.map(tool => {
      // Get icon from Lucide Icons
      const IconComponent = (LucideIcons as any)[tool.icon_name] || LucideIcons.Wrench;
      
      // Calculate user's progress with this tool
      const toolUsages = userUsage.filter(usage => usage.tool_slug === tool.slug);
      const completedUsages = toolUsages.filter(usage => usage.completion_status === 'completed');
      const isCompleted = completedUsages.length > 0;
      const usageCount = toolUsages.length;
      const progress = isCompleted ? 100 : (usageCount > 0 ? 50 : 0);

      // Determine if tool is locked
      const completedToolsCount = userUsage.filter(usage => usage.completion_status === 'completed').length;
      const userLevel = Math.floor(completedToolsCount / 3) + 1;
      const isLocked = tool.unlock_level > userLevel || 
        (tool.required_completions > 0 && completedToolsCount < tool.required_completions);

      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        category: tool.category,
        slug: tool.slug,
        icon_name: tool.icon_name,
        icon: IconComponent,
        txc_cost: tool.txc_cost || 0,
        difficulty: tool.difficulty || 'intermediate',
        estimated_time: tool.estimated_time || '5-10 min',
        is_premium: tool.is_premium || false,
        required_completions: tool.required_completions || 0,
        unlock_level: tool.unlock_level || 1,
        isLocked,
        isCompleted,
        progress,
        usageCount
      };
    });
  }, [tools, userUsage]);

  // Calculate user statistics
  const userStats = useMemo((): UserStats => {
    const completedUsages = userUsage.filter(usage => usage.completion_status === 'completed');
    const uniqueCompletedTools = new Set(completedUsages.map(usage => usage.tool_slug)).size;
    const userLevel = Math.floor(uniqueCompletedTools / 3) + 1;
    const nextLevelProgress = ((uniqueCompletedTools % 3) / 3) * 100;

    return {
      totalTools: tools.length,
      completedTools: uniqueCompletedTools,
      currentStreak: profile?.current_streak || 0,
      totalTXC: balance.total || 0,
      userLevel,
      nextLevelProgress
    };
  }, [tools.length, userUsage, profile, balance]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped = realTools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, RealTool[]>);

    return grouped;
  }, [realTools]);

  const isLoading = toolsLoading || usageLoading;

  return {
    tools: realTools,
    toolsByCategory,
    userStats,
    userName: profile?.full_name || 'there',
    userTXCBalance: balance.total || 0,
    isLoading,
    
    // Helper functions
    getToolBySlug: (slug: string) => realTools.find(tool => tool.slug === slug),
    getCompletedToolsInCategory: (category: string) => 
      realTools.filter(tool => tool.category === category && tool.isCompleted).length,
    getTotalToolsInCategory: (category: string) => 
      realTools.filter(tool => tool.category === category).length
  };
};