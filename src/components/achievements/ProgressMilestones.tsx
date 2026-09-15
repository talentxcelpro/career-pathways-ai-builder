import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Award,
  ArrowRight,
  Flag,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'career' | 'custom';
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'overdue' | 'paused';
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  completedAt?: Date;
  streakCount?: number;
}

const milestones: Milestone[] = [
  {
    id: '1',
    title: 'Complete Profile',
    description: 'Finish setting up your professional profile',
    category: 'career',
    target: 100,
    current: 85,
    unit: '%',
    priority: 'high',
    status: 'active',
    reward: {
      points: 100,
      badge: 'Profile Master',
      title: 'Profile Complete'
    }
  },
  {
    id: '2',
    title: 'Daily Skill Practice',
    description: 'Complete skill assessments every day this week',
    category: 'daily',
    target: 7,
    current: 4,
    unit: 'days',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    status: 'active',
    reward: {
      points: 150,
      badge: 'Consistent Learner'
    },
    streakCount: 4
  },
  {
    id: '3',
    title: 'Network Expansion',
    description: 'Connect with 50 professionals this month',
    category: 'monthly',
    target: 50,
    current: 32,
    unit: 'connections',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    status: 'active',
    reward: {
      points: 200,
      badge: 'Super Connector'
    }
  },
  {
    id: '4',
    title: 'Skill Certifications',
    description: 'Earn 3 verified skill certifications',
    category: 'career',
    target: 3,
    current: 3,
    unit: 'certifications',
    priority: 'high',
    status: 'completed',
    reward: {
      points: 300,
      badge: 'Skill Expert',
      title: 'Certified Professional'
    },
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Interview Preparation',
    description: 'Complete 10 practice interviews',
    category: 'weekly',
    target: 10,
    current: 6,
    unit: 'interviews',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'critical',
    status: 'active',
    reward: {
      points: 250,
      badge: 'Interview Ready'
    }
  }
];

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200'
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'overdue':
      return <Clock className="h-5 w-5 text-red-500" />;
    case 'paused':
      return <Clock className="h-5 w-5 text-gray-500" />;
    default:
      return <Target className="h-5 w-5 text-primary" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'daily':
      return <Calendar className="h-4 w-4" />;
    case 'weekly':
      return <Calendar className="h-4 w-4" />;
    case 'monthly':
      return <Calendar className="h-4 w-4" />;
    case 'career':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Flag className="h-4 w-4" />;
  }
};

export const ProgressMilestones: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredMilestones = milestones.filter(milestone => {
    const categoryMatch = selectedCategory === 'all' || milestone.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || milestone.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const stats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    active: milestones.filter(m => m.status === 'active').length,
    overdue: milestones.filter(m => m.status === 'overdue').length,
    totalPoints: milestones.reduce((sum, m) => sum + (m.status === 'completed' ? m.reward.points : 0), 0)
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Milestones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          <Button
            variant={selectedCategory === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('daily')}
          >
            Daily
          </Button>
          <Button
            variant={selectedCategory === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={selectedCategory === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={selectedCategory === 'career' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('career')}
          >
            Career
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            All Status
          </Button>
          <Button
            variant={selectedStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('active')}
          >
            Active
          </Button>
          <Button
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {filteredMilestones.map((milestone, index) => {
          const progressPercentage = (milestone.current / milestone.target) * 100;
          const isNearDeadline = milestone.deadline && 
            new Date(milestone.deadline).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;
          
          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${milestone.status === 'completed' ? 'bg-green-50 border-green-200' : ''} 
                ${isNearDeadline && milestone.status === 'active' ? 'border-amber-300 bg-amber-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getStatusIcon(milestone.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{milestone.title}</h3>
                          <Badge className={getPriorityColor(milestone.priority)}>
                            {milestone.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(milestone.category)}
                            {milestone.category}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{milestone.description}</p>
                        
                        {milestone.streakCount && milestone.streakCount > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600">
                              {milestone.streakCount} day streak!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{milestone.reward.points} points</span>
                      </div>
                      {milestone.deadline && milestone.status !== 'completed' && (
                        <p className={`text-sm ${isNearDeadline ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                          Due: {milestone.deadline.toLocaleDateString()}
                        </p>
                      )}
                      {milestone.completedAt && (
                        <p className="text-sm text-green-600">
                          Completed: {milestone.completedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{milestone.current}/{milestone.target} {milestone.unit}</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className={milestone.status === 'completed' ? 'bg-green-100' : ''}
                    />
                    
                    {milestone.status === 'active' && progressPercentage < 100 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {Math.round(progressPercentage)}% complete
                        </span>
                        <Button size="sm" variant="outline">
                          Continue <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}

                    {milestone.reward.badge && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span>Reward: {milestone.reward.badge}</span>
                        {milestone.reward.title && (
                          <span className="text-muted-foreground">+ "{milestone.reward.title}" title</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};