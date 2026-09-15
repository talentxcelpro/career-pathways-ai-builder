import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Flag,
  Award,
  Star,
  ArrowRight,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'career' | 'skill' | 'education' | 'network' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'blocked';
  progress: number;
  targetDate: Date;
  startDate: Date;
  completedDate?: Date;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    dueDate: Date;
    completedDate?: Date;
  }[];
  metrics: {
    key: string;
    current: number;
    target: number;
    unit: string;
  }[];
  dependencies: string[];
  tags: string[];
  estimatedEffort: string;
  actualEffort?: string;
}

const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Become AWS Solutions Architect',
    description: 'Achieve AWS Solutions Architect Professional certification and gain hands-on cloud architecture experience',
    category: 'skill',
    priority: 'critical',
    status: 'in_progress',
    progress: 45,
    targetDate: new Date('2024-08-15'),
    startDate: new Date('2024-02-01'),
    milestones: [
      {
        id: '1a',
        title: 'Complete AWS Associate Certification',
        completed: true,
        dueDate: new Date('2024-04-01'),
        completedDate: new Date('2024-03-28')
      },
      {
        id: '1b',
        title: 'Build 3 cloud architecture projects',
        completed: false,
        dueDate: new Date('2024-06-15')
      },
      {
        id: '1c',
        title: 'Pass AWS Professional Exam',
        completed: false,
        dueDate: new Date('2024-08-15')
      }
    ],
    metrics: [
      { key: 'Study Hours', current: 87, target: 200, unit: 'hours' },
      { key: 'Practice Exams', current: 4, target: 10, unit: 'exams' },
      { key: 'Projects Completed', current: 1, target: 3, unit: 'projects' }
    ],
    dependencies: [],
    tags: ['AWS', 'Cloud', 'Architecture', 'Certification'],
    estimatedEffort: '200 hours over 6 months'
  },
  {
    id: '2',
    title: 'Lead Cross-Functional Team',
    description: 'Successfully lead a cross-functional team on a major product initiative',
    category: 'career',
    priority: 'high',
    status: 'not_started',
    progress: 0,
    targetDate: new Date('2024-12-31'),
    startDate: new Date('2024-06-01'),
    milestones: [
      {
        id: '2a',
        title: 'Complete leadership training',
        completed: false,
        dueDate: new Date('2024-07-01')
      },
      {
        id: '2b',
        title: 'Identify team members and stakeholders',
        completed: false,
        dueDate: new Date('2024-08-01')
      },
      {
        id: '2c',
        title: 'Execute project successfully',
        completed: false,
        dueDate: new Date('2024-12-31')
      }
    ],
    metrics: [
      { key: 'Team Size', current: 0, target: 8, unit: 'people' },
      { key: 'Project Milestones', current: 0, target: 12, unit: 'milestones' },
      { key: 'Stakeholder Meetings', current: 0, target: 24, unit: 'meetings' }
    ],
    dependencies: ['1'],
    tags: ['Leadership', 'Management', 'Cross-functional', 'Project'],
    estimatedEffort: '6 months part-time leadership role'
  },
  {
    id: '3',
    title: 'Expand Professional Network',
    description: 'Build meaningful connections with 50 industry professionals and thought leaders',
    category: 'network',
    priority: 'medium',
    status: 'in_progress',
    progress: 62,
    targetDate: new Date('2024-10-31'),
    startDate: new Date('2024-01-01'),
    milestones: [
      {
        id: '3a',
        title: 'Attend 6 industry events',
        completed: true,
        dueDate: new Date('2024-06-30'),
        completedDate: new Date('2024-06-15')
      },
      {
        id: '3b',
        title: 'Connect with 30 professionals on LinkedIn',
        completed: true,
        dueDate: new Date('2024-07-31'),
        completedDate: new Date('2024-07-20')
      },
      {
        id: '3c',
        title: 'Have 20 meaningful conversations',
        completed: false,
        dueDate: new Date('2024-10-31')
      }
    ],
    metrics: [
      { key: 'New Connections', current: 31, target: 50, unit: 'people' },
      { key: 'Events Attended', current: 6, target: 8, unit: 'events' },
      { key: 'Conversations', current: 12, target: 20, unit: 'conversations' }
    ],
    dependencies: [],
    tags: ['Networking', 'Events', 'LinkedIn', 'Relationships'],
    estimatedEffort: '2-3 hours per week'
  },
  {
    id: '4',
    title: 'Master Data Science Fundamentals',
    description: 'Develop strong foundation in data science, machine learning, and analytics',
    category: 'skill',
    priority: 'medium',
    status: 'paused',
    progress: 25,
    targetDate: new Date('2025-02-28'),
    startDate: new Date('2024-03-01'),
    milestones: [
      {
        id: '4a',
        title: 'Complete Python for Data Science course',
        completed: true,
        dueDate: new Date('2024-05-01'),
        completedDate: new Date('2024-04-28')
      },
      {
        id: '4b',
        title: 'Build 3 data analysis projects',
        completed: false,
        dueDate: new Date('2024-09-30')
      },
      {
        id: '4c',
        title: 'Complete ML specialization',
        completed: false,
        dueDate: new Date('2025-02-28')
      }
    ],
    metrics: [
      { key: 'Courses Completed', current: 2, target: 8, unit: 'courses' },
      { key: 'Projects Built', current: 1, target: 5, unit: 'projects' },
      { key: 'Study Hours', current: 45, target: 180, unit: 'hours' }
    ],
    dependencies: [],
    tags: ['Data Science', 'Python', 'Machine Learning', 'Analytics'],
    estimatedEffort: '10 hours per week for 8 months'
  }
];

