import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Users, 
  Calendar, 
  Star, 
  Award, 
  TrendingUp, 
  MessageSquare,
  Clock,
  Target,
  BookOpen,
  Video
} from 'lucide-react';

interface MentorProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  experience_years: number;
  expertise_areas: string[];
  hourly_rate: number;
  availability: 'high' | 'medium' | 'low';
  rating: number;
  total_mentees: number;
  profile_image?: string;
  bio: string;
  session_types: string[];
}

interface MentorshipSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
  feedback?: string;
}

interface MentorshipGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  mentor_id?: string;
}

export const MentorshipDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('find-mentors');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [sessionForm, setSessionForm] = useState({
    session_type: '',
    preferred_time: '',
    duration: 60,
    goals: ''
  });

  // Fetch available mentors
  const { data: mentors = [] } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data as MentorProfile[];
    }
  });

  // Fetch user's mentorship sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['mentorship-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select(`
          *,
          mentor:mentor_profiles(name, title, company, profile_image)
        `)
        .eq('mentee_id', user.id)
        .order('scheduled_at', { ascending: false });
      
      if (error) throw error;
      return data as (MentorshipSession & { mentor: Partial<MentorProfile> })[];
    },
    enabled: !!user?.id
  });

  // Fetch user's mentorship goals
  const { data: goals = [] } = useQuery({
    queryKey: ['mentorship-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mentorship_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MentorshipGoal[];
    },
    enabled: !!user?.id
  });

  // Book mentorship session mutation
  const bookSessionMutation = useMutation({
    mutationFn: async (sessionData: typeof sessionForm & { mentor_id: string }) => {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert({
          mentor_id: sessionData.mentor_id,
          mentee_id: user?.id,
          session_type: sessionData.session_type,
          scheduled_at: sessionData.preferred_time,
          duration_minutes: sessionData.duration,
          status: 'scheduled',
          notes: sessionData.goals
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-sessions'] });
      toast.success('Mentorship session booked successfully!');
      setSelectedMentor(null);
      setSessionForm({ session_type: '', preferred_time: '', duration: 60, goals: '' });
    },
    onError: () => {
      toast.error('Failed to book session');
    }
  });

  const handleBookSession = () => {
    if (!selectedMentor) return;
    
    bookSessionMutation.mutate({
      ...sessionForm,
      mentor_id: selectedMentor.id
    });
  };

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date());
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mentorship Hub</h1>
        <Badge variant="secondary" className="text-sm">
          {completedSessions.length} Sessions Completed
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Mentors</p>
                <p className="text-2xl font-bold">{mentors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Goals Achieved</p>
                <p className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Hours Learned</p>
                <p className="text-2xl font-bold">{Math.round(completedSessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Find Mentors Tab */}
        <TabsContent value="find-mentors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discover Expert Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={mentor.profile_image} />
                          <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{mentor.name}</h3>
                            <p className="text-muted-foreground text-sm">{mentor.title}</p>
                            <p className="text-muted-foreground text-sm">{mentor.company}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({mentor.total_mentees} mentees)</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {mentor.expertise_areas.slice(0, 3).map((area) => (
                              <Badge key={area} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <Badge variant={mentor.availability === 'high' ? 'default' : 'secondary'}>
                              {mentor.availability} availability
                            </Badge>
                            <span className="text-sm font-medium">${mentor.hourly_rate}/hr</span>
                          </div>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full mt-4" 
                            onClick={() => setSelectedMentor(mentor)}
                          >
                            Book Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Book Session with {mentor.name}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={mentor.profile_image} />
                                <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{mentor.name}</h4>
                                <p className="text-sm text-muted-foreground">{mentor.title} at {mentor.company}</p>
                                <p className="text-sm mt-2">{mentor.bio}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Session Type</label>
                                <select 
                                  className="w-full mt-1 p-2 border rounded-md"
                                  value={sessionForm.session_type}
                                  onChange={(e) => setSessionForm(prev => ({ ...prev, session_type: e.target.value }))}
                                >
                                  <option value="">Select type</option>
                                  {mentor.session_types.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Duration</label>
                                <select 
                                  className="w-full mt-1 p-2 border rounded-md"
                                  value={sessionForm.duration}
                                  onChange={(e) => setSessionForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                >
                                  <option value={30}>30 minutes</option>
                                  <option value={60}>1 hour</option>
                                  <option value={90}>1.5 hours</option>
                                  <option value={120}>2 hours</option>
                                </select>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Preferred Time</label>
                              <Input
                                type="datetime-local"
                                value={sessionForm.preferred_time}
                                onChange={(e) => setSessionForm(prev => ({ ...prev, preferred_time: e.target.value }))}
                                min={new Date().toISOString().slice(0, 16)}
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Session Goals</label>
                              <Textarea
                                placeholder="What do you hope to achieve in this session?"
                                value={sessionForm.goals}
                                onChange={(e) => setSessionForm(prev => ({ ...prev, goals: e.target.value }))}
                              />
                            </div>
                            
                            <Button 
                              onClick={handleBookSession} 
                              className="w-full"
                              disabled={!sessionForm.session_type || !sessionForm.preferred_time}
                            >
                              Book Session (${(mentor.hourly_rate * sessionForm.duration / 60).toFixed(2)})
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Sessions Tab */}
        <TabsContent value="my-sessions" className="space-y-6">
          <div className="grid gap-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No upcoming sessions scheduled</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={session.mentor.profile_image} />
                            <AvatarFallback>{session.mentor.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{session.mentor.name}</h4>
                            <p className="text-sm text-muted-foreground">{session.session_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.scheduled_at).toLocaleDateString()} at {new Date(session.scheduled_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{session.duration_minutes} min</Badge>
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
              </CardHeader>
              <CardContent>
                {completedSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No completed sessions yet</p>
                ) : (
                  <div className="space-y-4">
                    {completedSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={session.mentor.profile_image} />
                            <AvatarFallback>{session.mentor.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{session.mentor.name}</h4>
                            <p className="text-sm text-muted-foreground">{session.session_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.scheduled_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{session.rating}</span>
                            </div>
                          )}
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Mentorship Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                          {goal.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Hours</span>
                    <span className="font-semibold">{Math.round(completedSessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sessions Completed</span>
                    <span className="font-semibold">{completedSessions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Goals Achieved</span>
                    <span className="font-semibold">{goals.filter(g => g.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">
                        {completedSessions.filter(s => s.rating).length > 0 
                          ? (completedSessions.reduce((acc, s) => acc + (s.rating || 0), 0) / completedSessions.filter(s => s.rating).length).toFixed(1)
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Developed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Leadership', 'Communication', 'Technical Skills', 'Problem Solving'].map((skill, index) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{skill}</span>
                        <span>{Math.min(100, 20 + index * 15 + completedSessions.length * 5)}%</span>
                      </div>
                      <Progress value={Math.min(100, 20 + index * 15 + completedSessions.length * 5)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};