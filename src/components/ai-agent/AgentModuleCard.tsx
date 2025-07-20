import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight, Zap, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AgentModule {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
  promptCount: number;
  features: string[];
}

interface AgentModuleCardProps {
  module: AgentModule;
  onSelect: () => void;
}

export const AgentModuleCard: React.FC<AgentModuleCardProps> = ({ module, onSelect }) => {
  const IconComponent = module.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden border-0 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            onClick={onSelect}>
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className={`relative p-6 bg-gradient-to-br ${module.color} text-white overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {module.promptCount} prompts
                </Badge>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{module.name}</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {module.description}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="p-6">
            <div className="space-y-3 mb-6">
              {module.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${module.color}`} />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">AI-Powered</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-4 h-4 text-accent" />
                </div>
                <div className="text-xs text-muted-foreground">Precision</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xs text-muted-foreground">Growth</div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full group-hover:shadow-lg transition-shadow duration-300"
              size="lg"
            >
              Start Session
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};