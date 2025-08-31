import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  Calendar, 
  CheckCircle, 
  Clock,
  Award,
  Medal,
  Crown,
  Gem,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AchievementHubProps {
  achievements?: any[];
  userBadges?: any[];
  isOwner?: boolean;
  userId?: string;
}

export function AchievementHub({ 
  achievements = [], 
  userBadges = [], 
  isOwner = true, 
  userId 
}: AchievementHubProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Sample milestone data - in real app, this would come from backend
  const careerMilestones = [
    { 
      id: 1, 
      title: 'Profile Perfectionist', 
      description: 'Complete your professional profile', 
      progress: 85, 
      target: 100, 
      isCompleted: false,
      points: 100,
      category: 'profile',
      action: () => navigate('/profile/edit')
    },
    { 
      id: 2, 
      title: 'Resume Ready', 
      description: 'Create your first resume', 
      progress: 100, 
      target: 100, 
      isCompleted: true,
      points: 150,
      category: 'resume',
      earnedAt: '2024-01-15'
    },
    { 
      id: 3, 
      title: 'Skill Showcase', 
      description: 'Add 10+ skills to your profile', 
      progress: 7, 
      target: 10, 
      isCompleted: false,
      points: 75,
      category: 'skills',
      action: () => navigate('/profile/skills')
    },
    { 
      id: 4, 
      title: 'Network Builder', 
      description: 'Connect with 25 professionals', 
      progress: 12, 
      target: 25, 
      isCompleted: false,
      points: 200,
      category: 'network',
      action: () => navigate('/network')
    },
    { 
      id: 5, 
      title: 'Job Hunter', 
      description: 'Apply to 10 jobs', 
      progress: 3, 
      target: 10, 
      isCompleted: false,
      points: 300,
      category: 'jobs',
      action: () => navigate('/jobs')
    },
    { 
      id: 6, 
      title: 'Certified Professional', 
      description: 'Earn 3 certifications', 
      progress: 1, 
      target: 3, 
      isCompleted: false,
      points: 500,
      category: 'certification',
      action: () => navigate('/learning')
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: Award },
    { id: 'profile', label: 'Profile', icon: Star },
    { id: 'resume', label: 'Resume', icon: Trophy },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'network', label: 'Network', icon: Medal },
    { id: 'jobs', label: 'Jobs', icon: Crown },
    { id: 'certification', label: 'Certs', icon: Gem }
  ];

  const filteredMilestones = selectedCategory === 'all' 
    ? careerMilestones 
    : careerMilestones.filter(m => m.category === selectedCategory);

  const completedCount = careerMilestones.filter(m => m.isCompleted).length;
  const totalPoints = careerMilestones
    .filter(m => m.isCompleted)
    .reduce((sum, m) => sum + m.points, 0);

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'profile': return <Star className="w-5 h-5" />;
      case 'resume': return <Trophy className="w-5 h-5" />;
      case 'skills': return <Target className="w-5 h-5" />;
      case 'network': return <Medal className="w-5 h-5" />;
      case 'jobs': return <Crown className="w-5 h-5" />;
      case 'certification': return <Gem className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Completed</p>
                <p className="text-2xl font-bold text-yellow-800">{completedCount}/{careerMilestones.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <Progress 
              value={(completedCount / careerMilestones.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Points</p>
                <p className="text-2xl font-bold text-purple-800">{totalPoints}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Badges Earned</p>
                <p className="text-2xl font-bold text-green-800">{userBadges.length}</p>
              </div>
              <Medal className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Hub */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievement Hub
            <Badge variant="secondary" className="ml-auto">
              Track your career milestones and unlock new achievements
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMilestones.map((milestone) => (
              <Card 
                key={milestone.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  milestone.isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        milestone.isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {milestone.isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          getAchievementIcon(milestone.category)
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={milestone.isCompleted ? 'default' : 'secondary'}
                      className="shrink-0"
                    >
                      {milestone.points} pts
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Progress: {milestone.progress}/{milestone.target}
                      </span>
                      <span className="font-medium">
                        {Math.round((milestone.progress / milestone.target) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(milestone.progress / milestone.target) * 100}
                      className={`h-2 ${milestone.isCompleted ? 'bg-green-200' : ''}`}
                    />
                  </div>

                  {/* Action or Completion Info */}
                  <div className="mt-4 flex items-center justify-between">
                    {milestone.isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Completed {milestone.earnedAt && new Date(milestone.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isOwner && milestone.action && (
                          <Button 
                            size="sm" 
                            onClick={milestone.action}
                            className="flex items-center gap-2"
                          >
                            <Unlock className="w-4 h-4" />
                            Continue
                          </Button>
                        )}
                        {!isOwner && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm">In Progress</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMilestones.length === 0 && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No achievements in this category yet.</p>
              {isOwner && (
                <Button className="mt-4" onClick={() => setSelectedCategory('all')}>
                  View All Achievements
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Badges */}
      {userBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5" />
              Recent Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userBadges.slice(0, 8).map((badge, index) => (
                <div 
                  key={badge.id || index}
                  className="text-center p-4 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Medal className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    {badge.badge_name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {badge.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {badge.points_awarded} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}