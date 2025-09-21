import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  Users, 
  Star, 
  TrendingUp, 
  Target,
  Zap,
  Award,
  MessageCircle,
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartRecommendation {
  id: string;
  type: 'skill_match' | 'career_path' | 'mutual_interest' | 'location_based' | 'trending';
  profile: {
    id: string;
    name: string;
    title: string;
    company: string;
    location: string;
    avatar?: string;
  };
  score: number;
  reason: string;
  benefits: string[];
  matchFactors: {
    skills: number;
    experience: number;
    location: number;
    interests: number;
  };
  timing: 'immediate' | 'this_week' | 'this_month';
  confidence: number;
}

interface NetworkingInsight {
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'skills' | 'connections' | 'opportunities' | 'events';
  icon: React.ReactNode;
}

export const SmartNetworkingRecommendations: React.FC = () => {
  const [recommendations] = useState<SmartRecommendation[]>([
    {
      id: '1',
      type: 'skill_match',
      profile: {
        id: '1',
        name: 'Alex Thompson',
        title: 'Senior TypeScript Developer',
        company: 'Microsoft',
        location: 'Seattle, WA',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      score: 94,
      reason: 'Perfect TypeScript expertise match for your career goals',
      benefits: ['TypeScript mastery', 'Microsoft ecosystem insights', 'Senior developer perspective'],
      matchFactors: {
        skills: 95,
        experience: 88,
        location: 75,
        interests: 92
      },
      timing: 'immediate',
      confidence: 94
    },
    {
      id: '2',
      type: 'career_path',
      profile: {
        id: '2',
        name: 'Maria Garcia',
        title: 'Engineering Manager',
        company: 'Spotify',
        location: 'Remote',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150'
      },
      score: 89,
      reason: 'Successful transition from IC to management role',
      benefits: ['Leadership transition insights', 'Team management skills', 'Remote work expertise'],
      matchFactors: {
        skills: 85,
        experience: 95,
        location: 100,
        interests: 78
      },
      timing: 'this_week',
      confidence: 89
    },
    {
      id: '3',
      type: 'trending',
      profile: {
        id: '3',
        name: 'David Chen',
        title: 'AI/ML Engineer',
        company: 'OpenAI',
        location: 'San Francisco, CA',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      score: 86,
      reason: 'Trending AI skills alignment with your interests',
      benefits: ['AI/ML expertise', 'Cutting-edge tech experience', 'Future-ready skills'],
      matchFactors: {
        skills: 78,
        experience: 82,
        location: 85,
        interests: 98
      },
      timing: 'this_month',
      confidence: 86
    }
  ]);

  const [insights] = useState<NetworkingInsight[]>([
    {
      title: 'Expand in AI/ML Network',
      description: 'AI professionals are 40% more likely to respond this month',
      action: 'Connect with 3 AI engineers',
      priority: 'high',
      category: 'skills',
      icon: <Brain className="h-4 w-4" />
    },
    {
      title: 'Local Tech Meetup Tonight',
      description: '12 recommended connections will attend React SF meetup',
      action: 'View attendee list',
      priority: 'high',
      category: 'events',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      title: 'Skill Gap Opportunity',
      description: 'TypeScript experts in your network can mentor you',
      action: 'Request skill mentorship',
      priority: 'medium',
      category: 'skills',
      icon: <Target className="h-4 w-4" />
    },
    {
      title: 'Second-Degree Connections',
      description: '25 potential connections through mutual contacts',
      action: 'Get introductions',
      priority: 'medium',
      category: 'connections',
      icon: <Users className="h-4 w-4" />
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill_match': return <Brain className="h-4 w-4 text-blue-600" />;
      case 'career_path': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'trending': return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'mutual_interest': return <Star className="h-4 w-4 text-purple-600" />;
      case 'location_based': return <MapPin className="h-4 w-4 text-red-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'skill_match': return 'Skill Match';
      case 'career_path': return 'Career Path';
      case 'trending': return 'Trending';
      case 'mutual_interest': return 'Shared Interest';
      case 'location_based': return 'Location';
      default: return 'General';
    }
  };

  const getTimingColor = (timing: string) => {
    switch (timing) {
      case 'immediate': return 'bg-red-100 text-red-800 border-red-200';
      case 'this_week': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'this_month': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Networking Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Networking Score</h2>
                <p className="text-sm text-muted-foreground">
                  Your intelligent networking performance
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">87/100</div>
              <Badge className="bg-green-100 text-green-800">+12 this week</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">23</div>
              <div className="text-sm text-muted-foreground">Smart Matches</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">94%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">156</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">8.2</div>
              <div className="text-sm text-muted-foreground">Avg Match Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Intelligent networking suggestions based on your career goals and behavior
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={rec.profile.avatar} />
                      <AvatarFallback>
                        {rec.profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{rec.profile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rec.profile.title} at {rec.profile.company}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(rec.type)}
                          <span className="text-xs">{getTypeLabel(rec.type)}</span>
                        </div>
                        <Badge className={`text-xs ${getTimingColor(rec.timing)}`}>
                          {rec.timing.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {rec.score}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      match score
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">{rec.reason}</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.benefits.map((benefit, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Match Factors */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {Object.entries(rec.matchFactors).map(([factor, score]) => (
                    <div key={factor} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="capitalize">{factor}</span>
                        <span>{score}%</span>
                      </div>
                      <Progress value={score} className="h-1" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Networking Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Networking Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border-l-4 rounded-lg ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.icon}
                    <h3 className="font-semibold text-sm">{insight.title}</h3>
                  </div>
                  <Badge 
                    variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {insight.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.description}
                </p>
                
                <Button size="sm" variant="outline" className="w-full">
                  {insight.action}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Networking Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Monthly Networking Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">New Quality Connections</span>
              <span className="text-sm text-muted-foreground">8/10</span>
            </div>
            <Progress value={80} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Meaningful Conversations</span>
              <span className="text-sm text-muted-foreground">12/15</span>
            </div>
            <Progress value={80} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Industry Events Attended</span>
              <span className="text-sm text-muted-foreground">2/3</span>
            </div>
            <Progress value={67} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};