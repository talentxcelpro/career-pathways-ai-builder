import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Star,
  ExternalLink,
  FileText
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Application['status'] }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: ({ id, status }) => {
      queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard-real-data'] });
      toast.success(`Candidate status updated to ${status}`);
      setSelectedApp(prev => (prev && prev.id === id ? { ...prev, status } : prev));
    },
    onError: (err: any) => {
      toast.error('Failed to update status: ' + (err.message || 'Unknown error'));
    }
  });

  // Supabase Real-Time subscription for employer applications
  React.useEffect(() => {
    const channel = supabase
      .channel('employer-applications-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_applications' },
        (payload) => {
          console.log('⚡ Realtime job_applications update on applications page:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Get current authenticated user
  const { data: userAuth, isLoading: userLoading } = useQuery({
    queryKey: ['employer-auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

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

  // Fetch real applications data
  const { data: applications, isLoading } = useQuery({
    queryKey: ['employer-applications', companyId],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Get jobs posted by this user
      const { data: userJobs } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('posted_by', user.user.id);
      
      let jobIds = (userJobs || []).map(j => j.id);

      // If user is part of a company, also include company jobs
      if (companyId) {
        const { data: compJobs } = await supabase
          .from('jobs')
          .select('id, title')
          .eq('company_id', companyId);
        
        if (compJobs) {
          jobIds = Array.from(new Set([...jobIds, ...compJobs.map(j => j.id)]));
        }
      }

      // If no jobs exist for this employer yet, return empty list
      if (jobIds.length === 0) {
        return [];
      }

      const { data: appsData, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          user_id,
          status,
          applied_at,
          resume_url,
          cover_letter,
          ai_match_score,
          application_data,
          jobs:jobs!fk_job_applications_job_id (
            id,
            title
          ),
          profiles:profiles!fk_job_applications_user_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching real applications:', error);
        return [];
      }

      return (appsData || []).map((app: any) => {
        const appData = app.application_data || {};
        return {
          id: app.id,
          job_id: app.job_id,
          job_title: app.jobs?.title || appData.jobTitle || 'Position',
          candidate_name: app.profiles?.full_name || appData.fullName || appData.candidate_name || 'Candidate',
          candidate_email: app.profiles?.email || appData.email || 'No email provided',
          candidate_phone: app.profiles?.phone || appData.phoneNumber || appData.phone || undefined,
          applied_at: app.applied_at || new Date().toISOString(),
          status: (app.status?.toLowerCase() || 'pending') as Application['status'],
          resume_url: app.resume_url || appData.resumeUrl || undefined,
          cover_letter: app.cover_letter || appData.coverLetter || undefined,
          rating: app.ai_match_score ? Math.min(5, Math.max(1, Math.round(app.ai_match_score / 20))) : undefined,
        };
      });
    },
  });

  const statusCounts = React.useMemo(() => {
    const defaultCounts: Record<string, number> = {
      all: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewed: 0,
      hired: 0,
      rejected: 0,
    };
    if (!applications) return defaultCounts;
    
    applications.forEach(app => {
      const s = app.status || 'pending';
      defaultCounts[s] = (defaultCounts[s] || 0) + 1;
    });
    
    defaultCounts.all = applications.length;
    return defaultCounts;
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

  if (!userLoading && !userAuth) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-12 text-center max-w-md mx-auto shadow-sm">
          <Users className="h-14 w-14 text-blue-600 mx-auto mb-4 bg-blue-50 p-3 rounded-full" />
          <h2 className="text-2xl font-bold mb-2">Employer Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Sign in to your employer account to review candidates, manage applications, and schedule interviews.
          </p>
          <Button onClick={() => navigate('/auth?redirect=/employer/applications')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Sign In to Employer Portal
          </Button>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedApp(application)}
                        className="hover:bg-blue-50 hover:text-blue-600 border-slate-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`mailto:${application.candidate_email}?subject=${encodeURIComponent(`Regarding your application for ${application.job_title} at TalentXcel`)}`, '_blank')}
                        className="hover:bg-slate-100 border-slate-200"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/employer/interview/schedule?appId=${application.id}&name=${encodeURIComponent(application.candidate_name)}&email=${encodeURIComponent(application.candidate_email)}&jobTitle=${encodeURIComponent(application.job_title)}&jobId=${application.job_id}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule
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
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedStatus !== 'all' 
                  ? "Try adjusting your search or filters"
                  : "Applications will appear here in real-time when candidates apply to your jobs"
                }
              </p>
              {!searchQuery && selectedStatus === 'all' && (
                <Button onClick={() => navigate('/jobs/post')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Post a Job to Receive Applications
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Details & Stage Progression Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4 pr-6">
                  <div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      {selectedApp.candidate_name}
                      <Badge className={`${getStatusColor(selectedApp.status)} ml-2 text-xs`}>
                        {selectedApp.status}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-blue-600 mt-1">
                      Applied for: {selectedApp.job_title}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{selectedApp.candidate_email}</span>
                  </div>
                  {selectedApp.candidate_phone && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{selectedApp.candidate_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Applied on {new Date(selectedApp.applied_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                  </div>
                  {selectedApp.rating && (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      <span>TalentScore Match: {selectedApp.rating}/5</span>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                {selectedApp.cover_letter && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Cover Letter / Candidate Note</h4>
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {selectedApp.cover_letter}
                    </div>
                  </div>
                )}

                {/* Resume Access */}
                {selectedApp.resume_url && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Resume / CV Document</h4>
                    <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 text-sm text-blue-900 font-medium">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>Candidate Attached Resume</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApp.resume_url, '_blank')}
                          className="bg-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <a href={selectedApp.resume_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Update Actions */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2.5">Move Candidate to Stage</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { status: 'reviewed', label: 'Mark Reviewed', className: 'hover:bg-blue-50 text-blue-700 border-blue-200' },
                      { status: 'shortlisted', label: 'Shortlist', className: 'hover:bg-purple-50 text-purple-700 border-purple-200' },
                      { status: 'interviewed', label: 'Interviewed', className: 'hover:bg-indigo-50 text-indigo-700 border-indigo-200' },
                      { status: 'hired', label: 'Mark Hired', className: 'hover:bg-emerald-50 text-emerald-700 border-emerald-200' },
                      { status: 'rejected', label: 'Reject', className: 'hover:bg-rose-50 text-rose-700 border-rose-200' },
                    ].map((act) => (
                      <Button
                        key={act.status}
                        variant="outline"
                        size="sm"
                        disabled={selectedApp.status === act.status || updateStatusMutation.isPending}
                        onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: act.status as any })}
                        className={`${act.className} ${selectedApp.status === act.status ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-60' : ''}`}
                      >
                        {act.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const app = selectedApp;
                    setSelectedApp(null);
                    navigate(`/employer/interview/schedule?appId=${app.id}&name=${encodeURIComponent(app.candidate_name)}&email=${encodeURIComponent(app.candidate_email)}&jobTitle=${encodeURIComponent(app.job_title)}&jobId=${app.job_id}`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Schedule Interview
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EmployerApplications() {
  return <ApplicationsContent />;
}