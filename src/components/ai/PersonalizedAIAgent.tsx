import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  Briefcase, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  FileText,
  MessageSquare,
  Calendar,
  Zap,
  Eye,
  ThumbsUp
} from 'lucide-react';
import { usePersonalizedAIAgent } from '@/hooks/usePersonalizedAIAgent';
import { DailyBriefing, JobMatch, NetworkUpdate, LearningTask, CareerInsight, ProactiveAction } from '@/services/aiAgentService';

export const PersonalizedAIAgent: React.FC = () => {
  const {
    agent,
    dailyBriefing,
    notifications,
    isLoading,
    generateDailyBriefing,
    markNotificationRead,
    runATSCheck,
    tailorResumeToJob,
    generateInterviewKit,
    generateNetworkingContent,
    hasNewBriefing,
    highPriorityNotifications,
    urgentActions
  } = usePersonalizedAIAgent();

  const [activeTab, setActiveTab] = useState('briefing');

  if (isLoading && !agent) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 animate-pulse text-primary" />
            <span>Initializing your AI assistant...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!agent) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">AI Assistant Unavailable</h3>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* High Priority Notifications */}
      {highPriorityNotifications.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Urgent Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPriorityNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start justify-between p-3 bg-background rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  {notification.suggestedActions && notification.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {notification.suggestedActions.map((action, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{action}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main AI Agent Interface */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/ai-avatar.png" />
                <AvatarFallback>
                  <Brain className="h-6 w-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Hi {agent.username}! 
                  <Sparkles className="h-5 w-5 text-primary" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your AI Career Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasNewBriefing && (
                <Badge variant="secondary" className="animate-pulse">
                  New Updates
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateDailyBriefing(true)}
                disabled={isLoading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="briefing" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Daily Brief</span>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Learning</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">AI Tools</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="briefing" className="mt-6">
              <DailyBriefingSection briefing={dailyBriefing} />
            </TabsContent>

            <TabsContent value="jobs" className="mt-6">
              <JobMatchesSection matches={dailyBriefing?.jobMatches || []} />
            </TabsContent>

            <TabsContent value="network" className="mt-6">
              <NetworkSection 
                updates={dailyBriefing?.networkUpdates || []} 
                profileViews={dailyBriefing?.profileViews || 0}
              />
            </TabsContent>

            <TabsContent value="learning" className="mt-6">
              <LearningSection 
                tasks={dailyBriefing?.learningTasks || []}
                insights={dailyBriefing?.careerInsights || []}
              />
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              <AIToolsSection 
                resumeScore={dailyBriefing?.resumeScore || 0}
                onATSCheck={runATSCheck}
                onResumeAIlor={tailorResumeToJob}
                onInterviewPrep={generateInterviewKit}
                onContentGeneration={generateNetworkingContent}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const DailyBriefingSection: React.FC<{ briefing: DailyBriefing | null }> = ({ briefing }) => {
  if (!briefing) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Briefing Available</h3>
        <p className="text-muted-foreground">Your daily briefing will appear here</p>
      </div>
    );
  }

  return (
    <div id="daily-briefing" className="space-y-6">
      <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">{briefing.greeting}</h2>
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span>{briefing.jobMatches.length} job matches</span>
          <span>{briefing.networkUpdates.length} network updates</span>
          <span>{briefing.learningTasks.length} learning tasks</span>
        </div>
      </div>

      {/* Quick Stats */}
      {(briefing.resumeScore || briefing.profileViews) && (
        <div className="grid grid-cols-2 gap-4">
          {briefing.resumeScore && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{briefing.resumeScore}/100</div>
                <div className="text-sm text-muted-foreground">Resume Score</div>
              </CardContent>
            </Card>
          )}
          {briefing.profileViews && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{briefing.profileViews}</div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Proactive Actions */}
      {briefing.proactiveActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing.proactiveActions.map((action, index) => (
              <ProactiveActionCard key={index} action={action} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Market Trends */}
      {briefing.marketTrends && briefing.marketTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefing.marketTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{trend.trend}</div>
                  <div className="text-sm text-muted-foreground">{trend.category}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${trend.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </div>
                  <div className="text-xs text-muted-foreground">{trend.timeframe}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const JobMatchesSection: React.FC<{ matches: JobMatch[] }> = ({ matches }) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Job Matches</h3>
        <p className="text-muted-foreground">We'll find matching jobs for you soon</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.jobId} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{match.title}</h3>
                <p className="text-muted-foreground">{match.company} • {match.location}</p>
                <p className="text-sm text-muted-foreground mt-1">{match.salaryRange}</p>
              </div>
              <div className="text-right">
                <Badge variant={match.urgency === 'high' ? 'destructive' : match.urgency === 'medium' ? 'default' : 'secondary'}>
                  {match.matchScore}% match
                </Badge>
                {match.deadlineHours && match.deadlineHours <= 48 && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-destructive">
                    <Clock className="h-4 w-4" />
                    {match.deadlineHours}h left
                  </div>
                )}
              </div>
            </div>
            
            {match.reasonsToApply.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Why you should apply:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {match.reasonsToApply.map((reason, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button size="sm" className="flex items-center gap-1">
                <ArrowRight className="h-4 w-4" />
                Smart Apply
              </Button>
              <Button size="sm" variant="outline">
                View Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const NetworkSection: React.FC<{ updates: NetworkUpdate[]; profileViews: number }> = ({ updates, profileViews }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{profileViews}</span>
          </div>
          <div className="text-sm text-muted-foreground">Profile views this week</div>
        </CardContent>
      </Card>

      {updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((update, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{update.title}</h3>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                    {update.suggestedAction && (
                      <p className="text-sm text-primary mt-2">{update.suggestedAction}</p>
                    )}
                  </div>
                  <Badge variant={update.priority === 'high' ? 'destructive' : 'secondary'}>
                    {update.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Network Updates</h3>
          <p className="text-muted-foreground">Your network activity will appear here</p>
        </div>
      )}
    </div>
  );
};

const LearningSection: React.FC<{ tasks: LearningTask[]; insights: CareerInsight[] }> = ({ tasks, insights }) => {
  return (
    <div className="space-y-6">
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{task.title}</h3>
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                    {task.estimatedTime}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                {task.progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Career Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{insight.title}</h3>
                  <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                    {insight.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AIToolsSection: React.FC<{
  resumeScore: number;
  onATSCheck: (content: any) => Promise<any>;
  onResumeAIlor: (content: any, jd: string) => Promise<any>;
  onInterviewPrep: (jd: string) => Promise<any>;
  onContentGeneration: (goal: string) => Promise<any>;
}> = ({ resumeScore, onATSCheck, onResumeAIlor, onInterviewPrep, onContentGeneration }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const tools = [
    {
      id: 'ats-check',
      title: 'ATS Resume Scan',
      description: 'Analyze your resume for ATS compatibility',
      icon: <FileText className="h-5 w-5" />,
      action: () => {
        setIsProcessing('ats-check');
        onATSCheck({}).finally(() => setIsProcessing(null));
      },
      disabled: false
    },
    {
      id: 'jd-tailor',
      title: 'JD → Resume Tailor',
      description: 'Customize resume for specific job descriptions',
      icon: <Target className="h-5 w-5" />,
      action: () => {
        setIsProcessing('jd-tailor');
        // This would open a modal to input JD
        setIsProcessing(null);
      },
      disabled: false
    },
    {
      id: 'interview-prep',
      title: 'Interview Coach',
      description: 'Get personalized interview preparation',
      icon: <MessageSquare className="h-5 w-5" />,
      action: () => {
        setIsProcessing('interview-prep');
        onInterviewPrep('').finally(() => setIsProcessing(null));
      },
      disabled: false
    },
    {
      id: 'content-gen',
      title: 'Content Generator',
      description: 'Create professional posts and outreach messages',
      icon: <Sparkles className="h-5 w-5" />,
      action: () => {
        setIsProcessing('content-gen');
        onContentGeneration('professional networking').finally(() => setIsProcessing(null));
      },
      disabled: false
    }
  ];

  return (
    <div className="space-y-6">
      {resumeScore > 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <div className="text-3xl font-bold text-primary mb-2">{resumeScore}/100</div>
              <div className="text-sm text-muted-foreground">Current ATS Score</div>
            </div>
            <Progress value={resumeScore} className="w-full" />
            {resumeScore < 80 && (
              <p className="text-sm text-muted-foreground mt-2">
                Your resume could use some optimization for better ATS compatibility
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              </div>
              <Button
                onClick={tool.action}
                disabled={tool.disabled || isProcessing === tool.id}
                className="w-full"
                size="sm"
              >
                {isProcessing === tool.id ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Use Tool'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProactiveActionCard: React.FC<{ action: ProactiveAction }> = ({ action }) => {
  const urgencyColors = {
    high: 'border-destructive/50 bg-destructive/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    low: 'border-muted-foreground/20 bg-muted/50'
  };

  return (
    <div className={`p-4 rounded-lg border ${urgencyColors[action.urgency]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold">{action.title}</h4>
          <p className="text-sm text-muted-foreground">{action.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated impact: {action.estimatedImpact}
          </p>
        </div>
        <Badge variant={action.urgency === 'high' ? 'destructive' : 'secondary'}>
          {action.urgency}
        </Badge>
      </div>
      <Button size="sm" className="mt-2">
        {action.ctaText}
      </Button>
    </div>
  );
};