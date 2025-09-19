import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationStatusTracker } from '@/components/jobs/ApplicationStatusTracker';
import { ApplicationInsights } from '@/components/jobs/ApplicationInsights';
import { useJobApplications, useDeleteJobApplication } from '@/hooks/useJobApplications';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, FileText, TrendingUp, Briefcase, Clock, CheckCircle, Eye, ExternalLink, Calendar, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const MyApplications = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('tracker');
  
  const { data: applications, isLoading } = useJobApplications(user?.id);
  const deleteApplication = useDeleteJobApplication();

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = !searchTerm || 
      app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobs?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleWithdraw = async (applicationId: string) => {
    try {
      await deleteApplication.mutateAsync(applicationId);
    } catch (error) {
      console.error('Failed to withdraw application:', error);
    }
  };

  const handleFollowUp = (applicationId: string) => {
    // TODO: Implement follow-up functionality
    toast.info('Follow-up feature coming soon!');
  };

  // Calculate insights
  const totalApplications = applications?.length || 0;
  const interviewCount = applications?.filter(app => 
    ['interviewed', 'hired'].includes(app.status)
  ).length || 0;
  const successRate = totalApplications > 0 ? (interviewCount / totalApplications) * 100 : 0;
  
  const recentActivity = applications?.slice(0, 10).map(app => ({
    type: app.status as any,
    date: app.applied_at,
    company: app.jobs?.company_name || 'Unknown Company',
    role: app.jobs?.title || 'Unknown Role'
  })) || [];

  const recommendations = totalApplications > 0 ? [
    'Your response rate is above average! Keep applying to similar roles.',
    'Consider customizing your resume for each application to increase success rate.',
    'Follow up on applications that are older than 2 weeks.',
    'Expand your search to include related job titles and companies.'
  ] : [
    'Start by applying to 5-10 jobs this week to build momentum.',
    'Focus on roles that match 70-80% of your skills.',
    'Customize your resume for each application.',
    'Set up job alerts for your target roles.'
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage your job applications
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{totalApplications} total applications</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by job title or company..."
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Application Tracker
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights & Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-6">
          <ApplicationStatusTracker
            applications={filteredApplications.map(app => ({
              id: app.id,
              job_title: app.jobs?.title || 'Unknown Role',
              company_name: app.jobs?.company_name || 'Unknown Company',
              status: app.status as any,
              applied_at: app.applied_at,
              last_updated: app.updated_at,
              notes: app.application_data?.notes,
              application_data: app.application_data
            }))}
            onWithdraw={handleWithdraw}
            onFollowUp={handleFollowUp}
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <ApplicationInsights
            totalApplications={totalApplications}
            successRate={Math.round(successRate)}
            averageResponseTime={7} // TODO: Calculate actual average
            recentActivity={recentActivity}
            recommendations={recommendations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyApplications;