import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  MessageSquare,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployerAccessGuard } from "@/components/employer/EmployerAccessGuard";

interface Application {
  id: string;
  job_title: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  applied_at: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  resume_url?: string;
  cover_letter?: string;
  rating?: number;
}

function ApplicationsContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get company ID from team membership
  const { data: teamData } = useQuery({
    queryKey: ['user-team-membership'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('company_team_members')
        .select('company_id, role')
        .eq('user_id', user.user.id)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },
  });

  const companyId = teamData?.company_id;

  // Fetch applications data
  const { data: applications, isLoading } = useQuery({
    queryKey: ['employer-applications', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Mock data for now - replace with actual Supabase query when job_applications table is ready
      const mockApplications: Application[] = [
        {
          id: '1',
          job_title: 'Senior Frontend Developer',
          job_id: 'job-1',
          candidate_name: 'John Smith',
          candidate_email: 'john.smith@email.com',
          candidate_phone: '+1 234 567 8900',
          applied_at: '2025-01-08T10:00:00Z',
          status: 'pending',
          rating: 4,
        },
        {
          id: '2',
          job_title: 'UX Designer',
          job_id: 'job-2',
          candidate_name: 'Sarah Johnson',
          candidate_email: 'sarah.j@email.com',
          applied_at: '2025-01-07T14:30:00Z',
          status: 'reviewed',
          rating: 5,
        },
        {
          id: '3',
          job_title: 'Backend Engineer',
          job_id: 'job-3',
          candidate_name: 'Michael Chen',
          candidate_email: 'michael.chen@email.com',
          applied_at: '2025-01-06T09:15:00Z',
          status: 'shortlisted',
          rating: 4,
        },
      ];

      return mockApplications;
    },
    enabled: !!companyId,
  });

  const statusCounts = React.useMemo(() => {
    if (!applications) return {};
    
    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    counts.all = applications.length;
    return counts;
  }, [applications]);

  const filteredApplications = React.useMemo(() => {
    if (!applications) return [];
    
    return applications.filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidate_email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, selectedStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <Star className="h-4 w-4" />;
      case 'interviewed': return <MessageSquare className="h-4 w-4" />;
      case 'hired': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interviewed': return 'bg-indigo-100 text-indigo-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Company Access</h2>
          <p className="text-gray-600">You need company access to view applications.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Manage and review job applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card 
          className={`cursor-pointer transition-all duration-200 hover-scale ${selectedStatus === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statusCounts.all || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {['pending', 'reviewed', 'shortlisted', 'interviewed', 'hired'].map((status) => (
          <Card 
            key={status}
            className={`cursor-pointer transition-all duration-200 hover-scale ${selectedStatus === status ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                  <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
                </div>
                {getStatusIcon(status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by candidate name, job title, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{application.candidate_name}</h3>
                        <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </Badge>
                        {application.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{application.rating}/5</span>
                          </div>
                        )}
                      </div>
                      <p className="text-blue-600 font-medium mb-1">{application.job_title}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {application.candidate_email}
                        </div>
                        {application.candidate_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {application.candidate_phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(application.applied_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedStatus !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Applications will appear here when candidates apply to your jobs"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmployerApplications() {
  return (
    <EmployerAccessGuard>
      <ApplicationsContent />
    </EmployerAccessGuard>
  );
}