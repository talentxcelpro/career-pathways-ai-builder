
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, ArrowLeft, MapPin, Building2, Briefcase, 
  Mail, Phone, Download, ExternalLink, Calendar,
  FileText, Tag as TagIcon, Activity
} from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CandidateTagManager } from "@/components/employer/crm/CandidateTagManager";
import { CandidateNotesPanel } from "@/components/employer/crm/CandidateNotesPanel";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const CRMCandidateDetail = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch candidate details
  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate-detail', candidateId],
    queryFn: async () => {
      if (!candidateId) return null;

      const { data, error } = await supabase.functions.invoke('cv-search', {
        body: {
          searchTerm: '',
          filters: {},
          page: 1,
          limit: 1000
        }
      });

      if (error) throw error;
      
      const foundCandidate = data.candidates?.find((c: any) => c.id === candidateId);
      return foundCandidate || null;
    },
    enabled: !!candidateId
  });

  // Fetch candidate tags
  const { data: tags = [] } = useQuery({
    queryKey: ['candidate-tags', candidateId],
    queryFn: async () => {
      if (!user?.id || !candidateId) return [];
      
      const { data, error } = await supabase
        .from('candidate_tags')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('employer_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!candidateId
  });

  // Fetch communications history
  const { data: communications = [] } = useQuery({
    queryKey: ['candidate-communications', candidateId],
    queryFn: async () => {
      if (!user?.id || !candidate?.email) return [];
      
      const { data, error } = await supabase
        .from('candidate_communications')
        .select('*')
        .eq('sender_id', user.id)
        .eq('recipient_email', candidate.email)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!candidate?.email
  });

  const handleDownloadResume = async () => {
    if (!candidate?.resume_url) {
      toast.error('No resume available');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('bulk-download-cvs', {
        body: {
          candidateFiles: [{
            name: candidate.name,
            resumeUrl: candidate.resume_url
          }]
        }
      });

      if (error) throw error;

      if (data.files && data.files.length > 0) {
        const link = document.createElement('a');
        link.href = data.files[0].url;
        link.download = data.files[0].filename;
        link.click();
        toast.success('Resume download started');
      }
    } catch (error: any) {
      toast.error('Failed to download resume: ' + error.message);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'application' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate('/employer/crm/candidates')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Candidate Not Found</h1>
            <p className="text-muted-foreground">The candidate you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer/crm/candidates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <p className="text-muted-foreground">Complete candidate profile and interaction history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt={candidate.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                    <p className="text-muted-foreground">{candidate.email}</p>
                    <Badge className={getSourceBadgeColor(candidate.source)}>
                      {candidate.source === 'application' ? 'Applied to Job' : 'Platform CV'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {candidate.resume_url && (
                    <Button variant="outline" onClick={handleDownloadResume}>
                      <Download className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button variant="outline" asChild>
                    <a href={`mailto:${candidate.email}`}>
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.title && (
                <div className="flex items-center text-sm">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{candidate.title}</span>
                  {candidate.company && (
                    <>
                      <span className="mx-2 text-muted-foreground">at</span>
                      <Building2 className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{candidate.company}</span>
                    </>
                  )}
                </div>
              )}

              {candidate.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{candidate.location}</span>
                </div>
              )}

              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {candidate.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{candidate.description}</p>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag.id}
                        className="flex items-center gap-1"
                        style={{ backgroundColor: tag.tag_color + '20', color: tag.tag_color }}
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag.tag_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* STAR Interview & AI Verification Score */}
              {Boolean((candidate as any)?.star_score || (candidate as any)?.interview_score) && (
                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-purple-900 text-sm flex items-center gap-1.5">
                      🎙️ STAR Interview Evaluation & Readiness
                    </h4>
                    <Badge className="bg-purple-600 text-white">
                      {(candidate as any).star_score || (candidate as any).interview_score || 85}% Score
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    Candidate has completed structured STAR behavioral rehearsal & technical assessment verification.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <CandidateTagManager candidateId={candidateId!} existingTags={tags} />
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Application/Creation event */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">
                      {candidate.source === 'application' ? 'Applied to job' : 'Added to platform'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(candidate.applied_at || candidate.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Communications */}
                {communications.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Email sent: {comm.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(comm.created_at), { addSuffix: true })}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {comm.status}
                      </Badge>
                    </div>
                  </div>
                ))}

                {communications.length === 0 && candidate && (
                  <p className="text-sm text-muted-foreground">No communication history yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CandidateNotesPanel candidateId={candidateId!} />
        </div>
      </div>
    </div>
  );
};

export default CRMCandidateDetail;
