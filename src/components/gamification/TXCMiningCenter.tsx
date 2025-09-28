import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTXCMining } from '@/hooks/useTXCMining';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import txcMascot from '@/assets/txc-mascot.jpg';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  Flame, 
  Target, 
  Users, 
  Briefcase, 
  Star,
  Gift,
  Calendar,
  TrendingUp
} from 'lucide-react';

export const TXCMiningCenter: React.FC = () => {
  const { earnTXC, getAllRewards, isProcessing } = useTXCMining();
  const { refreshBalance } = useTokenBalance();
  const [completedToday, setCompletedToday] = useState<string[]>([]);

  const handleEarnTXC = async (action: string) => {
    const success = await earnTXC(action);
    if (success) {
      setCompletedToday(prev => [...prev, action]);
      refreshBalance();
    }
  };

  const miningActivities = [
    {
      id: 'daily_login',
      title: 'Daily Check-in',
      description: 'Visit TalentXcel daily to earn bonus tokens',
      reward: 75,
      icon: Calendar,
      cooldown: 1440,
      difficulty: 'Easy',
      category: 'Daily'
    },
    {
      id: 'post_created',
      title: 'Create Post',
      description: 'Share insights with the community',
      reward: 150,
      icon: Star,
      cooldown: 60,
      difficulty: 'Medium',
      category: 'Social'
    },
    {
      id: 'job_applied',
      title: 'Apply to Job',
      description: 'Apply to any job posting',
      reward: 90,
      icon: Briefcase,
      cooldown: 60,
      difficulty: 'Easy',
      category: 'Career'
    },
    {
      id: 'connection_made',
      title: 'Make Connection',
      description: 'Connect with professionals',
      reward: 75,
      icon: Users,
      cooldown: 30,
      difficulty: 'Easy',
      category: 'Network'
    },
    {
      id: 'profile_completed',
      title: 'Complete Profile',
      description: 'Fill out all profile sections',
      reward: 300,
      icon: Target,
      cooldown: 1440,
      difficulty: 'Hard',
      category: 'Profile'
    },
    {
      id: 'course_completed',
      title: 'Complete Course',
      description: 'Finish any learning course',
      reward: 600,
      icon: Gift,
      cooldown: 60,
      difficulty: 'Hard',
      category: 'Learning'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Daily': return 'bg-blue-100 text-blue-800';
      case 'Social': return 'bg-purple-100 text-purple-800';
      case 'Career': return 'bg-indigo-100 text-indigo-800';
      case 'Network': return 'bg-pink-100 text-pink-800';
      case 'Profile': return 'bg-cyan-100 text-cyan-800';
      case 'Learning': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Mining Header */}
      <Card className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-400/30">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4">
              <img src={txcMascot} alt="TXC Mascot" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-bold text-green-700 mb-2">TXC Mining Center</h2>
            <p className="text-green-600 mb-6">Complete activities to mine TXC tokens and grow your blockchain portfolio</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">{completedToday.length}</div>
                <div className="text-sm text-green-600">Activities Today</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">
                  {completedToday.reduce((sum, id) => {
                    const activity = miningActivities.find(a => a.id === id);
                    return sum + (activity?.reward || 0);
                  }, 0)}
                </div>
                <div className="text-sm text-green-600">TXC Earned Today</div>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700 flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" />
                  95%
                </div>
                <div className="text-sm text-green-600">Mining Efficiency</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mining Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {miningActivities.map((activity) => {
          const Icon = activity.icon;
          const isCompleted = completedToday.includes(activity.id);
          
          return (
            <Card key={activity.id} className={`
              relative overflow-hidden transition-all duration-300 hover:shadow-lg
              ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:scale-105'}
            `}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-br from-primary to-secondary'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <Icon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(activity.category)}>
                      {activity.category}
                    </Badge>
                    <Badge className={getDifficultyColor(activity.difficulty)}>
                      {activity.difficulty}
                    </Badge>
                  </div>

                  {/* Reward */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">+{activity.reward} TXC</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {activity.cooldown >= 1440 ? `${activity.cooldown / 1440}d` : `${activity.cooldown}m`}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full"
                    onClick={() => handleEarnTXC(activity.id)}
                    disabled={isProcessing || isCompleted}
                    variant={isCompleted ? "secondary" : "default"}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Start Mining
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>

              {/* Completed Overlay */}
              {isCompleted && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Mining Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Mining Tips & Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Maximize Your Earnings</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Complete daily activities for consistent rewards
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Focus on high-reward activities during peak hours
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Build streaks to unlock bonus multipliers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Engage with community for social mining bonuses
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-secondary">Mining Efficiency</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  Time activities based on cooldown periods
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  Complete profile sections for one-time bonuses
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  Monitor blockchain network status
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  Participate in special mining events
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};