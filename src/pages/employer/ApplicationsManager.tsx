import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useJobApplications } from '@/hooks/useJobApplications';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Eye, Phone, Mail, MapPin, Calendar, DollarSign, Clock, FileText, ExternalLink, Users, TrendingUp, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedApplicationsManager() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const queryClient = useQueryClient();

  // Get applications for jobs posted by current user (employer view)
  const { data: employerApplications = [], isLoading: isLoadingEmployer } = useJobApplications();
  
  // Filter applications to only show ones for jobs posted by current user
  const userJobApplications = employerApplications.filter(app => 
    app.jobs && user?.id // Only show if we have job data and user is authenticated
  );

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ applicationId, status, notes }: { applicationId: string; status: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      // Also create a note if provided
      if (notes) {
        await supabase
          .from('application_notes')
          .insert({
            application_id: applicationId,
            note: notes,
            created_by: user?.id
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application status updated successfully');
      setSelectedApplication(null);
      setStatusNotes('');
    },
    onError: (error) => {
      console.error('Failed to update application status:', error);
      toast.error('Failed to update application status');
    }
  });

  const filteredApplications = userJobApplications.filter(app => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      app.application_data?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_data?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await updateApplicationStatus.mutateAsync({
        applicationId,
        status: newStatus,
        notes: statusNotes
      });
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'interviewed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hired': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'reviewed': return 'Under Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interviewed': return 'Interviewed';
      case 'hired': return 'Hired';
      case 'rejected': return 'Not Selected';
      default: return 'Pending';
    }
  };

  const handleDownloadResume = (url: string, candidateName: string) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${candidateName}_resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error('Resume not available');
    }
  };

  // Calculate stats
  const totalApplications = filteredApplications.length;
  const pendingApplications = filteredApplications.filter(app => app.status === 'applied').length;
  const shortlistedApplications = filteredApplications.filter(app => app.status === 'shortlisted').length;
  const hiredApplications = filteredApplications.filter(app => app.status === 'hired').length;

  if (isLoadingEmployer) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Application Management</h1>
          <p className="text-muted-foreground">Manage and track job applications for your postings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
                <p className="text-2xl font-bold">{shortlistedApplications}</p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hired</p>
                <p className="text-2xl font-bold">{hiredApplications}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by candidate name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
              <div className="text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
                <p>No applications match your current filters, or you haven't received any applications yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {application.application_data?.fullName || 'Candidate'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{application.jobs?.title}</p>
                        <p className="text-xs text-muted-foreground">{application.jobs?.company_name}</p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {application.application_data?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{application.application_data.email}</span>
                        </div>
                      )}
                      {application.application_data?.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{application.application_data.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(application.applied_at).toLocaleDateString()}</span>
                      </div>
                      {application.application_data?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{application.application_data.location}</span>
                        </div>
                      )}
                    </div>

                    {(application.application_data?.currentCTC || application.application_data?.expectedCTC) && (
                      <div className="flex items-center gap-4 text-sm">
                        {application.application_data?.currentCTC && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>Current: ₹{application.application_data.currentCTC} LPA</span>
                          </div>
                        )}
                        {application.application_data?.expectedCTC && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>Expected: ₹{application.application_data.expectedCTC} LPA</span>
                          </div>
                        )}
                      </div>
                    )}

                    {application.application_data?.noticePeriod && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Notice Period: {application.application_data.noticePeriod}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {application.resume_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadResume(
                          application.resume_url, 
                          application.application_data?.fullName || 'candidate'
                        )}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Manage Application - {application.application_data?.fullName || 'Candidate'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Update Status</label>
                              <Select 
                                value={application.status} 
                                onValueChange={(value) => handleStatusUpdate(application.id, value)}
                                disabled={updateApplicationStatus.isPending}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="applied">Applied</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                  <SelectItem value="interviewed">Interviewed</SelectItem>
                                  <SelectItem value="hired">Hired</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Add Notes</label>
                            <Textarea
                              value={statusNotes}
                              onChange={(e) => setStatusNotes(e.target.value)}
                              placeholder="Add notes about this candidate..."
                              className="mt-1"
                            />
                          </div>

                          {application.application_data && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Candidate Information</h4>
                              <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                                {application.application_data.linkedinProfile && (
                                  <div className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    <a 
                                      href={application.application_data.linkedinProfile} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      LinkedIn Profile
                                    </a>
                                  </div>
                                )}
                                {application.application_data.portfolioWebsite && (
                                  <div className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    <a 
                                      href={application.application_data.portfolioWebsite} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Portfolio Website
                                    </a>
                                  </div>
                                )}
                                {application.application_data.preferredCallTime && (
                                  <div>
                                    <strong>Preferred Call Time:</strong> {application.application_data.preferredCallTime}
                                  </div>
                                )}
                                {application.application_data.yearsOfExperience && (
                                  <div>
                                    <strong>Experience:</strong> {application.application_data.yearsOfExperience} years
                                  </div>
                                )}
                                {application.application_data.remoteWorkPreference && (
                                  <div>
                                    <strong>Remote Work:</strong> {application.application_data.remoteWorkPreference}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}