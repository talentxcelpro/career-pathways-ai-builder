import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Briefcase, MapPin, Clock, DollarSign, Star, TrendingUp, Bookmark, Share2, Eye, Zap } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  posted: string;
  applicants: number;
  matchScore: number;
  isBookmarked: boolean;
  aiInsights: {
    compatibility: number;
    growthPotential: number;
    skillGap: string[];
    recommendations: string[];
  };
  recruiter: {
    name: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
}

interface AIJobRecommendationsProps {
  className?: string;
}

export const AIJobRecommendations: React.FC<AIJobRecommendationsProps> = ({ className = '' }) => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Product Manager - AI Platform',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: { min: 140000, max: 180000, currency: 'USD' },
      description: 'Lead product strategy for our AI-powered platform serving millions of users...',
      requirements: ['5+ years PM experience', 'AI/ML product experience', 'Technical background'],
      skills: ['Product Strategy', 'AI/ML', 'Leadership', 'Analytics', 'Agile'],
      posted: '2 days ago',
      applicants: 47,
      matchScore: 92,
      isBookmarked: false,
      aiInsights: {
        compatibility: 92,
        growthPotential: 88,
        skillGap: ['Machine Learning', 'Data Science'],
        recommendations: [
          'Consider completing an ML certification',
          'Highlight your analytics experience',
          'Emphasize leadership achievements'
        ]
      },
      recruiter: {
        name: 'Sarah Kim',
        avatar: '/api/placeholder/40/40',
        title: 'Senior Technical Recruiter',
        verified: true
      }
    },
    {
      id: '2',
      title: 'Frontend Engineer - React/TypeScript',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'full-time',
      salary: { min: 100000, max: 130000, currency: 'USD' },
      description: 'Build beautiful, performant user interfaces for our SaaS platform...',
      requirements: ['3+ years React experience', 'TypeScript proficiency', 'Modern CSS'],
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Node.js'],
      posted: '1 week ago',
      applicants: 23,
      matchScore: 85,
      isBookmarked: true,
      aiInsights: {
        compatibility: 85,
        growthPotential: 75,
        skillGap: ['GraphQL', 'Testing'],
        recommendations: [
          'Showcase your React projects',
          'Learn GraphQL fundamentals',
          'Add testing to your skillset'
        ]
      },
      recruiter: {
        name: 'Alex Chen',
        avatar: '/api/placeholder/40/40',
        title: 'Engineering Manager',
        verified: false
      }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'recommended' | 'saved' | 'applied'>('recommended');
  const [userSkills] = useState(['Product Management', 'Analytics', 'Leadership', 'React', 'JavaScript']);
  const { triggerHaptic } = useHapticFeedback();
  const { sync, isOnline } = useRealtimeSync();

  const handleBookmark = async (jobId: string) => {
    triggerHaptic('medium');
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, isBookmarked: !job.isBookmarked }
        : job
    ));

    await sync('jobs', { action: 'bookmark', jobId });
    toast.success('Job saved to bookmarks');
  };

  const handleApply = async (jobId: string) => {
    triggerHaptic('success');
    await sync('jobs', { action: 'apply', jobId });
    toast.success('Application submitted successfully!');
  };

  const handleShare = async (job: Job) => {
    triggerHaptic('light');
    // Share functionality
    toast.success('Job shared to your network');
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getTypeColor = (type: Job['type']) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'remote': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = jobs.filter(job => {
    switch (filter) {
      case 'recommended': return job.matchScore >= 80;
      case 'saved': return job.isBookmarked;
      case 'applied': return false; // Would check application status
      default: return true;
    }
  });

  const formatSalary = (salary: Job['salary']) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  return (
    <div className={`${className}`}>
      {/* AI Insights Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">AI-Powered Job Recommendations</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Personalized matches based on your skills, experience, and career goals
        </p>
        <div className="flex items-center space-x-4 mt-3">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {jobs.reduce((sum, job) => sum + job.applicants, 0)} total applicants
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600">
              92% match accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-4">
        <div className="flex items-center space-x-2 p-4 overflow-x-auto scrollbar-hide">
          <Button
            variant={filter === 'recommended' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('recommended')}
            className="text-xs whitespace-nowrap"
          >
            Recommended
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs whitespace-nowrap"
          >
            All Jobs
          </Button>
          <Button
            variant={filter === 'saved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('saved')}
            className="text-xs whitespace-nowrap"
          >
            Saved
          </Button>
          <Button
            variant={filter === 'applied' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('applied')}
            className="text-xs whitespace-nowrap"
          >
            Applied
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-4 space-y-4 pb-6">
        {filteredJobs.map(job => (
          <Card key={job.id} className="overflow-hidden bg-card border-border/50 shadow-sm">
            {/* Job Header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                      {job.title}
                    </h3>
                    <Badge className={`text-xs ${getMatchColor(job.matchScore)}`}>
                      {job.matchScore}% match
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {job.company}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{job.posted}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleBookmark(job.id)}
                  className={`ml-2 ${job.isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Bookmark className={`w-4 h-4 ${job.isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Job Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(job.type)}>
                      {job.type.replace('-', ' ')}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span>{formatSalary(job.salary)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{job.applicants} applicants</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {job.description}
                </p>

                {/* Skills Match */}
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Skills Match</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.map(skill => (
                      <Badge 
                        key={skill} 
                        variant="outline" 
                        className={`text-xs ${
                          userSkills.includes(skill) 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {skill}
                        {userSkills.includes(skill) && (
                          <Star className="w-2 h-2 ml-1 fill-current" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <p className="text-xs font-medium text-foreground">AI Insights</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Compatibility</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={job.aiInsights.compatibility} className="h-1 flex-1" />
                      <span className="text-xs font-medium">{job.aiInsights.compatibility}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Growth Potential</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={job.aiInsights.growthPotential} className="h-1 flex-1" />
                      <span className="text-xs font-medium">{job.aiInsights.growthPotential}%</span>
                    </div>
                  </div>
                </div>

                {job.aiInsights.skillGap.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">Skill Gaps</p>
                    <div className="flex flex-wrap gap-1">
                      {job.aiInsights.skillGap.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Recommendations</p>
                  <ul className="space-y-1">
                    {job.aiInsights.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="text-xs text-foreground">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recruiter */}
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-border/50">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={job.recruiter.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {job.recruiter.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {job.recruiter.name}
                    {job.recruiter.verified && (
                      <span className="ml-1 text-primary">✓</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {job.recruiter.title}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(job)}
                    className="text-xs text-muted-foreground"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApply(job.id)}
                    disabled={!isOnline}
                    className="text-xs"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="px-4 pb-4">
        <Button variant="outline" className="w-full text-xs" disabled={!isOnline}>
          {isOnline ? 'Load More Jobs' : 'Reconnecting...'}
        </Button>
      </div>
    </div>
  );
};