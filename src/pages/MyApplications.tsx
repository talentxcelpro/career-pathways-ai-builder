import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobApplicationStats, useJobApplications } from '@/hooks/useJobApplications';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, CheckCircle, TrendingUp, Eye, ExternalLink, Calendar, MapPin, DollarSign, FileText } from 'lucide-react';

const MyApplications = () => {
  const { user } = useAuth();
  const { data: stats } = useJobApplicationStats();
  const { data: applications = [], isLoading } = useJobApplications(user?.id);

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track your job applications and their status</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
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
                  <p className="text-2xl font-bold">{stats.statusBreakdown?.shortlisted || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start applying to jobs to see your applications here</p>
              <Button asChild>
                <a href="/jobs">Browse Jobs</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{application.jobs?.title}</h3>
                      <p className="text-muted-foreground">{application.jobs?.company_name}</p>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusText(application.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                    </div>
                    {application.jobs?.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{application.jobs.location}</span>
                      </div>
                    )}
                    {application.application_data?.expectedCTC && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Expected: ₹{application.application_data.expectedCTC} LPA</span>
                      </div>
                    )}
                  </div>

                  {application.application_data && (
                    <div className="space-y-2 text-sm">
                      {application.application_data.phoneNumber && (
                        <div>
                          <span className="font-medium">Phone:</span> {application.application_data.phoneNumber}
                        </div>
                      )}
                      {application.application_data.noticePeriod && (
                        <div>
                          <span className="font-medium">Notice Period:</span> {application.application_data.noticePeriod}
                        </div>
                      )}
                      {application.application_data.currentCTC && (
                        <div>
                          <span className="font-medium">Current CTC:</span> ₹{application.application_data.currentCTC} LPA
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {application.resume_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Resume
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/jobs/${application.job_id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Job
                      </a>
                    </Button>
                    {application.redirect_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.redirect_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Company Site
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApplications;