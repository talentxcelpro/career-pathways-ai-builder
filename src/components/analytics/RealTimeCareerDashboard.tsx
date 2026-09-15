import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  BarChart3, 
  Users,
  Briefcase,
  GraduationCap,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCareerMetrics } from '@/hooks/useCareerMetrics';
import { useAchievements } from '@/hooks/useAchievements';
import { useRealTimeActivities } from '@/hooks/useRealTimeActivities';
import { useNetworkData } from '@/hooks/useNetworkData';

interface LiveMetricProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: number[];
  target?: number;
  unit?: string;
  icon?: React.ReactNode;
}

const LiveMetric: React.FC<LiveMetricProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  trend,
  target,
  unit = '',
  icon
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value.toString()) || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(numericValue);
    }, 100);
    return () => clearTimeout(timer);
  }, [numericValue]);

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      case 'negative': return <TrendingUp className="h-3 w-3 rotate-180" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-xs font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <motion.div 
            className="text-2xl font-bold"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {typeof value === 'number' ? animatedValue.toLocaleString() : value}{unit}
          </motion.div>
          
          {target && typeof value === 'number' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{target}{unit}</span>
              </div>
              <Progress value={(numericValue / target) * 100} className="h-2" />
            </div>
          )}
          
          {trend && trend.length > 0 && (
            <div className="h-8 flex items-end justify-between">
              {trend.map((point, index) => (
                <motion.div
                  key={index}
                  className="bg-primary/20 w-1"
                  initial={{ height: 0 }}
                  animate={{ height: `${(point / Math.max(...trend)) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface RealtimeUpdateProps {
  timestamp: Date;
  message: string;
  type: 'achievement' | 'milestone' | 'alert' | 'info';
}

const RealtimeUpdate: React.FC<RealtimeUpdateProps> = ({ timestamp, message, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'achievement': return <Award className="h-4 w-4 text-yellow-600" />;
      case 'milestone': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'milestone': return 'bg-green-100 text-green-800';
      case 'alert': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 border rounded-lg"
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString()}
          </span>
          <Badge className={`text-xs ${getBadgeColor()}`}>
            {type}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

export const RealTimeCareerDashboard: React.FC = () => {
  const { careerScore, growthRate, marketRank, opportunities, loading: metricsLoading } = useCareerMetrics();
  const { achievements, totalPoints, loading: achievementsLoading } = useAchievements();
  const { activities, loading: activitiesLoading } = useRealTimeActivities();
  const { connections, loading: networkLoading } = useNetworkData();

  const loading = metricsLoading || achievementsLoading || activitiesLoading || networkLoading;

  // Real-time updates from activities
  const [updates, setUpdates] = useState<RealtimeUpdateProps[]>([]);

  useEffect(() => {
    if (activities.length > 0) {
      const formattedUpdates = activities.slice(0, 5).map(activity => ({
        timestamp: new Date(activity.created_at),
        message: activity.activity_description,
        type: activity.activity_type as 'achievement' | 'milestone' | 'alert' | 'info'
      }));
      setUpdates(formattedUpdates);
    }
  }, [activities]);

  // Real metrics from database
  const [liveMetrics, setLiveMetrics] = useState([
    {
      title: 'Career Readiness',
      value: careerScore || 0,
      change: growthRate || 0,
      changeType: 'positive' as const,
      target: 100,
      unit: '%',
      icon: <Target className="h-4 w-4 text-primary" />,
      trend: [65, 70, 75, 78, 82, careerScore || 0]
    },
    {
      title: 'Profile Views',
      value: 0, // Will be implemented with profile analytics
      change: 0,
      changeType: 'neutral' as const,
      icon: <Users className="h-4 w-4 text-blue-600" />,
      trend: [120, 180, 220, 280, 310, 0]
    },
    {
      title: 'Skill Score',
      value: Math.round(careerScore * 0.9) || 0,
      change: Math.round(growthRate * 0.6) || 0,
      changeType: 'positive' as const,
      target: 90,
      unit: '%',
      icon: <GraduationCap className="h-4 w-4 text-green-600" />,
      trend: [60, 65, 70, 73, 76, Math.round(careerScore * 0.9) || 0]
    },
    {
      title: 'Network Size',
      value: connections?.length || 0,
      change: 15,
      changeType: 'positive' as const,
      icon: <Users className="h-4 w-4 text-purple-600" />,
      trend: [80, 95, 110, 125, 140, connections?.length || 0]
    }
  ]);

  // Update metrics when data changes
  useEffect(() => {
    setLiveMetrics(prev => prev.map(metric => {
      switch (metric.title) {
        case 'Career Readiness':
          return { ...metric, value: careerScore || 0, change: growthRate || 0 };
        case 'Skill Score':
          return { ...metric, value: Math.round(careerScore * 0.9) || 0 };
        case 'Network Size':
          return { ...metric, value: connections?.length || 0 };
        default:
          return metric;
      }
    }));
  }, [careerScore, growthRate, connections]);

  // Real achievements from database
  const recentAchievements = achievements?.slice(0, 3).map(achievement => ({
    title: achievement.achievement_name,
    description: achievement.achievement_description || 'Achievement unlocked',
    date: new Date(achievement.unlocked_at).toLocaleDateString()
  })) || [];

  const careerOpportunities = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      match: 92,
      salary: '$120,000',
      location: 'Remote'
    },
    {
      title: 'React Lead Developer',
      company: 'StartupXYZ',
      match: 88,
      salary: '$110,000',
      location: 'San Francisco'
    },
    {
      title: 'Full Stack Engineer',
      company: 'BigTech',
      match: 85,
      salary: '$130,000',
      location: 'Seattle'
    }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newUpdate: RealtimeUpdateProps = {
        timestamp: new Date(),
        message: `New opportunity match: ${careerOpportunities[Math.floor(Math.random() * careerOpportunities.length)].title}`,
        type: 'info'
      };
      
      setUpdates(prev => [newUpdate, ...prev.slice(0, 4)]);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LiveMetric {...metric} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </motion.div>
              Live Career Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {updates.map((update, index) => (
                <RealtimeUpdate key={index} {...update} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <span className="text-xs text-muted-foreground">{achievement.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Opportunities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              AI-Matched Career Opportunities
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {careerOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm">{opportunity.title}</h3>
                      <p className="text-sm text-muted-foreground">{opportunity.company}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {opportunity.match}% match
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Salary:</span>
                      <span className="font-medium">{opportunity.salary}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{opportunity.location}</span>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};