
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Map, 
  Clock, 
  Target, 
  TrendingUp,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  Eye,
  Calendar,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  created_at: string;
  updated_at: string;
}

const MyRoadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, archived
  const { toast } = useToast();

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRoadmaps(data || []);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast({
        title: "Error",
        description: "Failed to load roadmaps.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRoadmapStatus = async (roadmapId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('roadmaps')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', roadmapId);

      if (error) throw error;

      setRoadmaps(prev => prev.map(roadmap => 
        roadmap.id === roadmapId 
          ? { ...roadmap, status: newStatus }
          : roadmap
      ));

      toast({
        title: "Success",
        description: `Roadmap ${newStatus} successfully.`,
      });
    } catch (error) {
      console.error('Error updating roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to update roadmap status.",
        variant: "destructive",
      });
    }
  };

  const deleteRoadmap = async (roadmapId: string) => {
    if (!confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', roadmapId);

      if (error) throw error;

      setRoadmaps(prev => prev.filter(roadmap => roadmap.id !== roadmapId));

      toast({
        title: "Success",
        description: "Roadmap deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to delete roadmap.",
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

  const filteredRoadmaps = roadmaps.filter(roadmap => {
    if (filter === 'all') return true;
    return roadmap.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading your roadmaps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Map className="h-8 w-8 text-blue-600 mr-3" />
              My Career Roadmaps
            </h1>
            <p className="text-gray-600">Manage and track your career development plans</p>
          </div>
          <Link to="/career-map/ai-roadmap-builder">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Roadmap
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'all', label: 'All Roadmaps', count: roadmaps.length },
            { key: 'active', label: 'Active', count: roadmaps.filter(r => r.status === 'active').length },
            { key: 'completed', label: 'Completed', count: roadmaps.filter(r => r.status === 'completed').length },
            { key: 'archived', label: 'Archived', count: roadmaps.filter(r => r.status === 'archived').length }
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'outline'}
              onClick={() => setFilter(tab.key)}
              className="relative"
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Roadmaps Grid */}
        {filteredRoadmaps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No roadmaps yet' : `No ${filter} roadmaps`}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'Start building your career path with AI guidance' 
                  : `You don't have any ${filter} roadmaps at the moment`
                }
              </p>
              {filter === 'all' && (
                <Link to="/career-map/ai-roadmap-builder">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Roadmap
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRoadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                        {roadmap.ai_generated && (
                          <Badge variant="outline" className="text-xs">
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {roadmap.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/career-map/${roadmap.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/career-map/edit/${roadmap.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {roadmap.status === 'active' && (
                          <DropdownMenuItem onClick={() => updateRoadmapStatus(roadmap.id, 'paused')}>
                            <Archive className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {roadmap.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => updateRoadmapStatus(roadmap.id, 'archived')}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => deleteRoadmap(roadmap.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">{roadmap.progress_percentage}%</span>
                      </div>
                      <Progress value={roadmap.progress_percentage} className="h-2" />
                    </div>

                    {/* Career Transition */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Target className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">From:</span>
                        <span className="ml-1 font-medium">{roadmap.current_position}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-600">To:</span>
                        <span className="ml-1 font-medium">{roadmap.target_role}</span>
                      </div>
                      {roadmap.target_company && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-600">at</span>
                          <span className="ml-1 font-medium">{roadmap.target_company}</span>
                        </div>
                      )}
                    </div>

                    {/* Timeline & Status */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {roadmap.timeline_months} months
                      </div>
                      <Badge className={`text-xs ${getStatusColor(roadmap.status)}`}>
                        {roadmap.status.charAt(0).toUpperCase() + roadmap.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Updated {new Date(roadmap.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoadmaps;
