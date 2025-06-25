
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Star, 
  Download,
  MessageSquare,
  ExternalLink,
  Briefcase
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ApplicantDetail = () => {
  const { jobId, userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');

  const { data: application, isLoading } = useQuery({
    queryKey: ['job-application', jobId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          profiles!user_id(
            full_name,
            email,
            phone,
            profile_picture_url,
            title,
            location,
            experience_years,
            skills,
            about,
            linkedin_url,
            github_url,
            portfolio_url,
            current_company
          ),
          jobs!job_id(
            title,
            companies(name)
          )
        `)
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: candidateNotes } = useQuery({
    queryKey: ['candidate-notes', jobId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_notes')
        .select(`
          *,
          profiles!author_id(full_name)
        `)
        .eq('job_id', jobId)
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status,
          last_activity_at: new Date().toISOString()
        })
        .eq('job_id', jobId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Application status updated');
      queryClient.invalidateQueries({ queryKey: ['job-application', jobId, userId] });
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('candidate_notes')
        .insert({
          job_id: jobId,
          candidate_id: userId,
          author_id: user.user.id,
          content: notes,
          rating: rating ? parseInt(rating) : null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note added successfully');
      setNotes('');
      setRating('');
      queryClient.invalidateQueries({ queryKey: ['candidate-notes', jobId, userId] });
    },
    onError: () => {
      toast.error('Failed to add note');
    }
  });

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    updateStatusMutation.mutate(status);
  };

  const handleAddNote = () => {
    if (!notes.trim()) {
      toast.error('Please enter a note');
      return;
    }
    addNoteMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'applied': { color: 'bg-blue-100 text-blue-800', label: 'Applied' },
      'reviewing': { color: 'bg-yellow-100 text-yellow-800', label: 'Reviewing' },
      'shortlisted': { color: 'bg-purple-100 text-purple-800', label: 'Shortlisted' },
      'interview_scheduled': { color: 'bg-orange-100 text-orange-800', label: 'Interview Scheduled' },
      'interviewed': { color: 'bg-indigo-100 text-indigo-800', label: 'Interviewed' },
      'offered': { color: 'bg-green-100 text-green-800', label: 'Offered' },
      'hired': { color: 'bg-emerald-100 text-emerald-800', label: 'Hired' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Application not found</h1>
        <Button onClick={() => navigate(`/jobs/manage/${jobId}/applicants`)}>
          Back to Applicants
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/jobs/manage/${jobId}/applicants`)}
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
            >
              ← Back to Applicants
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {application.profiles?.full_name || 'Unknown Candidate'}
          </h1>
          <p className="text-gray-600 mt-1">
            Applied for {application.jobs?.title} at {application.jobs?.companies?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/jobs/manage/${jobId}/applicants/${userId}/interview`)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  {application.profiles?.profile_picture_url ? (
                    <img 
                      src={application.profiles.profile_picture_url} 
                      alt={application.profiles.full_name || 'Profile'}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{application.profiles?.full_name || 'Unknown'}</h3>
                  <p className="text-gray-600">{application.profiles?.title || 'No title specified'}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                    {application.profiles?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${application.profiles.email}`} className="hover:text-blue-600">
                          {application.profiles.email}
                        </a>
                      </div>
                    )}
                    {application.profiles?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${application.profiles.phone}`} className="hover:text-blue-600">
                          {application.profiles.phone}
                        </a>
                      </div>
                    )}
                    {application.profiles?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.profiles.location}
                      </div>
                    )}
                    {application.profiles?.current_company && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {application.profiles.current_company}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    {application.profiles?.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.profiles.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {application.profiles?.github_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.profiles.github_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {application.profiles?.portfolio_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.profiles.portfolio_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Portfolio
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {application.profiles?.about && (
                <div>
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-gray-600">{application.profiles.about}</p>
                </div>
              )}

              {application.profiles?.skills && application.profiles.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.profiles.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-700">
                  {application.cover_letter}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note Form */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a note about this candidate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center gap-3">
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Rating (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                      <SelectItem value="2">⭐⭐ Below Average</SelectItem>
                      <SelectItem value="1">⭐ Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Existing Notes */}
              {candidateNotes && candidateNotes.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-medium">Previous Notes</h4>
                  {candidateNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{note.profiles?.full_name || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          {note.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{note.rating}/5</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Status:</span>
                {getStatusBadge(newStatus || application.status)}
              </div>
              
              <Select 
                value={newStatus || application.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 space-y-1">
                <div>Applied: {formatDate(application.applied_at)}</div>
                <div>Experience: {application.profiles?.experience_years || 0} years</div>
                {application.ai_match_score && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    AI Match: {Math.round(application.ai_match_score * 100)}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          {application.resume_url && (
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(application.resume_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add to Shortlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
