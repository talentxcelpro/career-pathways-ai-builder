import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnhancedJobApplications } from '@/hooks/useEnhancedJobApplications';
import { Calendar, MapPin, Building, DollarSign, ExternalLink, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const MyApplicationsList = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const { data: applications, isLoading } = useEnhancedJobApplications(currentUser?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'applied': return 'Your application has been submitted successfully.';
      case 'reviewed': return 'Your application is being reviewed by the employer.';
      case 'shortlisted': return 'Congratulations! You have been shortlisted.';
      case 'interviewed': return 'You have completed the interview process.';
      case 'hired': return 'Congratulations! You have been selected for this position.';
      case 'rejected': return 'Unfortunately, your application was not successful this time.';
      default: return 'Application status unknown.';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
            <p className="mb-4">You haven't applied to any jobs yet.</p>
            <Button onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  {application.jobs?.title || 'Job Title Not Available'}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{application.jobs?.company_name || 'Company'}</span>
                  </div>
                  {application.jobs?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{application.jobs.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {getStatusMessage(application.status)}
            </p>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              {application.current_role && (
                <div>
                  <span className="font-medium">Current Role:</span>
                  <p className="text-muted-foreground">{application.current_role}</p>
                </div>
              )}
              {application.expected_ctc && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Expected: ₹{application.expected_ctc.toLocaleString()} LPA</span>
                </div>
              )}
              {application.notice_period && (
                <div>
                  <span className="font-medium">Notice Period:</span>
                  <p className="text-muted-foreground">{application.notice_period}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/jobs/${application.job_id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Job
              </Button>
              {application.resume_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(application.resume_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Resume
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyApplicationsList;