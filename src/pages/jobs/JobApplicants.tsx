
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  MessageSquare, 
  Download,
  Eye,
  Mail,
  Phone
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface JobApplication {
  id: string;
  status: string;
  applied_at: string;
  ai_match_score: number;
  resume_url?: string;
  cover_letter?: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
    profile_picture_url?: string;
    title?: string;
    location?: string;
    experience_years?: number;
    skills?: string[];
  };
}

const JobApplicants = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('applied_at');

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(name, logo_url)
        `)
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: applications, isLoading } = useQuery({
    queryKey: ['job-applications', jobId, searchTerm, statusFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('job_applications')
        .select(`
          *,
          profiles!inner(
            full_name,
            email,
            phone,
            profile_picture_url,
            title,
            location,
            experience_years,
            skills
          )
        `)
        .eq('job_id', jobId);

      if (searchTerm) {
        query = query.or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply sorting
      switch (sortBy) {
        case 'match_score':
          query = query.order('ai_match_score', { ascending: false, nullsLast: true });
          break;
        case 'experience':
          query = query.order('profiles.experience_years', { ascending: false, nullsLast: true });
          break;
        case 'applied_at':
        default:
          query = query.order('applied_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JobApplication[];
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'applied': { color: 'bg-blue-100 text-blue-800', label: 'Applied' },
      'reviewing': { color: 'bg-yellow-100 text-yellow-800', label: 'Reviewing' },
      'shortlisted': { color: 'bg-purple-100 text-purple-800', label: 'Shortlisted' },
      'interview_scheduled': { color: 'bg-orange-100 text-orange-800', label: 'Interview Scheduled' },
      'interviewed': { color: 'bg-indigo-100 text-indigo-800', label: 'Interviewed' },
      'offered': { color: 'bg-green-100 text-green-800', label: 'Offered' },
      'hired': { color: 'bg-emerald-100 text-emerald-800', label: 'Hired' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (jobLoading || isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
        <Button onClick={() => navigate('/jobs/manage')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/jobs/manage')}
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
            >
              ← Back to Jobs
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-gray-600 mt-1">
            {job.companies?.name} • {applications?.length || 0} applicants
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/jobs/manage/${jobId}/edit`)}>
            Edit Job
          </Button>
          <Button onClick={() => navigate(`/jobs/manage/${jobId}/analytics`)}>
            View Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied_at">Application Date</SelectItem>
                <SelectItem value="match_score">Match Score</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants Table */}
      {applications && applications.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Applicants ({applications.length})</CardTitle>
            <CardDescription>Manage and review job applications</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {application.profiles.profile_picture_url ? (
                            <img 
                              src={application.profiles.profile_picture_url} 
                              alt={application.profiles.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {application.profiles.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.profiles.title || 'No title'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {application.profiles.location || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.status)}
                    </TableCell>
                    <TableCell>
                      {application.ai_match_score ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className={`font-medium ${getMatchScoreColor(application.ai_match_score)}`}>
                            {Math.round(application.ai_match_score * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not scored</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {application.profiles.experience_years || 0} years
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {formatDate(application.applied_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/jobs/manage/${jobId}/applicants/${application.user_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`mailto:${application.profiles.email}`)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        {application.profiles.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`tel:${application.profiles.phone}`)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        {application.resume_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(application.resume_url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No applicants yet</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No applicants match your current filters.'
                  : 'This job hasn\'t received any applications yet. Share it to attract candidates!'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={() => navigate(`/jobs/${jobId}`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Job Posting
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobApplicants;
