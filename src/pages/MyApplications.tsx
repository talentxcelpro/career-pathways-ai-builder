import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, MapPin, Building2, Clock, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
    external_url: string;
  } | null;
}

export const MyApplications: React.FC = () => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['my_job_applications'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      // Get job details for each application
      const applicationsWithJobs = await Promise.all(
        (data || []).map(async (app) => {
          const { data: job } = await supabase
            .from('jobs')
            .select('id, title, company_name, location, employment_type, external_url')
            .eq('id', app.job_id)
            .single();
          
          return { ...app, jobs: job };
        })
      );

      return applicationsWithJobs;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Job Applications</h1>
          <p className="text-gray-600 mt-2">Track the status of all your job applications</p>
        </div>

        {!applications || applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <FileText className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">You haven't applied to any jobs yet. Start exploring opportunities!</p>
              <Link to="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {application.jobs?.company_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {application.jobs?.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {application.jobs?.company_name}
                            </span>
                            {application.jobs?.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {application.jobs.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.jobs?.employment_type && (
                          <Badge variant="outline">{application.jobs.employment_type}</Badge>
                        )}
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Applied: {format(new Date(application.applied_at), 'MMM dd, yyyy')}
                        </span>
                        {application.updated_at !== application.applied_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Updated: {format(new Date(application.updated_at), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {application.jobs?.external_url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={application.jobs.external_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Job
                          </a>
                        </Button>
                      ) : (
                        <Link to={`/jobs/${application.jobs?.id}`}>
                          <Button variant="outline" size="sm">
                            View Job
                          </Button>
                        </Link>
                      )}
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

export default MyApplications;