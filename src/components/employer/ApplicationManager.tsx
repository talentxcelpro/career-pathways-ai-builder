import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  Briefcase,
  Star,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  resume_url?: string;
  cover_letter_url?: string;
  application_data: any;
  jobs: {
    title: string;
    company_name?: string;
  };
  profiles: {
    full_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
  };
}

export const ApplicationManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchApplications();
    fetchEmployerJobs();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, jobFilter]);

  const fetchEmployerJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('posted_by', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner(title, company_name, posted_by),
          profiles(full_name, email, phone, avatar_url)
        `)
        .eq('jobs.posted_by', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => {
        const name = app.profiles?.full_name || app.application_data?.fullName || '';
        const email = app.profiles?.email || app.application_data?.email || '';
        const jobTitle = app.jobs?.title || '';
        
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.job_id === jobFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      applied: { variant: 'secondary', label: 'Applied' },
      reviewing: { variant: 'default', label: 'Reviewing' },
      shortlisted: { variant: 'default', label: 'Shortlisted' },
      interview_scheduled: { variant: 'default', label: 'Interview Scheduled' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      hired: { variant: 'default', label: 'Hired' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied;
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const ApplicationCard: React.FC<{ application: Application }> = ({ application }) => {
    const applicantName = application.profiles?.full_name || application.application_data?.fullName || 'N/A';
    const applicantEmail = application.profiles?.email || application.application_data?.email || 'N/A';
    const applicantPhone = application.profiles?.phone || application.application_data?.phoneNumber || 'N/A';

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {application.profiles?.avatar_url ? (
                  <img 
                    src={application.profiles.avatar_url} 
                    alt={applicantName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{applicantName}</h3>
                <p className="text-muted-foreground">{application.jobs?.title}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {applicantEmail}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {applicantPhone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(application.applied_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(application.status)}
            </div>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {application.application_data?.currentCTC && (
              <div className="text-sm">
                <span className="font-medium">Current CTC:</span>
                <p className="text-muted-foreground">₹{application.application_data.currentCTC} LPA</p>
              </div>
            )}
            {application.application_data?.expectedCTC && (
              <div className="text-sm">
                <span className="font-medium">Expected CTC:</span>
                <p className="text-muted-foreground">₹{application.application_data.expectedCTC} LPA</p>
              </div>
            )}
            {application.application_data?.noticePeriod && (
              <div className="text-sm">
                <span className="font-medium">Notice Period:</span>
                <p className="text-muted-foreground">{application.application_data.noticePeriod.replace('_', ' ')}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {application.resume_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(application.resume_url, '_blank')}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Resume
                </Button>
              )}
              {application.cover_letter_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(application.cover_letter_url, '_blank')}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Cover Letter
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={application.status}
                onValueChange={(value) => updateApplicationStatus(application.id, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Application Manager</h1>
          <p className="text-muted-foreground">Manage and review job applications</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {filteredApplications.length} Applications
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                {applications.length === 0 
                  ? "You haven't received any job applications yet."
                  : "No applications match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </div>
    </div>
  );
};