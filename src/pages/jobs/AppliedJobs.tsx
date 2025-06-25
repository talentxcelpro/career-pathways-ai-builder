
import React, { useState } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Calendar, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function AppliedJobs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch applied jobs
  const { data: appliedJobs = [], isLoading } = useQuery({
    queryKey: ['applied-jobs', searchTerm, statusFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('job_applications')
        .select(`
          *,
          jobs!fk_job_applications_job_id (
            *,
            companies (
              id,
              name,
              logo_url,
              industry
            ),
            job_categories (
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Frontend filtering for search term
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(app => 
          app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.jobs?.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filteredData;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'interview':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Send className="h-8 w-8 mr-3 text-blue-500" />
                Applied Jobs
              </h1>
              <p className="text-gray-600 mt-2">
                Track your {appliedJobs.length} job applications
              </p>
            </div>
            <Button onClick={() => navigate('/jobs')}>
              Browse More Jobs
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search applied jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {['applied', 'viewed', 'interview', 'accepted', 'rejected'].map((status) => {
              const count = appliedJobs.filter(app => app.status === status).length;
              return (
                <Card key={status}>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getStatusIcon(status)}
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-gray-500 capitalize">{status}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Applications List */}
        {appliedJobs.length > 0 ? (
          <div className="space-y-4">
            {appliedJobs.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex-1">
                      {application.jobs && (
                        <JobCard
                          job={application.jobs}
                          onSave={() => {}}
                          isSaved={false}
                          showCompany={true}
                        />
                      )}
                    </div>
                    
                    <div className="text-right space-y-2 min-w-[200px]">
                      <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status}</span>
                      </Badge>
                      
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Applied {formatDistanceToNow(new Date(application.applied_at))} ago
                      </div>
                      
                      {application.cover_letter && (
                        <div className="text-xs text-gray-400">
                          Cover letter included
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${application.jobs?.id}`)}
                      >
                        View Job
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Send className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6">
                Start applying to jobs to track your applications here.
              </p>
              <Button onClick={() => navigate('/jobs')}>
                <Search className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