const getStatusColor = (status: Goal['status']) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: Goal['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusIcon = (status: Goal['status']) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'in_progress': return <Play className="h-5 w-5 text-blue-600" />;
    case 'paused': return <Pause className="h-5 w-5 text-yellow-600" />;
    case 'blocked': return <AlertCircle className="h-5 w-5 text-red-600" />;
    default: return <Target className="h-5 w-5 text-gray-600" />;
  }
};

const getCategoryIcon = (category: Goal['category']) => {
  switch (category) {
    case 'career': return <TrendingUp className="h-4 w-4" />;
    case 'skill': return <Award className="h-4 w-4" />;
    case 'education': return <Award className="h-4 w-4" />;
    case 'network': return <Target className="h-4 w-4" />;
    case 'personal': return <Star className="h-4 w-4" />;
    default: return <Flag className="h-4 w-4" />;
  }
};

export const GoalTracking: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredGoals = sampleGoals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.status === 'in_progress';
    if (filter === 'completed') return goal.status === 'completed';
    return goal.category === filter;
  });

  const stats = {
    total: sampleGoals.length,
    completed: sampleGoals.filter(g => g.status === 'completed').length,
    inProgress: sampleGoals.filter(g => g.status === 'in_progress').length,
    overdue: sampleGoals.filter(g => new Date(g.targetDate) < new Date() && g.status !== 'completed').length,
    averageProgress: Math.round(sampleGoals.reduce((sum, g) => sum + g.progress, 0) / sampleGoals.length)
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilTarget = (targetDate: Date) => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flag className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.overdue}</p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.averageProgress}%</p>
            <p className="text-sm text-muted-foreground">Avg Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Goals
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={filter === 'career' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('career')}
        >
          Career
        </Button>
        <Button
          variant={filter === 'skill' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('skill')}
        >
          Skills
        </Button>
        <Button
          variant={filter === 'network' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('network')}
        >
          Network
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal, index) => {
          const daysUntilTarget = getDaysUntilTarget(goal.targetDate);
          const isOverdue = daysUntilTarget < 0 && goal.status !== 'completed';
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-300 bg-red-50/50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(goal.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`} />
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(goal.category)}
                            {goal.category}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{goal.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Progress</p>
                            <div className="flex items-center gap-2">
                              <Progress value={goal.progress} className="flex-1" />
                              <span className="text-sm font-medium">{goal.progress}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Target Date</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                {formatDate(goal.targetDate)}
                              </span>
                            </div>
                            {daysUntilTarget >= 0 ? (
                              <p className="text-xs text-muted-foreground">{daysUntilTarget} days left</p>
                            ) : (
                              <p className="text-xs text-red-600 font-medium">
                                {Math.abs(daysUntilTarget)} days overdue
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Effort</p>
                            <p className="text-sm text-muted-foreground">{goal.estimatedEffort}</p>
                          </div>
                        </div>

                        {/* Milestones */}
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Milestones</p>
                          <div className="space-y-1">
                            {goal.milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-center gap-2 text-sm">
                                {milestone.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <div className="w-4 h-4 border border-gray-300 rounded" />
                                )}
                                <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                                  {milestone.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(milestone.dueDate)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Key Metrics</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {goal.metrics.map((metric, idx) => (
                              <div key={idx} className="bg-muted/50 p-2 rounded">
                                <div className="flex justify-between text-sm">
                                  <span>{metric.key}</span>
                                  <span>{metric.current}/{metric.target} {metric.unit}</span>
                                </div>
                                <Progress 
                                  value={(metric.current / metric.target) * 100} 
                                  className="h-1 mt-1" 
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {goal.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedGoal(goal)}
                      >
                        View Details
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
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