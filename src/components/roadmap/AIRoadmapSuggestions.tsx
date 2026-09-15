import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb,
  Brain,
  TrendingUp,
  Target,
  Clock,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  Briefcase,
  Award,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIRecommendation {
  id: string;
  type: 'skill' | 'role' | 'certification' | 'experience' | 'network';
  title: string;
  description: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeToImplement: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  relevanceScore: number;
  marketTrends: {
    demand: 'increasing' | 'stable' | 'decreasing';
    salaryImpact: string;
    jobOpenings: number;
  };
  prerequisites: string[];
  resources: {
    type: 'course' | 'book' | 'certification' | 'project';
    name: string;
    provider: string;
    cost: string;
    duration: string;
  }[];
  isImplemented?: boolean;
}

const aiRecommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'skill',
    title: 'Learn Kubernetes & Container Orchestration',
    description: 'Master container orchestration with Kubernetes to enhance your DevOps capabilities',
    reasoning: 'Based on your current cloud learning path and market demand, Kubernetes skills show 89% job posting increase in your field',
    priority: 'high',
    timeToImplement: '3-4 months',
    difficulty: 'hard',
    impact: 'high',
    relevanceScore: 92,
    marketTrends: {
      demand: 'increasing',
      salaryImpact: '+$15,000-25,000',
      jobOpenings: 12547
    },
    prerequisites: ['Docker basics', 'Cloud fundamentals', 'Linux administration'],
    resources: [
      {
        type: 'certification',
        name: 'Certified Kubernetes Administrator (CKA)',
        provider: 'CNCF',
        cost: '$375',
        duration: '3 months'
      },
      {
        type: 'course',
        name: 'Kubernetes Complete Course',
        provider: 'Udemy',
        cost: '$89',
        duration: '20 hours'
      }
    ]
  },
  {
    id: '2',
    type: 'certification',
    title: 'AWS Solutions Architect Professional',
    description: 'Advance your cloud architecture skills with professional-level AWS certification',
    reasoning: 'Complements your cloud learning journey and positions you for senior roles with 67% higher hiring probability',
    priority: 'critical',
    timeToImplement: '4-6 months',
    difficulty: 'hard',
    impact: 'high',
    relevanceScore: 89,
    marketTrends: {
      demand: 'increasing',
      salaryImpact: '+$20,000-35,000',
      jobOpenings: 8932
    },
    prerequisites: ['AWS Associate certification', 'Cloud architecture experience'],
    resources: [
      {
        type: 'certification',
        name: 'AWS Solutions Architect Professional',
        provider: 'AWS',
        cost: '$300',
        duration: '6 months'
      },
      {
        type: 'course',
        name: 'AWS SAP Complete Training',
        provider: 'A Cloud Guru',
        cost: '$299/year',
        duration: '40 hours'
      }
    ]
  },
  {
    id: '3',
    type: 'experience',
    title: 'Lead a Cross-Functional Project',
    description: 'Take ownership of a project involving multiple teams and stakeholders',
    reasoning: 'Leadership experience is crucial for your engineering manager goal and shows initiative to upper management',
    priority: 'high',
    timeToImplement: '2-3 months',
    difficulty: 'medium',
    impact: 'high',
    relevanceScore: 85,
    marketTrends: {
      demand: 'stable',
      salaryImpact: '+$10,000-20,000',
      jobOpenings: 5643
    },
    prerequisites: ['Team collaboration skills', 'Project management basics'],
    resources: [
      {
        type: 'course',
        name: 'Project Management Fundamentals',
        provider: 'PMI',
        cost: '$199',
        duration: '16 hours'
      },
      {
        type: 'book',
        name: 'The First 90 Days',
        provider: 'Harvard Business Review',
        cost: '$18',
        duration: '2 weeks'
      }
    ]
  },
  {
    id: '4',
    type: 'network',
    title: 'Connect with Senior Engineering Managers',
    description: 'Build relationships with current engineering managers in your target companies',
    reasoning: 'Network analysis shows 73% of management promotions come through internal referrals and mentorship',
    priority: 'medium',
    timeToImplement: '1-2 months',
    difficulty: 'easy',
    impact: 'medium',
    relevanceScore: 78,
    marketTrends: {
      demand: 'stable',
      salaryImpact: 'Network effect',
      jobOpenings: 0
    },
    prerequisites: ['LinkedIn optimization', 'Networking skills'],
    resources: [
      {
        type: 'course',
        name: 'Strategic Networking',
        provider: 'LinkedIn Learning',
        cost: '$29.99/month',
        duration: '3 hours'
      }
    ]
  },
  {
    id: '5',
    type: 'skill',
    title: 'Machine Learning for Engineers',
    description: 'Gain ML knowledge to stay competitive in the evolving tech landscape',
    reasoning: 'ML integration in software engineering roles increasing by 34% annually, becoming essential for senior positions',
    priority: 'medium',
    timeToImplement: '4-5 months',
    difficulty: 'hard',
    impact: 'medium',
    relevanceScore: 71,
    marketTrends: {
      demand: 'increasing',
      salaryImpact: '+$8,000-15,000',
      jobOpenings: 6782
    },
    prerequisites: ['Python proficiency', 'Statistics basics', 'Data structures'],
    resources: [
      {
        type: 'course',
        name: 'Machine Learning Specialization',
        provider: 'Coursera',
        cost: '$49/month',
        duration: '6 months'
      },
      {
        type: 'project',
        name: 'Build ML Pipeline',
        provider: 'Self-directed',
        cost: 'Free',
        duration: '2 months'
      }
    ]
  }
];

const getTypeIcon = (type: AIRecommendation['type']) => {
  switch (type) {
    case 'skill': return <BookOpen className="h-5 w-5" />;
    case 'certification': return <Award className="h-5 w-5" />;
    case 'experience': return <Briefcase className="h-5 w-5" />;
    case 'network': return <Users className="h-5 w-5" />;
    case 'role': return <Target className="h-5 w-5" />;
    default: return <Lightbulb className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: AIRecommendation['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getDifficultyColor = (difficulty: AIRecommendation['difficulty']) => {
  switch (difficulty) {
    case 'hard': return 'bg-red-500';
    case 'medium': return 'bg-amber-500';
    case 'easy': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getImpactColor = (impact: AIRecommendation['impact']) => {
  switch (impact) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-amber-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
    default: return <ArrowRight className="h-4 w-4 text-gray-600" />;
  }
};

export const AIRoadmapSuggestions: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [implementedItems, setImplementedItems] = useState<Set<string>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);

  const filteredRecommendations = aiRecommendations.filter(rec => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'priority') return rec.priority === 'critical' || rec.priority === 'high';
    if (selectedFilter === 'quick-wins') return rec.difficulty === 'easy' || rec.difficulty === 'medium';
    return rec.type === selectedFilter;
  });

  const handleImplement = (recommendationId: string) => {
    setImplementedItems(prev => new Set([...prev, recommendationId]));
  };

  const getRecommendationScore = (rec: AIRecommendation) => {
    let score = rec.relevanceScore;
    if (rec.priority === 'critical') score += 10;
    if (rec.priority === 'high') score += 5;
    if (rec.impact === 'high') score += 8;
    if (rec.difficulty === 'easy') score += 3;
    return Math.min(score, 100);
  };

  const analytics = {
    totalRecommendations: aiRecommendations.length,
    implemented: implementedItems.size,
    averageScore: Math.round(aiRecommendations.reduce((sum, rec) => sum + getRecommendationScore(rec), 0) / aiRecommendations.length),
    highPriority: aiRecommendations.filter(rec => rec.priority === 'critical' || rec.priority === 'high').length,
    estimatedSalaryIncrease: aiRecommendations
      .filter(rec => !implementedItems.has(rec.id))
      .reduce((sum, rec) => {
        const match = rec.marketTrends.salaryImpact.match(/\+\$(\d+),?(\d+)?/);
        if (match) {
          const base = parseInt(match[1]);
          const multiplier = match[2] ? 1000 : 1;
          return sum + (base * multiplier);
        }
        return sum;
      }, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            AI Career Intelligence
          </CardTitle>
          <p className="text-muted-foreground">
            Personalized recommendations based on your career goals, market trends, and skill analysis
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.totalRecommendations}</p>
              <p className="text-sm text-muted-foreground">Total Recommendations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.averageScore}</p>
              <p className="text-sm text-muted-foreground">Avg Relevance Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{analytics.highPriority}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                ${(analytics.estimatedSalaryIncrease / 1000).toFixed(0)}K+
              </p>
              <p className="text-sm text-muted-foreground">Potential Salary Boost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('all')}
        >
          All Recommendations
        </Button>
        <Button
          variant={selectedFilter === 'priority' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('priority')}
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          High Priority
        </Button>
        <Button
          variant={selectedFilter === 'quick-wins' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('quick-wins')}
        >
          <Zap className="h-4 w-4 mr-1" />
          Quick Wins
        </Button>
        <Button
          variant={selectedFilter === 'skill' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('skill')}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          Skills
        </Button>
        <Button
          variant={selectedFilter === 'certification' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('certification')}
        >
          <Award className="h-4 w-4 mr-1" />
          Certifications
        </Button>
        <Button
          variant={selectedFilter === 'experience' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('experience')}
        >
          <Briefcase className="h-4 w-4 mr-1" />
          Experience
        </Button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecommendations.map((recommendation, index) => {
          const isImplemented = implementedItems.has(recommendation.id);
          const score = getRecommendationScore(recommendation);
          
          return (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full transition-all hover:shadow-lg ${isImplemented ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        isImplemented ? 'bg-green-100' : 'bg-primary/10'
                      }`}>
                        {isImplemented ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          getTypeIcon(recommendation.type)
                        )}
                      </div>
                      <div>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="ml-1 capitalize">
                          {recommendation.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="h-4 w-4 text-amber-500" />
                        {score}
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg line-clamp-2">{recommendation.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {recommendation.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-800 mb-1">AI Reasoning</p>
                    <p className="text-xs text-blue-700">{recommendation.reasoning}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium">Timeline</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{recommendation.timeToImplement}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Difficulty</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor(recommendation.difficulty)}`} />
                        <span className="capitalize">{recommendation.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-sm mb-2">Market Impact</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Demand Trend</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(recommendation.marketTrends.demand)}
                          <span className="capitalize">{recommendation.marketTrends.demand}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Salary Impact</span>
                        <span className={`font-medium ${getImpactColor(recommendation.impact)}`}>
                          {recommendation.marketTrends.salaryImpact}
                        </span>
                      </div>
                      {recommendation.marketTrends.jobOpenings > 0 && (
                        <div className="flex justify-between">
                          <span>Job Openings</span>
                          <span className="font-medium">
                            {recommendation.marketTrends.jobOpenings.toLocaleString()}+
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-sm">Key Resources</p>
                    {recommendation.resources.slice(0, 2).map((resource, idx) => (
                      <div key={idx} className="text-xs p-2 bg-muted rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{resource.name}</span>
                          <span className="text-muted-foreground">{resource.cost}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>{resource.provider}</span>
                          <span>{resource.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    {!isImplemented ? (
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={() => handleImplement(recommendation.id)}
                        >
                          Add to Roadmap
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedRecommendation(recommendation)}
                        >
                          View Details
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <p className="text-sm font-medium text-green-600">Added to Roadmap</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedRecommendation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedRecommendation.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecommendation(null)}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">{selectedRecommendation.description}</p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">AI Analysis</h3>
                  <p className="text-blue-700">{selectedRecommendation.reasoning}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Prerequisites</h4>
                    <ul className="space-y-1">
                      {selectedRecommendation.prerequisites.map((prereq, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">All Resources</h4>
                    <div className="space-y-2">
                      {selectedRecommendation.resources.map((resource, idx) => (
                        <div key={idx} className="text-sm p-2 bg-muted rounded">
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-muted-foreground">
                            {resource.provider} • {resource.cost} • {resource.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};