import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, MessageSquare, Brain, Network, Briefcase, Building2, GraduationCap, FileText, Wrench, Users, Map, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentChatInterface } from '@/components/ai-agent/AgentChatInterface';
import { PromptLibrary } from '@/components/ai-agent/PromptLibrary';
import { AgentModuleCard } from '@/components/ai-agent/AgentModuleCard';
import { useAIAgent } from '@/hooks/useAIAgent';

const AGENT_MODULES = [
  {
    id: 'general',
    name: 'General Chat',
    icon: Bot,
    description: 'General career guidance and platform-wide assistance',
    color: 'from-primary to-accent',
    promptCount: 100,
    features: ['General advice', 'Platform help', 'Career guidance']
  },
  {
    id: 'network',
    name: 'Network',
    icon: Network,
    description: 'AI-enhanced networking, connections, and relationship management',
    color: 'from-blue-500 to-cyan-500',
    promptCount: 30,
    features: ['Smart connections', 'Influence mapping', 'Engagement optimization']
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: Briefcase,
    description: 'Intelligent job matching, application optimization, and career insights',
    color: 'from-emerald-500 to-green-500',
    promptCount: 75,
    features: ['Smart matching', 'Success prediction', 'Market intelligence']
  },
  {
    id: 'employer',
    name: 'Employer',
    icon: Users,
    description: 'Recruitment intelligence, candidate scoring, and hiring optimization',
    color: 'from-purple-500 to-violet-500',
    promptCount: 50,
    features: ['Candidate analysis', 'Team insights', 'Hiring automation']
  },
  {
    id: 'companies',
    name: 'Companies',
    icon: Building2,
    description: 'Company intelligence, culture analysis, and strategic insights',
    color: 'from-orange-500 to-red-500',
    promptCount: 30,
    features: ['Market research', 'Growth prediction', 'Culture insights']
  },
  {
    id: 'resume-builder',
    name: 'Resume Builder',
    icon: FileText,
    description: 'AI-powered resume enhancement and ATS optimization',
    color: 'from-pink-500 to-rose-500',
    promptCount: 70,
    features: ['Content enhancement', 'ATS optimization', 'Industry customization']
  },
  {
    id: 'tools',
    name: 'Tools',
    icon: Wrench,
    description: 'Career assessment, decision support, and performance tracking',
    color: 'from-teal-500 to-cyan-500',
    promptCount: 40,
    features: ['SWOT analysis', 'Skill gaps', 'Decision support']
  },
  {
    id: 'learning',
    name: 'Learning',
    icon: GraduationCap,
    description: 'Personalized learning paths and skill development',
    color: 'from-indigo-500 to-blue-500',
    promptCount: 60,
    features: ['Custom roadmaps', 'Skill prioritization', 'Progress tracking']
  },
  {
    id: 'career-map',
    name: 'Career Map',
    icon: Map,
    description: 'Strategic career planning and milestone tracking',
    color: 'from-amber-500 to-yellow-500',
    promptCount: 75,
    features: ['5-year roadmaps', 'Risk assessment', 'Future skills']
  }
];

export const TalentXcelAgent = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const { 
    conversations, 
    currentConversation, 
    createConversation, 
    sendMessage,
    isLoading 
  } = useAIAgent();

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    setShowChat(true);
    if (!currentConversation || currentConversation.module_name !== moduleId) {
      createConversation(moduleId);
    }
  };

  const handlePromptSelect = (prompt: any) => {
    if (prompt.module_name !== selectedModule) {
      setSelectedModule(prompt.module_name);
    }
    setShowChat(true);
    if (!currentConversation || currentConversation.module_name !== prompt.module_name) {
      createConversation(prompt.module_name);
    }
    // Send the prompt as a message
    sendMessage(prompt.prompt_content, prompt.module_name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 animate-pulse" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl">
                  <Bot className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  TalentXcel Agent
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Your AI-powered career intelligence assistant
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                500+ AI Prompts
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Brain className="w-4 h-4 mr-2" />
                10 Modules
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                Real-time Intelligence
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => setShowPromptLibrary(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Explore Prompts
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setSelectedModule('general');
                  setShowChat(true);
                  if (!currentConversation) {
                    createConversation('general');
                  }
                }}
              >
                <Bot className="w-5 h-5 mr-2" />
                Start Quick Chat
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {!showChat ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your AI Module</h2>
              <p className="text-muted-foreground text-lg">
                Select a module to unlock specialized AI capabilities for your career growth
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {AGENT_MODULES.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                >
                  <AgentModuleCard
                    module={module}
                    onSelect={() => handleModuleSelect(module.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16"
            >
              <Card className="p-8 bg-gradient-to-r from-card via-card/95 to-accent/5 border-0 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">500+</div>
                    <div className="text-muted-foreground">AI Prompts</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-accent mb-2">10</div>
                    <div className="text-muted-foreground">Specialized Modules</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">∞</div>
                    <div className="text-muted-foreground">Career Possibilities</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="h-[70vh]"
          >
            <AgentChatInterface
              selectedModule={selectedModule}
              conversation={currentConversation}
              onSendMessage={sendMessage}
              onBack={() => setShowChat(false)}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </div>

      {/* Prompt Library Modal */}
      <AnimatePresence>
        {showPromptLibrary && (
          <PromptLibrary
            onClose={() => setShowPromptLibrary(false)}
            onPromptSelect={handlePromptSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TalentXcelAgent;