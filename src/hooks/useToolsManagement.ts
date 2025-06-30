
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

  const mockTools: Tool[] = [
    {
      id: '1',
      name: 'Resume Builder',
      description: 'AI-powered resume creation tool',
      category: 'Resume',
      is_active: true,
      usage_count: 1250,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Interview Simulator',
      description: 'Practice interviews with AI feedback',
      category: 'Interview',
      is_active: true,
      usage_count: 890,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Salary Calculator',
      description: 'Calculate market-rate salaries',
      category: 'Salary',
      is_active: true,
      usage_count: 567,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Cover Letter Generator',
      description: 'Generate personalized cover letters',
      category: 'Resume',
      is_active: false,
      usage_count: 234,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const { data: toolsStats } = useQuery({
    queryKey: ['tools-stats'],
    queryFn: async () => {
      return {
        totalTools: mockTools.length,
        activeTools: mockTools.filter(t => t.is_active).length,
        totalUsage: mockTools.reduce((sum, tool) => sum + tool.usage_count, 0),
        categories: [...new Set(mockTools.map(t => t.category))].length
      };
    }
  });

  const { data: tools, isLoading } = useQuery({
    queryKey: ['admin-tools', searchTerm, categoryFilter],
    queryFn: async (): Promise<Tool[]> => {
      let filteredTools = mockTools;

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
    }
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
