import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, FileText, GraduationCap, 
  Target, Building, Zap, BarChart3, Trophy, 
  Smartphone, Star, Gift 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';

const modules = [
  { 
    name: 'Jobs', 
    path: '/jobs', 
    icon: Briefcase, 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-400',
    activities: ['Browse Jobs', 'Apply to Positions', 'Save Favorites', 'Set Alerts'],
    rewards: 90
  },
  { 
    name: 'Network', 
    path: '/network', 
    icon: Users, 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-400',
    activities: ['Connect with Professionals', 'Send Messages', 'Join Groups', 'Attend Events'],
    rewards: 75
  },
  { 
    name: 'Resume', 
    path: '/resume', 
    icon: FileText, 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-400',
    activities: ['Build Resume', 'AI Enhancement', 'Template Selection', 'Download/Share'],
    rewards: 225
  },
  { 
    name: 'Learning', 
    path: '/learning', 
    icon: GraduationCap, 
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-700 dark:text-indigo-400',
    activities: ['Take Courses', 'Complete Assessments', 'Earn Certificates', 'Skill Building'],
    rewards: 600
  },
  { 
    name: 'Career Map', 
    path: '/career-map', 
    icon: Target, 
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-400',
    activities: ['Set Goals', 'Track Progress', 'Plan Path', 'Milestone Achievements'],
    rewards: 150
  },
  { 
    name: 'Companies', 
    path: '/companies', 
    icon: Building, 
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-400',
    activities: ['Research Companies', 'Follow Organizations', 'Read Reviews', 'Connect with Teams'],
    rewards: 45
  },
  { 
    name: 'Tools', 
    path: '/tools', 
    icon: Zap, 
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    activities: ['Use AI Tools', 'Career Calculator', 'Salary Insights', 'Interview Prep'],
    rewards: 120
  },
  { 
    name: 'Analytics', 
    path: '/analytics', 
    icon: BarChart3, 
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    textColor: 'text-teal-700 dark:text-teal-400',
    activities: ['View Reports', 'Track Metrics', 'Performance Analysis', 'Growth Insights'],
    rewards: 75
  },
  { 
    name: 'Profile', 
    path: '/profile', 
    icon: Star, 
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-700 dark:text-pink-400',
    activities: ['Complete Profile', 'Add Skills', 'Upload Photos', 'Professional Summary'],
    rewards: 300
  },
  { 
    name: 'Marketplace', 
    path: '/marketplace', 
    icon: Gift, 
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    textColor: 'text-violet-700 dark:text-violet-400',
    activities: ['Browse Services', 'Purchase Features', 'Premium Content', 'Exclusive Access'],
    rewards: 50
  },
  { 
    name: 'Mobile', 
    path: '/mobile', 
    icon: Smartphone, 
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-700 dark:text-cyan-400',
    activities: ['Mobile Engagement', 'Quick Actions', 'Notifications', 'On-the-go Access'],
    rewards: 25
  },
  { 
    name: 'Gamification', 
    path: '/gamification', 
    icon: Trophy, 
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-700 dark:text-amber-400',
    activities: ['Earn TXC', 'Complete Challenges', 'Unlock Achievements', 'Climb Leaderboards'],
    rewards: 100
  }
];

export const ModuleEngagementTracker = () => {
  const location = useLocation();
  const { earnTXC } = useTXCIntegration();
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({});
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const currentModule = modules.find(m => currentPath.startsWith(m.path));
    
    if (currentModule) {
      setActiveModule(currentModule.name);
      
      // Simulate progress tracking
      setModuleProgress(prev => ({
        ...prev,
        [currentModule.name]: Math.min((prev[currentModule.name] || 0) + 10, 100)
      }));
    }
  }, [location.pathname]);

  const getModuleProgress = (moduleName: string) => {
    return moduleProgress[moduleName] || Math.floor(Math.random() * 60) + 20; // Mock progress
  };

  const getCompletedModules = () => {
    return modules.filter(module => getModuleProgress(module.name) >= 100).length;
  };

  const getTotalRewards = () => {
    return modules.reduce((total, module) => {
      const progress = getModuleProgress(module.name);
      return total + Math.floor((progress / 100) * module.rewards);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overview Stats */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Module Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <div className="text-2xl font-bold text-primary">{modules.length}</div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <div className="text-2xl font-bold text-green-600">{getCompletedModules()}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <div className="text-2xl font-bold text-amber-600">{getTotalRewards().toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">TXC Earned</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((getCompletedModules() / modules.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const progress = getModuleProgress(module.name);
          const isActive = activeModule === module.name;
          const earnedRewards = Math.floor((progress / 100) * module.rewards);

          return (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 ${
                isActive 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}>
                <CardContent className="p-4">
                  {/* Module Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${module.bgColor}`}>
                        <Icon className={`h-4 w-4 ${module.textColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{module.name}</h3>
                        <p className="text-xs text-muted-foreground">{module.path}</p>
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Progress</span>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">TXC Earned</span>
                    <span className="text-sm font-semibold text-amber-600">
                      {earnedRewards} / {module.rewards}
                    </span>
                  </div>

                  {/* Activities */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Key Activities:</p>
                    <div className="flex flex-wrap gap-1">
                      {module.activities.slice(0, 2).map((activity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                      {module.activities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{module.activities.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Background gradient */}
                  <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 bg-gradient-to-br ${module.color} rounded-bl-full`} />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};