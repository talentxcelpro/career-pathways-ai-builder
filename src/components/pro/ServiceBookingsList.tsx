import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface BookingRequest {
  id: string;
  service_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  project_description: string;
  preferred_start_date: string;
  budget_range: string;
  urgency: string;
  status: string;
  provider_response: string;
  created_at: string;
  service_title?: string;
}

interface ServiceBookingsListProps {
  serviceId?: string;
}

export default function ServiceBookingsList({ serviceId }: ServiceBookingsListProps) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, serviceId]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('service_booking_requests')
        .select(`
          *,
          services(title)
        `)
        .eq('provider_id', user?.id)
        .order('created_at', { ascending: false });

      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedBookings = data?.map(booking => ({
        ...booking,
        service_title: booking.services?.title
      })) || [];

      setBookings(transformedBookings);
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

  const handleStatusUpdate = async (bookingId: string, status: string, providerResponse?: string) => {
    setResponding(true);
    try {
      const { error } = await supabase
        .from('service_booking_requests')
        .update({
          status,
          provider_response: providerResponse || null,
          responded_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      setSelectedBooking(null);
      setResponse('');

      toast({
        title: "Success",
        description: `Booking request ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'default' as const, icon: AlertCircle },
      accepted: { label: 'Accepted', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelled', variant: 'secondary' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Booking Requests</h3>
          <p className="text-muted-foreground text-center">
            When clients book your services, their requests will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Booking Requests</h2>
          <p className="text-muted-foreground">
            Manage and respond to client booking requests
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {bookings.filter(b => b.status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {booking.service_title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(booking.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {booking.urgency}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Client Information */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Information
                  </h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{booking.client_name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{booking.client_name}</p>
                        <p className="text-sm text-muted-foreground">Client</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${booking.client_email}`}
                        className="text-primary hover:underline"
                      >
                        {booking.client_email}
                      </a>
                    </div>
                    
                    {booking.client_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`tel:${booking.client_phone}`}
                          className="text-primary hover:underline"
                        >
                          {booking.client_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Project Requirements
                  </h4>
                  
                  <div className="bg-background border rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{booking.project_description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {booking.preferred_start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Preferred Start: {new Date(booking.preferred_start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {booking.budget_range && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Budget: {booking.budget_range}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Provider Response */}
                {booking.provider_response && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Your Response</h4>
                    <p className="text-sm">{booking.provider_response}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {booking.status === 'pending' && (
                  <div className="flex flex-col gap-4 pt-4 border-t">
                    {selectedBooking === booking.id ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Write your response to the client..."
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStatusUpdate(booking.id, 'accepted', response)}
                            disabled={responding}
                            className="flex-1"
                          >
                            Accept Request
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, 'rejected', response)}
                            disabled={responding}
                            className="flex-1"
                          >
                            Decline Request
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedBooking(null);
                              setResponse('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedBooking(booking.id)}
                          className="flex-1"
                        >
                          Respond to Request
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                          className="flex-1"
                        >
                          Quick Decline
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}