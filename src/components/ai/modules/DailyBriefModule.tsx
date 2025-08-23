import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Briefcase, Users, BookOpen, TrendingUp, Calendar, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface DailyBriefModuleProps {
  onResult: (message: string) => void;
  userProfile?: any;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  match: number;
  posted: string;
  urgent: boolean;
}

interface NetworkUpdate {
  type: 'connection' | 'post' | 'job_change' | 'milestone';
  person: string;
  action: string;
  time: string;
}

interface LearningItem {
  title: string;
  type: 'course' | 'article' | 'video' | 'practice';
  duration: string;
  priority: 'high' | 'medium' | 'low';
}

export const DailyBriefModule: React.FC<DailyBriefModuleProps> = ({ onResult, userProfile }) => {
  const [briefData, setBriefData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const generateBrief = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockBriefData = {
        summary: {
          newJobs: 12,
          networkUpdates: 8,
          learningItems: 5,
          interviewsThisWeek: 2,
          profileViews: 23
        },
        jobs: [
          { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp', match: 92, posted: '2 hours ago', urgent: true },
          { id: '2', title: 'Full Stack Engineer', company: 'Startup Inc', match: 87, posted: '1 day ago', urgent: false },
          { id: '3', title: 'React Developer', company: 'Innovation Labs', match: 89, posted: '3 hours ago', urgent: true },
          { id: '4', title: 'Software Engineer', company: 'Big Tech', match: 85, posted: '1 day ago', urgent: false }
        ] as JobMatch[],
        network: [
          { type: 'connection', person: 'Sarah Chen', action: 'accepted your connection request', time: '2 hours ago' },
          { type: 'job_change', person: 'Mike Johnson', action: 'started new position at Google', time: '1 day ago' },
          { type: 'milestone', person: 'Lisa Wong', action: 'completed AI/ML certification', time: '3 hours ago' },
          { type: 'post', person: 'David Kim', action: 'shared insights about React 19', time: '5 hours ago' }
        ] as NetworkUpdate[],
        learning: [
          { title: 'Advanced TypeScript Patterns', type: 'course', duration: '2 hours', priority: 'high' },
          { title: 'System Design Interview Prep', type: 'practice', duration: '1 hour', priority: 'high' },
          { title: 'GraphQL Best Practices', type: 'article', duration: '15 min', priority: 'medium' },
          { title: 'Kubernetes Fundamentals', type: 'video', duration: '45 min', priority: 'medium' },
          { title: 'Leadership Skills for Engineers', type: 'course', duration: '3 hours', priority: 'low' }
        ] as LearningItem[],
        insights: [
          'Your profile was viewed 15% more this week',
          'React and TypeScript skills are trending in your network',
          'Companies in FinTech are actively hiring for your profile',
          '3 people in your network recently got promoted'
        ],
        actionItems: [
          'Apply to 2 high-match jobs before end of day',
          'Complete TypeScript course module (30 min left)',
          'Respond to 3 connection requests',
          'Prepare for TechCorp interview tomorrow',
          'Update resume with recent project achievements'
        ]
      };

      setBriefData(mockBriefData);
      setIsLoading(false);
      onResult(`Daily brief generated! ${mockBriefData.summary.newJobs} new job matches, ${mockBriefData.summary.networkUpdates} network updates, and ${mockBriefData.actionItems.length} action items.`);
    }, 1500);
  };

  useEffect(() => {
    generateBrief();
  }, []);

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case 'connection': return <Users className="w-4 h-4 text-blue-500" />;
      case 'job_change': return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'milestone': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'post': return <BookOpen className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
            <p>Generating your personalized daily brief...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!briefData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center p-8">
          <Button onClick={generateBrief}>Generate Daily Brief</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Daily Career Brief - {new Date().toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-primary">{briefData.summary.newJobs}</div>
            <div className="text-xs text-muted-foreground">New Jobs</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-blue-600">{briefData.summary.networkUpdates}</div>
            <div className="text-xs text-muted-foreground">Network</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-green-600">{briefData.summary.learningItems}</div>
            <div className="text-xs text-muted-foreground">Learning</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-purple-600">{briefData.summary.interviewsThisWeek}</div>
            <div className="text-xs text-muted-foreground">Interviews</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-lg font-bold text-orange-600">{briefData.summary.profileViews}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-3">
            <h4 className="font-medium">Top Job Matches</h4>
            {briefData.jobs.map((job: JobMatch) => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.title}</span>
                    {job.urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{job.company} • {job.posted}</div>
                </div>
                <div className="text-right">
                  <Badge variant="default">{job.match}% match</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="network" className="space-y-3">
            <h4 className="font-medium">Network Activity</h4>
            {briefData.network.map((update: NetworkUpdate, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getNetworkIcon(update.type)}
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{update.person}</span> {update.action}
                  </div>
                  <div className="text-xs text-muted-foreground">{update.time}</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="learning" className="space-y-3">
            <h4 className="font-medium">Recommended Learning</h4>
            {briefData.learning.map((item: LearningItem, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{item.type} • {item.duration}</div>
                </div>
                <Button variant="outline" size="sm">Start</Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Career Insights</h4>
              {briefData.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                  <span className="text-sm">{insight}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Today's Action Items</h4>
              {briefData.actionItems.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                  <Calendar className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={generateBrief} className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Refresh Brief
          </Button>
          <Button onClick={() => onResult('Daily brief reviewed! Stay focused on your career goals today.')} className="flex-1">
            Mark as Reviewed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};