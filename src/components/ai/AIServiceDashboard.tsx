import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  BookOpen, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAIServiceMatching } from '@/hooks/useAIServiceMatching';

const serviceIcons = {
  career_coaching: Brain,
  resume_optimization: FileText,
  interview_prep: MessageSquare,
  salary_negotiation: DollarSign,
  skill_development: BookOpen
};

const serviceLabels = {
  career_coaching: 'Career Coaching',
  resume_optimization: 'Resume Optimization',
  interview_prep: 'Interview Preparation',
  salary_negotiation: 'Salary Negotiation',
  skill_development: 'Skill Development'
};

export const AIServiceDashboard = () => {
  const { matches, matchesLoading, conversations } = useAIServiceMatching();

  if (matchesLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate statistics
  const totalSessions = conversations?.length || 0;
  const totalMatches = matches?.length || 0;
  const serviceUsage = matches?.reduce((acc, match) => {
    acc[match.service_type] = (acc[match.service_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const recentMatches = matches?.slice(0, 3) || [];
  const avgConfidence = matches?.length > 0 
    ? matches.reduce((sum, match) => sum + match.confidence_score, 0) / matches.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              AI conversations started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              Personalized responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgConfidence * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              AI response accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Object.keys(serviceUsage).length > 0 
                ? serviceLabels[Object.keys(serviceUsage).reduce((a, b) => 
                    serviceUsage[a] > serviceUsage[b] ? a : b) as keyof typeof serviceLabels]
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.values(serviceUsage).length > 0 
                ? `${Math.max(...Object.values(serviceUsage))} sessions`
                : 'No data yet'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Service Usage</CardTitle>
          <CardDescription>
            How you've been using different AI services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(serviceUsage).length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                No service usage data yet. Start using AI services to see your activity!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(serviceUsage).map(([serviceType, count]) => {
                const Icon = serviceIcons[serviceType as keyof typeof serviceIcons] || Brain;
                const label = serviceLabels[serviceType as keyof typeof serviceLabels] || serviceType;
                const percentage = (count / totalMatches) * 100;
                
                return (
                  <div key={serviceType} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 min-w-[200px]">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 min-w-[80px]">
                      <Badge variant="secondary" className="text-xs">
                        {count} uses
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent AI Interactions
          </CardTitle>
          <CardDescription>
            Your latest AI service matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                No recent interactions. Start chatting with the AI assistant!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMatches.map((match) => {
                const Icon = serviceIcons[match.service_type as keyof typeof serviceIcons] || Brain;
                const label = serviceLabels[match.service_type as keyof typeof serviceLabels] || match.service_type;
                
                return (
                  <div key={match.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Icon className="w-5 h-5 text-primary mt-0.5" />
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(match.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm line-clamp-2">
                        {match.query}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Confidence: {(match.confidence_score * 100).toFixed(0)}%</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            // TODO: Navigate to conversation detail
                            console.log('View match:', match.id);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};