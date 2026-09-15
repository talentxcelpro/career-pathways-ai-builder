import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Star, Calendar as CalendarIcon,
  MessageSquare, Phone, Mail, Clock, Target, Award, FileText, Plus
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [clientFeedback, setClientFeedback] = useState<any[]>([]);
  const [clientNotes, setClientNotes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newNote, setNewNote] = useState({ title: "", content: "", note_type: "general" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch performance metrics
      const { data: metrics } = await supabase
        .from('pro_performance_metrics')
        .select('*')
        .order('metric_date', { ascending: false });

      // Fetch communications
      const { data: comms } = await supabase
        .from('pro_communications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch client feedback
      const { data: feedback } = await supabase
        .from('pro_client_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch client notes
      const { data: notes } = await supabase
        .from('pro_client_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setPerformanceMetrics(metrics || []);
      setCommunications(comms || []);
      setClientFeedback(feedback || []);
      setClientNotes(notes || []);

      // Calculate analytics summary
      const revenueMetrics = metrics?.filter(m => m.metric_type === 'revenue') || [];
      const satisfactionMetrics = metrics?.filter(m => m.metric_type === 'client_satisfaction') || [];
      
      const totalRevenue = revenueMetrics.reduce((sum, m) => sum + Number(m.metric_value), 0);
      const avgSatisfaction = satisfactionMetrics.length > 0 
        ? satisfactionMetrics.reduce((sum, m) => sum + Number(m.metric_value), 0) / satisfactionMetrics.length
        : 0;

      setAnalytics({
        totalRevenue,
        avgSatisfaction,
        totalFeedback: feedback?.length || 0,
        totalCommunications: comms?.length || 0,
        conversionRate: 12.5, // Mock data
        clientRetention: 85, // Mock data
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addClientNote = async () => {
    if (!newNote.title || !newNote.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pro_client_notes')
        .insert([{
          title: newNote.title,
          content: newNote.content,
          note_type: newNote.note_type,
          profile_id: null, // Will be set by RLS
        }]);

      if (error) throw error;

      setNewNote({ title: "", content: "", note_type: "general" });
      fetchAnalyticsData();
      toast({
        title: "Success",
        description: "Client note added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add client note",
        variant: "destructive",
      });
    }
  };

  const getMetricTrend = (type: string) => {
    const data = performanceMetrics
      .filter(m => m.metric_type === type)
      .slice(0, 12)
      .reverse()
      .map(m => ({
        date: format(new Date(m.metric_date), 'MMM dd'),
        value: Number(m.metric_value)
      }));
    return data;
  };

  const getCommunicationStats = () => {
    const types = communications.reduce((acc, comm) => {
      acc[comm.communication_type] = (acc[comm.communication_type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  const getFeedbackStats = () => {
    const avgRatings = {
      overall: clientFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / (clientFeedback.length || 1),
      quality: clientFeedback.reduce((sum, f) => sum + (f.service_quality_rating || 0), 0) / (clientFeedback.length || 1),
      communication: clientFeedback.reduce((sum, f) => sum + (f.communication_rating || 0), 0) / (clientFeedback.length || 1),
      timeliness: clientFeedback.reduce((sum, f) => sum + (f.timeliness_rating || 0), 0) / (clientFeedback.length || 1),
    };
    return avgRatings;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const revenueData = getMetricTrend('revenue');
  const satisfactionData = getMetricTrend('client_satisfaction');
  const communicationStats = getCommunicationStats();
  const feedbackStats = getFeedbackStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights and performance metrics for your business
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.totalRevenue?.toLocaleString() || '0'}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgSatisfaction?.toFixed(1) || '0'}/5</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +0.2 from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.conversionRate || 0}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.clientRetention || 0}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5.2% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="notes">Client Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction Trend</CardTitle>
                <CardDescription>Average client satisfaction ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={satisfactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}/5`, 'Rating']} />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback Ratings</CardTitle>
              <CardDescription>Breakdown of client feedback across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{feedbackStats.overall.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Overall Rating</div>
                  <Progress value={feedbackStats.overall * 20} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{feedbackStats.quality.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Service Quality</div>
                  <Progress value={feedbackStats.quality * 20} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{feedbackStats.communication.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Communication</div>
                  <Progress value={feedbackStats.communication * 20} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{feedbackStats.timeliness.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Timeliness</div>
                  <Progress value={feedbackStats.timeliness * 20} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Breakdown</CardTitle>
                <CardDescription>Distribution of communication types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={communicationStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {communicationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
                <CardDescription>Latest client interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communications.slice(0, 5).map((comm) => (
                    <div key={comm.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {comm.communication_type === 'email' && <Mail className="h-4 w-4" />}
                        {comm.communication_type === 'call' && <Phone className="h-4 w-4" />}
                        {comm.communication_type === 'meeting' && <CalendarIcon className="h-4 w-4" />}
                        {comm.communication_type === 'message' && <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{comm.subject || 'No subject'}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(comm.created_at), 'MMM dd, yyyy')}
                        </div>
                        <Badge variant={comm.direction === 'outbound' ? 'default' : 'secondary'} className="mt-1">
                          {comm.direction}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {clientFeedback.slice(0, 10).map((feedback) => (
              <Card key={feedback.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < (feedback.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{feedback.rating}/5</span>
                    </div>
                    <Badge variant={feedback.is_public ? 'default' : 'secondary'}>
                      {feedback.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{feedback.review}</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Quality:</span> {feedback.service_quality_rating}/5
                    </div>
                    <div>
                      <span className="font-medium">Communication:</span> {feedback.communication_rating}/5
                    </div>
                    <div>
                      <span className="font-medium">Timeliness:</span> {feedback.timeliness_rating}/5
                    </div>
                  </div>
                  {feedback.response_from_provider && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="text-xs font-medium mb-1">Your Response:</div>
                      <p className="text-sm">{feedback.response_from_provider}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Client Note</CardTitle>
              <CardDescription>Keep track of important client interactions and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Enter note title"
                  />
                </div>
                <div>
                  <Label htmlFor="note-type">Type</Label>
                  <Select value={newNote.note_type} onValueChange={(value) => setNewNote({ ...newNote, note_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Enter note content"
                  rows={3}
                />
              </div>
              <Button onClick={addClientNote} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {clientNotes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{note.note_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{note.content}</p>
                  {note.reminder_date && (
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Reminder: {format(new Date(note.reminder_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}