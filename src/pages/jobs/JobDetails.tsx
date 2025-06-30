
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Users, 
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Briefcase,
  Calendar,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatSalaryRange } from '@/utils/currencyUtils';
import { toast } from 'sonner';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Get current user (optional)
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch job details (no authentication required)
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) throw new Error('Job ID is required');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            description,
            website,
            company_size,
            founded_year
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Check if job is saved (only if user is logged in)
  const { data: savedJobData } = useQuery({
    queryKey: ['saved_job', id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !id) return null;
      
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('job_id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!currentUser && !!id,
  });

  useEffect(() => {
    setIsSaved(!!savedJobData);
  }, [savedJobData]);

  // Increment view count
  useEffect(() => {
    if (job?.id) {
      const incrementViewCount = async () => {
        await supabase.rpc('increment_job_views', { job_id: job.id });
      };
      incrementViewCount();
    }
  }, [job?.id]);

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Please login to save jobs');
      navigate('/auth/login');
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('job_id', id);
        
        setIsSaved(false);
        toast.success('Job removed from saved');
      } else {
        await supabase
          .from('saved_jobs')
          .insert({ user_id: currentUser.id, job_id: id });
        
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job at ${job?.companies?.name}: ${job?.title}`,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Job link copied to clipboard!');
    }
  };

  const handleApply = () => {
    if (!currentUser) {
      // Redirect to login with return URL
      navigate(`/auth/login?returnUrl=/jobs/${id}/apply`);
      return;
    }
    navigate(`/jobs/${id}/apply`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {job.companies?.logo_url && (
                <Avatar className="h-16 w-16 flex-shrink-0">
                  <AvatarImage src={job.companies.logo_url} alt={job.companies.name} />
                  <AvatarFallback className="text-lg">
                    {job.companies.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {job.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {job.is_remote && (
                    <Badge className="bg-green-100 text-green-800">
                      Remote
                    </Badge>
                  )}
                  {job.is_urgent && (
                    <Badge className="bg-red-100 text-red-800">
                      Urgent
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                
                {job.companies && (
                  <div className="flex items-center text-lg text-gray-600 mb-4">
                    <Building2 className="h-5 w-5 mr-2" />
                    <span className="font-medium">{job.companies.name}</span>
                    {job.companies.industry && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{job.companies.industry}</span>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{job.views_count || 0} views</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave}
                className={isSaved ? 'text-red-500 border-red-200' : ''}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                onClick={handleApply}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {job.requirements.split('\n').map((requirement, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {requirement}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills Required */}
            {job.skills_required && job.skills_required.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Apply */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Apply?</h3>
                <p className="text-gray-600 mb-4">
                  Take the next step in your career journey
                </p>
                <Button 
                  onClick={handleApply}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Apply for this Position
                </Button>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.employment_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employment Type:</span>
                    <Badge variant="outline">{job.employment_type}</Badge>
                  </div>
                )}
                {job.experience_level && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Level:</span>
                    <Badge variant="outline">{job.experience_level}</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications:</span>
                  <span className="font-medium">{job.applications_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.companies && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.companies.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.companies.description && (
                    <p className="text-gray-700">{job.companies.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {job.companies.industry && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">{job.companies.industry}</span>
                      </div>
                    )}
                    {job.companies.company_size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company Size:</span>
                        <span className="font-medium">{job.companies.company_size}</span>
                      </div>
                    )}
                    {job.companies.founded_year && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Founded:</span>
                        <span className="font-medium">{job.companies.founded_year}</span>
                      </div>
                    )}
                  </div>

                  {job.companies.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={job.companies.website} target="_blank" rel="noopener noreferrer">
                        Visit Company Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
