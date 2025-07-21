import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Shield, 
  CheckCircle, 
  MessageCircle,
  Calendar,
  User,
  Mail,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  delivery_time_days: number;
  provider_name: string;
  provider_avatar: string;
  average_rating: number;
  total_reviews: number;
  whats_included: string[];
  is_verified: boolean;
}

export default function ServiceBookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    budget: '',
    urgency: 'standard'
  });

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setService({
          ...data,
          provider_name: 'Professional Provider',
          provider_avatar: '',
          average_rating: data.average_rating || 4.5,
          total_reviews: data.total_reviews || 0,
          is_verified: true
        });
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: "Failed to load service details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a service.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get service provider ID
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('provider_id')
        .eq('id', id)
        .single();

      if (serviceError) throw serviceError;

      // Create booking request
      const { error: bookingError } = await supabase
        .from('service_booking_requests')
        .insert({
          service_id: id,
          client_id: user.id,
          provider_id: serviceData.provider_id,
          client_name: bookingForm.name,
          client_email: bookingForm.email,
          client_phone: bookingForm.phone,
          project_description: bookingForm.message,
          preferred_start_date: bookingForm.preferredDate || null,
          budget_range: bookingForm.budget,
          urgency: bookingForm.urgency
        });

      if (bookingError) throw bookingError;

      toast({
        title: "Booking Request Sent!",
        description: "The service provider will contact you within 24 hours.",
      });

      navigate('/services');
    } catch (error) {
      console.error('Error submitting booking request:', error);
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    return `${currencySymbols[currency] || currency}${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Service Not Found</h1>
        <Button onClick={() => navigate('/services')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/services')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Book Service</h1>
            <p className="text-muted-foreground">Complete your booking request</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Service Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Service Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Provider Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={service.provider_avatar} />
                    <AvatarFallback>{service.provider_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{service.provider_name}</h3>
                      {service.is_verified && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{service.average_rating}</span>
                      <span>({service.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Service Details */}
                <div>
                  <h4 className="font-semibold text-lg mb-2">{service.title}</h4>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  
                  {/* What's Included */}
                  {service.whats_included.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">What's Included:</h5>
                      <div className="space-y-1">
                        {service.whats_included.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatPrice(service.price, service.currency)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Delivered in {service.delivery_time_days} days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Information
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          placeholder="Your full name"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Your phone number"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Project Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Project Details
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredDate">Preferred Start Date</Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          value={bookingForm.preferredDate}
                          onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Budget Range</Label>
                        <Input
                          id="budget"
                          placeholder="e.g., ₹10,000 - ₹15,000"
                          value={bookingForm.budget}
                          onChange={(e) => setBookingForm({...bookingForm, budget: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Project Description *</Label>
                      <Textarea
                        id="message"
                        required
                        placeholder="Please describe your project requirements, goals, and any specific details the service provider should know..."
                        rows={4}
                        value={bookingForm.message}
                        onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Submit */}
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Next Steps:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• The service provider will review your request</li>
                        <li>• You'll receive a response within 24 hours</li>
                        <li>• Payment is handled directly with the provider</li>
                      </ul>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Request...
                        </>
                      ) : (
                        'Send Booking Request'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}