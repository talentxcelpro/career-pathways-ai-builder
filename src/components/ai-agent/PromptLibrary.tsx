import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface PromptLibraryProps {
  onClose: () => void;
  onPromptSelect: (prompt: any) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ onClose, onPromptSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const { data: prompts = [] } = useQuery({
    queryKey: ['aiAgentPrompts'],
    queryFn: async () => {
      const { data } = await (window as any).supabase
        .from('ai_agent_prompts')
        .select('*')
        .eq('is_active', true);
      return data || [];
    }
  });

  const filteredPrompts = prompts.filter((prompt: any) => {
    const matchesSearch = prompt.prompt_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.prompt_content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'all' || prompt.module_name === selectedModule;
    return matchesSearch && matchesModule;
  });

  const modules = ['all', 'network', 'jobs', 'employer', 'companies', 'resume-builder', 'tools', 'learning', 'career-map'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Prompt Library
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {modules.map(module => (
                <option key={module} value={module}>
                  {module === 'all' ? 'All Modules' : module.charAt(0).toUpperCase() + module.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-4">
            {filteredPrompts.map((prompt: any) => (
              <Card 
                key={prompt.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  onPromptSelect(prompt);
                  onClose();
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{prompt.prompt_title}</h3>
                    <Badge variant="secondary">{prompt.module_name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {prompt.prompt_content.slice(0, 150)}...
                  </p>
                  <div className="flex gap-2">
                    {prompt.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};