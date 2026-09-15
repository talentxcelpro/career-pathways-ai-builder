import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, TrendingUp, Plus, Search, Building, Calendar, DollarSign, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from 'sonner';

interface HiringRequest {
  id: string;
  company_id: string;
  job_title: string;
  required_skills: string[];
  experience_level: string;
  salary_range_min: number;
  salary_range_max: number;
  positions_available: number;
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  custom_training_required: boolean;
  training_requirements: any;
  hiring_deadline: string;
  status: 'open' | 'in_progress' | 'filled' | 'cancelled';
  placement_fee_percentage: number;
  created_at: string;
  company_name?: string;
}

interface TalentMatch {
  id: string;
  user_id: string;
  job_id: string;
  match_score: number;
  matching_factors: any;
  skill_gaps: string[];
  recommended_actions: string[];
  estimated_training_time: number;
  salary_prediction_min: number;
  salary_prediction_max: number;
  placement_probability: number;
  full_name?: string;
  email?: string;
  current_role?: string;
}

export const CompanyPartnershipPortal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHiringRequest, setSelectedHiringRequest] = useState<HiringRequest | null>(null);
  const queryClient = useQueryClient();

  // Fetch hiring requests
  const { data: hiringRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['hiring-requests', searchQuery, selectedStatus],
    queryFn: async () => {
      // Mock hiring requests - replace with actual Supabase query
      const mockRequests: HiringRequest[] = [
        {
          id: '1',
          company_id: 'tech-corp',
          job_title: 'Senior React Developer',
          required_skills: ['React.js', 'TypeScript', 'Node.js', 'AWS'],
          experience_level: 'senior',
          salary_range_min: 1200000,
          salary_range_max: 1800000,
          positions_available: 3,
          urgency_level: 'high',
          custom_training_required: true,
          training_requirements: { focus_areas: ['TypeScript', 'AWS'] },
          hiring_deadline: '2024-03-15',
          status: 'open',
          placement_fee_percentage: 15,
          created_at: '2024-01-15',
          company_name: 'TechCorp Solutions'
        },
        {
          id: '2',
          company_id: 'startup-xyz',
          job_title: 'Full Stack Developer',
          required_skills: ['JavaScript', 'Python', 'React', 'Django'],
          experience_level: 'mid',
          salary_range_min: 800000,
          salary_range_max: 1200000,
          positions_available: 2,
          urgency_level: 'medium',
          custom_training_required: false,
          training_requirements: {},
          hiring_deadline: '2024-04-01',
          status: 'open',
          placement_fee_percentage: 12,
          created_at: '2024-01-20',
          company_name: 'StartupXYZ'
        }
      ];

      return mockRequests.filter(request => {
        const matchesSearch = request.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            request.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
      });
    }
  });

  // Fetch talent matches for selected hiring request
  const { data: talentMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ['talent-matches', selectedHiringRequest?.id],
    queryFn: async () => {
      if (!selectedHiringRequest) return [];
      
      // Mock talent matches - replace with actual AI matching query
      const mockMatches: TalentMatch[] = [
        {
          id: '1',
          user_id: 'user-1',
          job_id: selectedHiringRequest.id,
          match_score: 92,
          matching_factors: { skills: 0.9, experience: 0.85, location: 1.0 },
          skill_gaps: ['AWS'],
          recommended_actions: ['Complete AWS certification', 'Build cloud portfolio project'],
          estimated_training_time: 40,
          salary_prediction_min: 1400000,
          salary_prediction_max: 1600000,
          placement_probability: 85,
          full_name: 'John Smith',
          email: 'john.smith@example.com',
          current_role: 'Frontend Developer'
        },
        {
          id: '2',
          user_id: 'user-2',
          job_id: selectedHiringRequest.id,
          match_score: 78,
          matching_factors: { skills: 0.8, experience: 0.7, location: 1.0 },
          skill_gaps: ['TypeScript', 'AWS'],
          recommended_actions: ['Learn TypeScript', 'AWS fundamentals course'],
          estimated_training_time: 60,
          salary_prediction_min: 1200000,
          salary_prediction_max: 1400000,
          placement_probability: 65,
          full_name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          current_role: 'Junior Developer'
        }
      ];

      return mockMatches;
    },
    enabled: !!selectedHiringRequest
  });

  const createHiringRequestMutation = useMutation({
    mutationFn: async (requestData: Partial<HiringRequest>) => {
      // Mock creation - replace with actual Supabase insert
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Hiring request created successfully!');
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['hiring-requests'] });
    },
    onError: (error) => {
      toast.error('Failed to create hiring request: ' + error.message);
    }
  });

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'filled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  if (requestsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Partnership Portal</h1>
          <p className="text-muted-foreground">Hire top talent with guaranteed placement support</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Hiring Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Hiring Request</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Hiring request form coming soon...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hiringRequests?.filter(r => r.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Placements</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">326</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hiring Requests Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring Requests</CardTitle>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {hiringRequests?.map((request) => (
              <div
                key={request.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedHiringRequest?.id === request.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedHiringRequest(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium">{request.job_title}</h4>
                    <p className="text-sm text-muted-foreground">{request.company_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={getUrgencyColor(request.urgency_level)}>
                        {request.urgency_level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {request.positions_available} positions
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatSalary(request.salary_range_min)} - {formatSalary(request.salary_range_max)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Talent Matches Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedHiringRequest ? `Matches for ${selectedHiringRequest.job_title}` : 'Select a Hiring Request'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {selectedHiringRequest ? (
              <div className="space-y-4">
                {/* Job Details */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedHiringRequest.required_skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Deadline: {new Date(selectedHiringRequest.hiring_deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedHiringRequest.experience_level}
                    </span>
                  </div>
                </div>

                {/* Talent Matches */}
                {matchesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {talentMatches?.map((match) => (
                      <div key={match.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h5 className="font-medium">{match.full_name}</h5>
                            <p className="text-sm text-muted-foreground">{match.current_role}</p>
                            <p className="text-xs text-muted-foreground">{match.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{match.match_score}% match</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {match.placement_probability}% placement probability
                            </div>
                          </div>
                        </div>
                        
                        {match.skill_gaps.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium mb-1">Skill gaps:</p>
                            <div className="flex flex-wrap gap-1">
                              {match.skill_gaps.map((gap) => (
                                <Badge key={gap} variant="outline" className="text-xs">
                                  {gap}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Est. training: {match.estimated_training_time}h
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm font-medium">
                            {formatSalary(match.salary_prediction_min)} - {formatSalary(match.salary_prediction_max)}
                          </span>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline">
                              View Profile
                            </Button>
                            <Button size="sm">
                              Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Request Selected</h3>
                <p className="text-muted-foreground">
                  Select a hiring request to view matched candidates.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};