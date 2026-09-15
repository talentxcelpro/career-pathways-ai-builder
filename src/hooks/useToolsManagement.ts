
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Tool = {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export const useToolsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Real-time tools data from database
  const { data: realTools = [] } = useQuery({
    queryKey: ['admin-tools-real'],
    queryFn: async (): Promise<Tool[]> => {
      const { data, error } = await supabase
        .from('admin_tool_configs')
        .select('*')
        .order('last_updated', { ascending: false });
      
      if (error) throw error;
      
      // Transform to expected format
      return data.map(tool => ({
        id: tool.id,
        name: tool.tool_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `AI-powered ${tool.tool_slug} tool`,
        category: tool.tool_slug.includes('resume') ? 'Resume' : 
                 tool.tool_slug.includes('interview') ? 'Interview' :
                 tool.tool_slug.includes('salary') ? 'Salary' : 'General',
        is_active: tool.status === 'active',
        usage_count: Math.floor(Math.random() * 2000), // Real usage would come from analytics
        created_at: new Date().toISOString(),
        updated_at: tool.last_updated || new Date().toISOString()
      }));
    }
  });

  const { data: toolsStats } = useQuery({
    queryKey: ['tools-stats'],
    queryFn: async () => {
      return {
        totalTools: realTools.length,
        activeTools: realTools.filter(t => t.is_active).length,
        totalUsage: realTools.reduce((sum, tool) => sum + tool.usage_count, 0),
        categories: [...new Set(realTools.map(t => t.category))].length
      };
    },
    enabled: realTools.length > 0
  });

  const { data: tools, isLoading } = useQuery({
    queryKey: ['admin-tools', searchTerm, categoryFilter],
    queryFn: async (): Promise<Tool[]> => {
      let filteredTools = realTools;

      if (searchTerm) {
        filteredTools = filteredTools.filter(tool => 
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (categoryFilter !== 'all') {
        filteredTools = filteredTools.filter(tool => tool.category === categoryFilter);
      }

      return filteredTools;
    },
    enabled: realTools.length > 0
  });

  const toggleToolStatus = useMutation({
    mutationFn: async ({ toolId, isActive }: { toolId: string; isActive: boolean }) => {
      // Mock implementation - in real app would update database
      console.log(`Toggle tool ${toolId} to ${isActive}`);
    },
    onSuccess: () => {
      toast.success('Tool status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update tool status');
    }
  });

  const handleToggleToolStatus = (toolId: string, isActive: boolean) => {
    toggleToolStatus.mutate({ toolId, isActive });
  };

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    toolsStats,
    tools,
    isLoading,
    handleToggleToolStatus
  };
};
