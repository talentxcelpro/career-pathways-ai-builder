
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Star,
  Eye,
  FileText,
  ExternalLink,
  MessageCircle,
  User
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ApplicantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ['jobApplication', id],
    queryFn: async () => {
      if (!id) throw new Error('Application ID is required');

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            company_id,
            companies (
              name,
              logo_url
            )
          ),
          profiles (
            id,
            full_name,
            email,
            phone,
            location,
            title,
            about,
            skills,
            experience_years,
            profile_picture_url,
            linkedin_url,
            github_url,
            portfolio_url,
            resume_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplication', id] });
      toast.success('Application status updated');
    },
    onError: () => {
      toast.error('Failed to update application status');
    }
  });

  const handleStatusChange = (status: string) => {
    updateApplicationMutation.mutate({ status });
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Candidate';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Candidate') return 'C';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
              <p className="text-gray-600">This application may have been deleted.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/jobs/manage" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(application.status)}>
              {application.status}
            </Badge>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('reviewing')}
                disabled={updateApplicationMutation.isPending}
              >
                Mark as Reviewing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('interview')}
                disabled={updateApplicationMutation.isPending}
              >
                Schedule Interview
              </Button>
              <Button
                size="sm"
                onClick={() => handleStatusChange('offered')}
                disabled={updateApplicationMutation.isPending}
              >
                Make Offer
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Link to={`/network/people/${application.profiles?.id}`} className="block mb-4 hover:scale-105 transition-transform">
                    <Avatar className="w-24 h-24 cursor-pointer">
                      <AvatarImage src={application.profiles?.profile_picture_url} />
                      <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {generateInitials(application.profiles)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <Link 
                    to={`/network/people/${application.profiles?.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer">
                      {formatDisplayName(application.profiles)}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 mb-2">
                    {application.profiles?.title || 'Professional'}
                  </p>
                  
                  {application.profiles?.location && (
                    <p className="text-sm text-gray-500 mb-4 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {application.profiles.location}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {application.profiles?.experience_years || 0} years exp.
                    </div>
                    {application.ai_match_score && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {Math.round(application.ai_match_score)}% match
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 w-full">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Link to={`/network/messages/${application.profiles?.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.profiles?.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{application.profiles.email}</span>
                  </div>
                )}
                {application.profiles?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{application.profiles.phone}</span>
                  </div>
                )}
                {application.profiles?.linkedin_url && (
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <a 
                      href={application.profiles.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {application.profiles?.portfolio_url && (
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <a 
                      href={application.profiles.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Portfolio
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            {application.profiles?.skills && application.profiles.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {application.profiles.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Application for {application.jobs?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  {application.jobs?.companies?.logo_url && (
                    <img 
                      src={application.jobs.companies.logo_url} 
                      alt={application.jobs.companies.name}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{application.jobs?.companies?.name}</h3>
                    <p className="text-sm text-gray-600">Applied on {new Date(application.applied_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {application.cover_letter && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Cover Letter</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Resume
                  </span>
                  {(application.resume_url || application.profiles?.resume_url) && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(application.resume_url || application.profiles?.resume_url) ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">Resume.pdf</p>
                          <p className="text-sm text-gray-600">
                            Click to view or download the candidate's resume
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Inline PDF viewer would go here */}
                    <div className="border rounded-lg h-96 bg-white flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">PDF viewer will load here</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Click "View" or "Download" above to access the resume
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No resume uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Section */}
            {application.profiles?.about && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.profiles.about}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
