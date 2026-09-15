import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  GraduationCap, 
  Star, 
  Users, 
  MessageCircle, 
  Clock,
  MapPin,
  Building,
  Sparkles,
  Target,
  Calendar,
  UserPlus,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { useMentorMatching, type MentorMatch, type MentorshipRequest } from '@/hooks/useMentorMatching';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const MentorMatchingCard: React.FC = () => {
  const {
    mentorMatches,
    isLoadingMentors,
    mentorshipRequests,
    isLoadingRequests,
    requestMentorship,
    isRequestingMentorship,
    respondToMentorship,
    isRespondingToMentorship,
    currentUserProfile
  } = useMentorMatching();

  const [selectedMentor, setSelectedMentor] = useState<MentorMatch | null>(null);
  const [mentorshipMessage, setMentorshipMessage] = useState('');
  const [mentorshipGoals, setMentorshipGoals] = useState('');
  const [duration, setDuration] = useState('6');
  const [frequency, setFrequency] = useState('bi-weekly');
  const [activeTab, setActiveTab] = useState('discover');

  const handleRequestMentorship = () => {
    if (!selectedMentor) return;

    const goals = mentorshipGoals.split(',').map(g => g.trim()).filter(g => g);
    
    requestMentorship({
      mentorId: selectedMentor.id,
      message: mentorshipMessage,
      goals,
      durationMonths: parseInt(duration),
      meetingFrequency: frequency
    });
    
    setSelectedMentor(null);
    setMentorshipMessage('');
    setMentorshipGoals('');
  };

  const handleMentorshipResponse = (requestId: string, action: 'accept' | 'decline') => {
    respondToMentorship({
      requestId,
      action,
      response: `Mentorship request ${action}ed`
    });
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentUserProfile) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Complete your profile to find mentors</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          AI Mentor Matching
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Live Matching
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">Discover Mentors</TabsTrigger>
            <TabsTrigger value="requests">
              My Requests
              {mentorshipRequests.length > 0 && (
                <Badge className="ml-2 h-5 w-5 text-xs">{mentorshipRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentor">Mentor Others</TabsTrigger>
          </TabsList>

          <TabsContent value="discover">
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered mentor recommendations based on your career stage and goals
                </p>
                {isLoadingMentors && (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Finding perfect mentors...</span>
                  </div>
                )}
              </div>

              {mentorMatches.length > 0 ? (
                <div className="space-y-3">
                  {mentorMatches.slice(0, 5).map((mentor) => (
                    <div key={mentor.id} className="p-4 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={mentor.profile_picture_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {mentor.full_name?.split(' ').map(n => n[0]).join('') || 'M'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{mentor.full_name}</h4>
                            {mentor.title && (
                              <p className="text-xs text-muted-foreground mb-1">{mentor.title}</p>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              {mentor.company && (
                                <div className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  <span className="truncate max-w-24">{mentor.company}</span>
                                </div>
                              )}
                              {mentor.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-20">{mentor.location}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getAvailabilityColor(mentor.availability_status || 'available')}`}
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {mentor.availability_status || 'Available'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                {mentor.matchScore}% match
                              </Badge>
                              {mentor.mentor_rating && (
                                <Badge variant="outline" className="text-xs">
                                  ⭐ {mentor.mentor_rating?.toFixed(1)}
                                </Badge>
                              )}
                            </div>

                            {mentor.matchReasons.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {mentor.matchReasons.slice(0, 2).map((reason, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-accent/50">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedMentor(mentor)}
                              className="gap-1"
                            >
                              <UserPlus className="h-3 w-3" />
                              Request
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Request Mentorship
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                                <Avatar>
                                  <AvatarImage src={selectedMentor?.profile_picture_url} />
                                  <AvatarFallback>{selectedMentor?.full_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{selectedMentor?.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedMentor?.title}</p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="message">Message</Label>
                                  <Textarea
                                    id="message"
                                    placeholder="Introduce yourself and explain why you'd like this person as a mentor..."
                                    value={mentorshipMessage}
                                    onChange={(e) => setMentorshipMessage(e.target.value)}
                                    className="min-h-20"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="goals">Goals (comma separated)</Label>
                                  <Input
                                    id="goals"
                                    placeholder="e.g., Career transition, Leadership skills, Technical expertise"
                                    value={mentorshipGoals}
                                    onChange={(e) => setMentorshipGoals(e.target.value)}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Duration</Label>
                                    <Select value={duration} onValueChange={setDuration}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="3">3 months</SelectItem>
                                        <SelectItem value="6">6 months</SelectItem>
                                        <SelectItem value="12">12 months</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Meeting Frequency</Label>
                                    <Select value={frequency} onValueChange={setFrequency}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={handleRequestMentorship}
                                    disabled={!mentorshipMessage || isRequestingMentorship}
                                    className="flex-1"
                                  >
                                    {isRequestingMentorship && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                                    Send Request
                                  </Button>
                                  <Button variant="outline" onClick={() => setSelectedMentor(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoadingMentors ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Finding perfect mentors...</p>
                  <p className="text-sm text-muted-foreground">
                    Complete your career goals and interests in your profile for better matches
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => window.location.href = '/profile'}
                  >
                    Complete Profile
                  </Button>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-4">
              {isLoadingRequests ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
                </div>
              ) : mentorshipRequests.length > 0 ? (
                <div className="space-y-3">
                  {mentorshipRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={request.mentor_profile?.profile_picture_url || request.mentee_profile?.profile_picture_url} />
                            <AvatarFallback className="bg-primary/10">
                              {(request.mentor_profile?.full_name || request.mentee_profile?.full_name)?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm">
                                {request.mentor_profile?.full_name || request.mentee_profile?.full_name}
                              </p>
                              <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {request.mentor_profile?.title || request.mentee_profile?.title}
                            </p>
                            <p className="text-sm">{request.message}</p>
                            {request.goals && request.goals.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {request.goals.map((goal, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Target className="h-3 w-3 mr-1" />
                                    {goal}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {request.status === 'pending' && request.mentor_id === currentUserProfile?.id && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMentorshipResponse(request.id, 'accept')}
                              disabled={isRespondingToMentorship}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMentorshipResponse(request.id, 'decline')}
                              disabled={isRespondingToMentorship}
                              className="gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {request.duration_months && `${request.duration_months} months`}
                          {request.meeting_frequency && (
                            <>
                              <span>•</span>
                              <span>{request.meeting_frequency}</span>
                            </>
                          )}
                        </div>
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No mentorship requests yet</p>
                  <p className="text-sm text-muted-foreground">Start by requesting a mentor from the discovery tab</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mentor">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">Become a Mentor</p>
              <p className="text-sm text-muted-foreground mb-4">
                Share your expertise and help others grow in their careers
              </p>
              <Button variant="outline" size="sm">
                Set Up Mentor Profile
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};