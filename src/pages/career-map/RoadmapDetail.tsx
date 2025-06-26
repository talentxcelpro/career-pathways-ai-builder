
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Award,
  Users,
  Link as LinkIcon,
  Star
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  current_position: string;
  target_role: string;
  target_company: string;
  timeline_months: number;
  status: string;
  progress_percentage: number;
  ai_generated: boolean;
  skills_current: string[];
  skills_target: string[];
  created_at: string;
  updated_at: string;
  roadmap_data: any;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completion_date: string;
  status: string;
  milestone_type: string;
  priority: number;
  resources: string[];
}

const RoadmapDetail = () => {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchRoadmapDetails();
    }
  }, [id]);

  const fetchRoadmapDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch roadmap
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (roadmapError) throw roadmapError;
      setRoadmap(roadmapData);

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('roadmap_milestones')
        .select('*')
        .eq('roadmap_id', id)
        .order('priority', { ascending: true });

      if (milestonesError) throw milestonesError;
      setMilestones(milestonesData || []);
    } catch (error) {
      console.error('Error fetching roadmap details:', error);
      toast({
        title: "Error",
        description: "Failed to load roadmap details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completionDate = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null;

    try {
      const { error } = await supabase
        .from('roadmap_milestones')
        .update({ 
          status: newStatus,
          completion_date: completionDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) throw error;

      setMilestones(prev => prev.map(milestone => 
        milestone.id === milestoneId 
          ? { ...milestone, status: newStatus, completion_date: completionDate }
          : milestone
      ));

      // Update roadmap progress
      const completedCount = milestones.filter(m => 
        m.id === milestoneId ? newStatus === 'completed' : m.status === 'completed'
      ).length;
      const progressPercentage = Math.round((completedCount / milestones.length) * 100);

      const { error: progressError } = await supabase
        .from('roadmaps')
        .update({ 
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (progressError) throw progressError;

      if (roadmap) {
        setRoadmap(prev => prev ? { ...prev, progress_percentage: progressPercentage } : null);
      }

      toast({
        title: "Success",
        description: `Milestone ${newStatus === 'completed' ? 'completed' : 'reopened'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return BookOpen;
      case 'certification': return Award;
      case 'experience': return Users;
      case 'project': return Target;
      default: return CheckCircle;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading roadmap details...</div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Roadmap not found</h1>
            <Link to="/career-map/my-roadmaps">
              <Button>Back to My Roadmaps</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/career-map/my-roadmaps">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Roadmaps
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold text-gray-900">{roadmap.title}</h1>
                {roadmap.ai_generated && (
                  <Badge variant="outline">AI Generated</Badge>
                )}
                <Badge className={`${getStatusColor(roadmap.status)}`}>
                  {roadmap.status.charAt(0).toUpperCase() + roadmap.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">{roadmap.description}</p>
            </div>
          </div>
          <Link to={`/career-map/edit/${roadmap.id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Roadmap
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Overall Progress</span>
                    <span className="text-2xl font-bold text-blue-600">{roadmap.progress_percentage}%</span>
                  </div>
                  <Progress value={roadmap.progress_percentage} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {milestones.filter(m => m.status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {milestones.filter(m => m.status === 'in_progress').length}
                      </p>
                      <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {milestones.filter(m => m.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Career Transition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Career Transition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Current Position</p>
                      <p className="font-semibold text-lg">{roadmap.current_position}</p>
                    </div>
                    <ArrowLeft className="h-6 w-6 text-gray-400 rotate-180" />
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Target Role</p>
                      <p className="font-semibold text-lg">{roadmap.target_role}</p>
                      {roadmap.target_company && (
                        <p className="text-sm text-gray-500">at {roadmap.target_company}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{roadmap.timeline_months} months timeline</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Roadmap Milestones
                </CardTitle>
                <CardDescription>
                  Track your progress through each milestone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => {
                    const Icon = getMilestoneTypeIcon(milestone.milestone_type);
                    const isCompleted = milestone.status === 'completed';
                    
                    return (
                      <div key={milestone.id} className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => toggleMilestoneStatus(milestone.id, milestone.status)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Icon className="h-4 w-4 text-gray-500" />
                                <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-600' : ''}`}>
                                  {milestone.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: milestone.priority }).map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${getPriorityColor(milestone.priority)}`} fill="currentColor" />
                                  ))}
                                </div>
                              </div>
                              <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                                {milestone.description}
                              </p>
                              
                              {milestone.resources && milestone.resources.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {milestone.resources.map((resource, resourceIndex) => (
                                    <Badge key={resourceIndex} variant="outline" className="text-xs">
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {milestone.target_date && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Due: {new Date(milestone.target_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {milestone.completion_date && (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Completed: {new Date(milestone.completion_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Current Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {roadmap.skills_current?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Target Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {roadmap.skills_target?.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Started</span>
                    <span className="text-sm font-medium">
                      {new Date(roadmap.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">{roadmap.timeline_months} months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">
                      {new Date(roadmap.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Completion</span>
                    <span className="text-sm font-medium">
                      {new Date(new Date(roadmap.created_at).getTime() + roadmap.timeline_months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to={`/career-map/edit/${roadmap.id}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Roadmap
                    </Button>
                  </Link>
                  <Link to="/career-map/skills-gap" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Skills Gap Analysis
                    </Button>
                  </Link>
                  <Link to="/career-map/recommendations" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Get Recommendations
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetail;
