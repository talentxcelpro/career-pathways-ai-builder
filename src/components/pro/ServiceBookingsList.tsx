
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BookingRequest {
  id: string;
  service_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  service_title: string;
  project_description: string;
  budget_range?: string;
  preferred_start_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Profile data
  client_avatar?: string;
  client_location?: string;
}

export default function ServiceBookingsList() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Get all booking requests for services owned by the current user
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('service_booking_requests')
        .select(`
          *,
          services!inner(id, title, provider_id)
        `)
        .eq('services.provider_id', user?.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        setBookings([]);
        return;
      }

      // Get client profile information
      const clientIds = bookingsData.map(booking => booking.client_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, location')
        .in('id', clientIds);

      // Combine booking data with profile data
      const enrichedBookings: BookingRequest[] = bookingsData.map(booking => {
        const profile = profilesData?.find(p => p.id === booking.client_id);
        return {
          id: booking.id,
          service_id: booking.service_id,
          client_id: booking.client_id,
          client_name: profile?.full_name || booking.client_name || 'Unknown Client',
          client_email: booking.client_email,
          client_phone: booking.client_phone,
          service_title: booking.services.title,
          project_description: booking.project_description,
          budget_range: booking.budget_range,
          preferred_start_date: booking.preferred_start_date,
          status: booking.status,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          client_avatar: profile?.profile_picture_url,
          client_location: profile?.location
        };
      });

      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load booking requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_booking_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
          : booking
      ));

      toast({
        title: "Success",
        description: `Booking request ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading booking requests...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No booking requests yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            When clients book your services, their requests will appear here. 
            Make sure your services are active and visible to potential clients.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Client Booking Requests</h2>
        <Badge variant="outline">
          {bookings.filter(b => b.status === 'pending').length} pending
        </Badge>
      </div>

      {bookings.map((booking) => (
        <Card key={booking.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={booking.client_avatar || undefined} />
                  <AvatarFallback>
                    {booking.client_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{booking.client_name}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Interested in: <span className="font-medium">{booking.service_title}</span>
                  </p>
                  {booking.client_location && (
                    <p className="text-xs text-muted-foreground">📍 {booking.client_location}</p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(booking.created_at)}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Project Description */}
            <div>
              <h4 className="font-medium mb-2">Project Description:</h4>
              <p className="text-sm bg-muted p-3 rounded-md">{booking.project_description}</p>
            </div>

            {/* Project Details */}
            {(booking.budget_range || booking.preferred_start_date) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.budget_range && (
                  <div>
                    <h5 className="font-medium text-sm">Budget Range:</h5>
                    <p className="text-sm text-muted-foreground">{booking.budget_range}</p>
                  </div>
                )}
                {booking.preferred_start_date && (
                  <div>
                    <h5 className="font-medium text-sm">Preferred Start Date:</h5>
                    <p className="text-sm text-muted-foreground">{booking.preferred_start_date}</p>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Contact Information */}
            <div>
              <h4 className="font-medium mb-2">Contact Information:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${booking.client_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {booking.client_email}
                  </a>
                </div>
                {booking.client_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${booking.client_phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.client_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {booking.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => updateBookingStatus(booking.id, 'accepted')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateBookingStatus(booking.id, 'rejected')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button variant="outline" asChild>
                  <a href={`mailto:${booking.client_email}?subject=Re: ${booking.service_title} Service Request`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Client
                  </a>
                </Button>
              </div>
            )}

            {booking.status === 'accepted' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                >
                  Mark as Completed
                </Button>
                <Button variant="outline" asChild>
                  <a href={`mailto:${booking.client_email}?subject=Re: ${booking.service_title} Service Request`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Client
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
