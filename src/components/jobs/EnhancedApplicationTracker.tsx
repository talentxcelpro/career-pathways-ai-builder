import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Building,
  MapPin,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatSalaryRange } from '@/utils/currencyUtils';

interface ApplicationStatus {
  id: string;
  status: 'applied' | 'viewed' | 'interview' | 'rejected' | 'offered' | 'accepted';
  applied_at: string;
  updated_at: string;
  notes?: string;
  interview_date?: string;
  job: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    seo_slug: string;
    companies?: {
      name: string;
      logo_url: string;
    };
  };
  application_data?: any;
}

const statusConfig = {
  applied: {
    label: 'Applied',
    color: 'bg-blue-100 text-blue-800',
    icon: Send,
    description: 'Application submitted'
  },
  viewed: {
    label: 'Under Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Eye,
    description: 'Employer reviewing'
  },
  interview: {
    label: 'Interview',
    color: 'bg-purple-100 text-purple-800',
    icon: MessageSquare,
    description: 'Interview scheduled'
  },
  rejected: {
    label: 'Not Selected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Application declined'
  },
  offered: {
    label: 'Job Offer',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Offer received'
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle,
    description: 'Offer accepted'
  }
};

export const EnhancedApplicationTracker: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['user-applications', currentUser?.id, filterStatus],
    queryFn: async (): Promise<ApplicationStatus[]> => {
      if (!currentUser) return [];

      let query = supabase
        .from('job_applications')
        .select(`
          id,
          status,
          applied_at,
          updated_at,
          notes,
          interview_date,
          application_data,
          jobs (
            id,
            title,
            company_name,
            location,
            salary_min,
            salary_max,
            seo_slug,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', currentUser.id)
        .order('applied_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((app: any) => ({
        id: app.id,
        status: app.status,
        applied_at: app.applied_at,
        updated_at: app.updated_at,
        notes: app.notes,
        interview_date: app.interview_date,
        application_data: app.application_data,
        job: {
          id: app.jobs.id,
          title: app.jobs.title,
          company_name: app.jobs.company_name,
          location: app.jobs.location,
          salary_min: app.jobs.salary_min,
          salary_max: app.jobs.salary_max,
          seo_slug: app.jobs.seo_slug,
          companies: app.jobs.companies && Array.isArray(app.jobs.companies) && app.jobs.companies.length > 0 
            ? app.jobs.companies[0] 
            : app.jobs.companies
        }
      }));
    },
    enabled: !!currentUser
  });

  const { data: applicationStats } = useQuery({
    queryKey: ['application-stats', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;

      const { data, error } = await supabase
        .from('job_applications')
        .select('status')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const stats = data.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: data.length,
        applied: stats.applied || 0,
        viewed: stats.viewed || 0,
        interview: stats.interview || 0,
        offered: stats.offered || 0,
        accepted: stats.accepted || 0,
        rejected: stats.rejected || 0
      };
    },
    enabled: !!currentUser
  });

  const calculateProgress = () => {
    if (!applicationStats || applicationStats.total === 0) return 0;
    const positiveOutcomes = (applicationStats.interview + applicationStats.offered + applicationStats.accepted);
    return Math.round((positiveOutcomes / applicationStats.total) * 100);
  };

  const getTimelineSteps = (status: string) => {
    const steps = ['applied', 'viewed', 'interview', 'offered', 'accepted'];
    const currentIndex = steps.indexOf(status);
    
    if (status === 'rejected') {
      return steps.slice(0, 2); // Show only applied and viewed for rejected
    }
    
    return steps.slice(0, currentIndex + 1);
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <div className="text-gray-500">Login to track your job applications</div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Stats Overview */}
      {applicationStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Application Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{applicationStats.total}</div>
                <div className="text-xs text-gray-500">Total Applied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{applicationStats.viewed}</div>
                <div className="text-xs text-gray-500">Under Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{applicationStats.interview}</div>
                <div className="text-xs text-gray-500">Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{applicationStats.offered}</div>
                <div className="text-xs text-gray-500">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{applicationStats.accepted}</div>
                <div className="text-xs text-gray-500">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{applicationStats.rejected}</div>
                <div className="text-xs text-gray-500">Declined</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
              <p className="text-xs text-gray-500">
                {applicationStats.interview + applicationStats.offered + applicationStats.accepted} positive outcomes out of {applicationStats.total} applications
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <div className="flex flex-wrap gap-2">
            {['all', 'applied', 'viewed', 'interview', 'offered', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig]?.label || status}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-gray-500">
                {filterStatus === 'all' 
                  ? "You haven't applied to any jobs yet"
                  : `No applications with status: ${filterStatus}`
                }
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const config = statusConfig[application.status];
                const StatusIcon = config.icon;
                
                return (
                  <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={application.job.companies?.logo_url} 
                          alt={application.job.companies?.name || application.job.company_name} 
                        />
                        <AvatarFallback>
                          {(application.job.companies?.name || application.job.company_name || 'C').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg truncate">
                              {application.job.title}
                            </h3>
                            <p className="text-gray-600 font-medium">
                              {application.job.companies?.name || application.job.company_name}
                            </p>
                          </div>
                          <Badge className={config.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied {formatDistanceToNow(new Date(application.applied_at))} ago</span>
                          </div>
                          {(application.job.salary_min || application.job.salary_max) && (
                            <div className="flex items-center gap-1">
                              <span>₹{formatSalaryRange(application.job.salary_min, application.job.salary_max, true)}</span>
                            </div>
                          )}
                        </div>

                        {/* Timeline Progress */}
                        <div className="flex items-center gap-2 mb-3">
                          {getTimelineSteps(application.status).map((step, index, array) => (
                            <React.Fragment key={step}>
                              <div className={`flex items-center gap-1 text-xs ${
                                step === application.status ? 'text-blue-600 font-medium' : 'text-gray-400'
                              }`}>
                                {React.createElement(statusConfig[step as keyof typeof statusConfig].icon, { 
                                  className: 'h-3 w-3' 
                                })}
                                <span>{statusConfig[step as keyof typeof statusConfig].label}</span>
                              </div>
                              {index < array.length - 1 && (
                                <div className="h-px bg-gray-200 flex-1 min-w-4"></div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Special status information */}
                        {application.interview_date && (
                          <div className="bg-purple-50 border border-purple-200 rounded p-2 mb-2">
                            <div className="flex items-center gap-1 text-sm text-purple-800">
                              <Calendar className="h-4 w-4" />
                              <span>Interview scheduled for {new Date(application.interview_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        {application.notes && (
                          <div className="bg-gray-50 rounded p-2 mb-2">
                            <p className="text-sm text-gray-700">{application.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/jobs/${application.job.seo_slug}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Job
                          </Button>
                          
                          {application.status === 'interview' && (
                            <Button variant="outline" size="sm">
                              <Phone className="h-3 w-3 mr-1" />
                              Join Interview
                            </Button>
                          )}
                          
                          {application.status === 'offered' && (
                            <Button size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Review Offer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};