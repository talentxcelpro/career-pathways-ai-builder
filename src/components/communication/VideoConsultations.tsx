import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, User, MapPin, DollarSign } from "lucide-react";
import { useCommunication } from "@/hooks/useCommunication";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays } from "date-fns";

const VideoConsultations = () => {
  const { user } = useAuth();
  const { videoConsultations, consultationAvailability, bookConsultation, isLoading } = useCommunication();
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    title: '',
    description: '',
    duration: 30,
    scheduledAt: '',
    consultationType: 'career-guidance'
  });

  const mockExperts = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      speciality: 'Career Strategy',
      rating: 4.9,
      hourlyRate: 150,
      avatar: '/placeholder-avatar.png',
      location: 'New York, USA',
      nextAvailable: new Date()
    },
    {
      id: '2', 
      name: 'Michael Chen',
      speciality: 'Tech Leadership',
      rating: 4.8,
      hourlyRate: 200,
      avatar: '/placeholder-avatar.png',
      location: 'San Francisco, USA',
      nextAvailable: addDays(new Date(), 1)
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      speciality: 'Interview Coaching',
      rating: 4.9,
      hourlyRate: 120,
      avatar: '/placeholder-avatar.png',
      location: 'London, UK',
      nextAvailable: addDays(new Date(), 2)
    }
  ];

  const handleBookConsultation = async () => {
    if (!selectedExpert || !bookingForm.title || !bookingForm.scheduledAt) return;

    try {
      await bookConsultation({
        expertId: selectedExpert,
        ...bookingForm,
        scheduledAt: new Date(bookingForm.scheduledAt)
      });
      setBookingForm({
        title: '',
        description: '',
        duration: 30,
        scheduledAt: '',
        consultationType: 'career-guidance'
      });
      setSelectedExpert(null);
    } catch (error) {
      console.error('Failed to book consultation:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Available Experts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockExperts.map((expert) => (
          <Card 
            key={expert.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedExpert === expert.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedExpert(expert.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={expert.avatar} />
                  <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{expert.name}</h3>
                  <p className="text-sm text-muted-foreground">{expert.speciality}</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  ⭐ {expert.rating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {expert.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                ${expert.hourlyRate}/hour
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Next available: {format(expert.nextAvailable, 'MMM dd, yyyy')}
              </div>
              <Button 
                className="w-full"
                variant={selectedExpert === expert.id ? "default" : "outline"}
              >
                <Video className="h-4 w-4 mr-2" />
                {selectedExpert === expert.id ? 'Selected' : 'Select Expert'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Form */}
      {selectedExpert && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book Video Consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Consultation Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Career Strategy Discussion"
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({...bookingForm, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Consultation Type</Label>
                <Select 
                  value={bookingForm.consultationType} 
                  onValueChange={(value) => setBookingForm({...bookingForm, consultationType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career-guidance">Career Guidance</SelectItem>
                    <SelectItem value="interview-prep">Interview Preparation</SelectItem>
                    <SelectItem value="resume-review">Resume Review</SelectItem>
                    <SelectItem value="salary-negotiation">Salary Negotiation</SelectItem>
                    <SelectItem value="leadership-coaching">Leadership Coaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="datetime">Date & Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={bookingForm.scheduledAt}
                  onChange={(e) => setBookingForm({...bookingForm, scheduledAt: e.target.value})}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select 
                  value={bookingForm.duration.toString()} 
                  onValueChange={(value) => setBookingForm({...bookingForm, duration: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you'd like to discuss in this consultation..."
                value={bookingForm.description}
                onChange={(e) => setBookingForm({...bookingForm, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleBookConsultation}
                disabled={!bookingForm.title || !bookingForm.scheduledAt || isLoading}
                className="flex-1"
              >
                <Video className="h-4 w-4 mr-2" />
                Book Consultation
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedExpert(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Consultations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading consultations...
            </div>
          ) : videoConsultations && videoConsultations.length > 0 ? (
            <div className="space-y-4">
              {videoConsultations.map((consultation) => (
                <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-avatar.png" />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{consultation.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(consultation.scheduled_at), 'PPp')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={consultation.status === 'scheduled' ? 'default' : 'secondary'}>
                      {consultation.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming consultations scheduled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoConsultations;