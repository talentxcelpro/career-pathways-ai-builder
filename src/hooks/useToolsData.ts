import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useToolsData = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolUsage, setToolUsage] = useState<ToolUsage[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tools
  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_registry')
        .select('*')
        .eq('is_active', true)
        .order('category, sort_order');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast.error('Failed to load tools');
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
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
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
    logToolUsage,
    updateToolUsage,
    saveToolResult,
    refetch: () => Promise.all([fetchTools(), fetchToolUsage(), fetchSavedResults()])
  };
};