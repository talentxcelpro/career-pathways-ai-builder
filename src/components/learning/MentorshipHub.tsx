import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, MessageCircle, Clock, Star, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MentorshipRequest {
  id: string;
  mentee_id: string;
  mentor_id: string;
  request_message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  area_of_interest: string;
  duration_weeks: number;
  created_at: string;
  updated_at: string;
  mentee_profile?: {
    full_name: string;
    title: string;
    profile_picture_url: string;
  };
  mentor_profile?: {
    full_name: string;
    title: string;
    profile_picture_url: string;
  };
}

interface MentorProfile {
  id: string;
  full_name: string;
  title: string;
  about: string;
  skills: string[];
  experience_years: number;
  profile_picture_url: string;
  industry: string;
  is_available_for_mentoring?: boolean;
}

export const MentorshipHub: React.FC = () => {
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [availableMentors, setAvailableMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const [requestData, setRequestData] = useState({
    message: '',
    area_of_interest: '',
    duration_weeks: 12
  });

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const fetchMentorshipData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch mentorship requests (both sent and received)
      const { data: requests } = await supabase
        .from('mentorship_requests')
        .select(`
          *,
          mentee_profile:profiles!mentorship_requests_mentee_id_fkey (
            full_name,
            title,
            profile_picture_url
          ),
          mentor_profile:profiles!mentorship_requests_mentor_id_fkey (
            full_name,
            title,
            profile_picture_url
          )
        `)
        .or(`mentee_id.eq.${user.id},mentor_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (requests) {
        setMentorshipRequests(requests);
      }

      // Fetch available mentors (experienced profiles)
      const { data: mentors } = await supabase
        .from('profiles')
        .select('*')
        .gte('experience_years', 3)
        .neq('id', user.id)
        .not('title', 'is', null)
        .limit(20);

      if (mentors) {
        setAvailableMentors(mentors);
      }

    } catch (error) {
      console.error('Error fetching mentorship data:', error);
      toast.error("Failed to load mentorship data");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedMentor) return;

      if (!requestData.message.trim() || !requestData.area_of_interest.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      const { error } = await supabase
        .from('mentorship_requests')
        .insert({
          mentee_id: user.id,
          mentor_id: selectedMentor.id,
          request_message: requestData.message,
          area_of_interest: requestData.area_of_interest,
          duration_weeks: requestData.duration_weeks
        });

      if (error) {
        console.error('Request error:', error);
        toast.error("Failed to send mentorship request");
        return;
      }

      toast.success("Mentorship request sent successfully!");
      setShowRequestDialog(false);
      setSelectedMentor(null);
      setRequestData({
        message: '',
        area_of_interest: '',
        duration_weeks: 12
      });
      fetchMentorshipData();
    } catch (error) {
      console.error('Request error:', error);
      toast.error("An error occurred while sending the request");
    }
  };

  const handleUpdateRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) {
        console.error('Update error:', error);
        toast.error("Failed to update request");
        return;
      }

      toast.success(`Request ${status} successfully`);
      fetchMentorshipData();
    } catch (error) {
      console.error('Update error:', error);
      toast.error("An error occurred while updating the request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMentors = availableMentors.filter(mentor =>
    mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded mb-4" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Mentorship Hub</h2>
        <p className="text-muted-foreground">Connect with experienced professionals for guidance</p>
      </div>

      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors by name, title, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {mentor.profile_picture_url ? (
                        <img 
                          src={mentor.profile_picture_url} 
                          alt={mentor.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserCheck className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mentor.full_name}</CardTitle>
                      <CardDescription>{mentor.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {mentor.about && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {mentor.about}
                    </p>
                  )}

                  <div className="space-y-2">
                    {mentor.industry && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium">Industry:</span>
                        <Badge variant="outline" className="ml-2">{mentor.industry}</Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm">
                      <span className="font-medium">Experience:</span>
                      <span className="ml-2">{mentor.experience_years}+ years</span>
                    </div>
                  </div>

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {mentor.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{mentor.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setShowRequestDialog(true);
                    }}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Request Mentorship
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Mentors Found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search criteria or check back later for new mentors
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="space-y-4">
            {mentorshipRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {request.mentee_profile?.full_name || request.mentor_profile?.full_name}
                        </CardTitle>
                        <CardDescription>
                          {request.mentee_profile?.title || request.mentor_profile?.title}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Area of Interest:</span>
                      <p className="text-muted-foreground">{request.area_of_interest}</p>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-muted-foreground">{request.duration_weeks} weeks</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">Message:</span>
                    <p className="text-muted-foreground mt-1">{request.request_message}</p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Requested {new Date(request.created_at).toLocaleDateString()}
                  </div>

                  {request.status === 'pending' && request.mentor_profile && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRequest(request.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRequest(request.id, 'rejected')}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {mentorshipRequests.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Mentorship Requests</h3>
                  <p className="text-muted-foreground text-center">
                    Start by requesting mentorship from experienced professionals
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a mentorship request to {selectedMentor?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Area of Interest *</label>
              <Input
                value={requestData.area_of_interest}
                onChange={(e) => setRequestData(prev => ({ ...prev, area_of_interest: e.target.value }))}
                placeholder="e.g., Career Development, Technical Skills"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Duration</label>
              <Select
                value={requestData.duration_weeks.toString()}
                onValueChange={(value) => setRequestData(prev => ({ ...prev, duration_weeks: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                  <SelectItem value="24">24 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                value={requestData.message}
                onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Introduce yourself and explain why you'd like this person as a mentor"
                rows={4}
              />
            </div>
            
            <Button onClick={handleSendRequest} className="w-full">
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};