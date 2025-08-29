import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Target, 
  BarChart3,
  LineChart,
  Clock,
  Zap,
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, parseISO } from 'date-fns';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface JourneyEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_module: string;
  event_data: any;
  impact_score: number;
  created_at: string;
}

interface AnalyticsTimeframe {
  label: string;
  value: string;
  days: number;
}

const timeframes: AnalyticsTimeframe[] = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 },
  { label: 'All time', value: 'all', days: 365 }
];

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export function JourneyTrackingAnalytics({ userId }: { userId?: string }) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  
  const currentTimeframe = timeframes.find(t => t.value === selectedTimeframe) || timeframes[1];
  const startDate = subDays(new Date(), currentTimeframe.days);

  // Fetch journey events
  const { data: journeyEvents = [], isLoading } = useQuery({
    queryKey: ['journey-events', targetUserId, selectedTimeframe],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      let query = supabase
        .from('user_journey_tracking')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (selectedTimeframe !== 'all') {
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JourneyEvent[];
    },
    enabled: !!targetUserId,
  });

  // Process analytics data
  const analytics = React.useMemo(() => {
    if (!journeyEvents.length) return null;

    // Activity by day
    const dailyActivity = {};
    const moduleActivity = {};
    const eventTypes = {};
    
    journeyEvents.forEach(event => {
      const date = format(parseISO(event.created_at), 'MMM dd');
      const module = event.event_module;
      const type = event.event_type;
      
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      moduleActivity[module] = (moduleActivity[module] || 0) + event.impact_score;
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });

    const dailyData = Object.entries(dailyActivity).map(([date, count]) => ({
      date,
      activities: count
    }));

    const moduleData = Object.entries(moduleActivity).map(([module, impact]) => ({
      module,
      impact: Number(impact)
    }));

    const typeData = Object.entries(eventTypes).map(([type, count]) => ({
      type,
      count: Number(count)
    }));

    // Calculate insights
    const totalEvents = journeyEvents.length;
    const totalImpact = journeyEvents.reduce((sum, e) => sum + e.impact_score, 0);
    const avgDailyActivity = totalEvents / currentTimeframe.days;
    const mostActiveModule = Object.entries(moduleActivity).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    // Recent milestones
    const milestones = journeyEvents
      .filter(e => e.impact_score >= 5)
      .slice(0, 5)
      .map(e => ({
        title: formatEventTitle(e.event_type, e.event_module),
        description: formatEventDescription(e.event_data),
        date: e.created_at,
        impact: e.impact_score
      }));

    return {
      summary: {
        totalEvents,
        totalImpact,
        avgDailyActivity: Math.round(avgDailyActivity * 10) / 10,
        mostActiveModule
      },
      charts: {
        dailyData,
        moduleData,
        typeData
      },
      milestones
    };
  }, [journeyEvents, currentTimeframe.days]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No journey data yet</h3>
          <p className="text-muted-foreground">
            Start using TalentXcel to track your career journey!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Journey Analytics
              </CardTitle>
              <CardDescription>
                Track your career development activities and progress
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map(tf => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Activities"
              value={analytics.summary.totalEvents}
              icon={<Activity className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Impact Score"
              value={analytics.summary.totalImpact}
              icon={<Zap className="w-5 h-5" />}
              color="yellow"
            />
            <MetricCard
              label="Daily Average"
              value={analytics.summary.avgDailyActivity}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="Most Active"
              value={analytics.summary.mostActiveModule || 'N/A'}
              icon={<Target className="w-5 h-5" />}
              color="purple"
              isText
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="modules">Module Breakdown</TabsTrigger>
          <TabsTrigger value="types">Event Types</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Your daily career-building activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={analytics.charts.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Module Impact</CardTitle>
              <CardDescription>Impact score by platform module</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={analytics.charts.moduleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impact" fill="#82ca9d" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Event Distribution</CardTitle>
              <CardDescription>Breakdown of your activity types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.charts.typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.charts.typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Recent Milestones</CardTitle>
              <CardDescription>Your biggest achievements and progress markers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.milestones.map((milestone, index) => (
                  <MilestoneCard key={index} milestone={milestone} />
                ))}
                
                {analytics.milestones.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No major milestones yet. Keep building your career!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value, icon, color, isText = false }: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  isText?: boolean;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>
        <div className="mt-2">
          <div className={`text-2xl font-bold ${isText ? 'text-sm' : ''}`}>
            {isText ? String(value).substring(0, 12) : value}
          </div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MilestoneCard({ milestone }: {
  milestone: {
    title: string;
    description: string;
    date: string;
    impact: number;
  };
}) {
  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{milestone.title}</h4>
        <p className="text-sm text-muted-foreground">{milestone.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {format(parseISO(milestone.date), 'MMM dd, yyyy')}
          </span>
          <Badge variant="secondary">+{milestone.impact} impact</Badge>
        </div>
      </div>
    </div>
  );
}

function formatEventTitle(eventType: string, eventModule: string): string {
  const titleMap: Record<string, string> = {
    'profile_updated': 'Profile Updated',
    'resume_created': 'Resume Created',
    'job_applied': 'Job Application',
    'connection_made': 'New Connection',
    'skill_added': 'Skill Added',
    'certification_earned': 'Certification Earned',
    'assessment_completed': 'Assessment Completed'
  };
  
  return titleMap[eventType] || `${eventType} in ${eventModule}`;
}

function formatEventDescription(eventData: any): string {
  if (!eventData) return 'Career activity completed';
  
  if (eventData.job_title) return `Applied for ${eventData.job_title}`;
  if (eventData.skill_name) return `Added ${eventData.skill_name} skill`;
  if (eventData.connection_name) return `Connected with ${eventData.connection_name}`;
  
  return 'Career milestone achieved';
}