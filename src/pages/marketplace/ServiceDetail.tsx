
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Clock, CheckCircle, ExternalLink, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types/service";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchServiceDetail(id);
    }
  }, [id]);

  const fetchServiceDetail = async (serviceId: string) => {
    try {
      setLoading(true);
      
      // First get the service
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();

      if (serviceError) {
        console.error('Service query error:', serviceError);
        throw new Error('Service not found');
      }

      if (!serviceData) {
        throw new Error('Service not found');
      }

      // Then get the provider profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, location, verification_status')
        .eq('id', serviceData.provider_id)
        .single();

      // Combine service and profile data
      const enrichedService: Service = {
        ...serviceData,
        provider_name: profileData?.full_name || 'Unknown Provider',
        provider_avatar: profileData?.profile_picture_url || null,
        provider_location: profileData?.location || serviceData.location,
        is_verified: profileData?.verification_status === 'verified'
      };

      setService(enrichedService);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: "Service not found or has been removed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this service",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    navigate(`/services/book/${id}`);
  };

  const handleViewProfile = () => {
    if (service?.provider_id) {
      navigate(`/profile/${service.provider_id}`);
    }
  };

  const handleContactProvider = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the provider",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    // For now, just show contact info
    toast({
      title: "Contact Information",
      description: `Contact ${service?.provider_name} through the booking form or their profile`,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-2">Service Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The service you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/services')}>
              Browse All Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  {service.professional_title && (
                    <p className="text-lg text-muted-foreground mb-2">{service.professional_title}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {service.provider_location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{service.provider_location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.delivery_time_days} days delivery</span>
                    </div>
                  </div>
                </div>
                {service.is_featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{service.average_rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({service.total_reviews} reviews)
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {service.total_orders} orders completed
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{service.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {service.whats_included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Requirements */}
          {service.client_requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{service.client_requirements}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={service.provider_avatar || undefined} />
                  <AvatarFallback>
                    {service.provider_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{service.provider_name}</h3>
                    {service.is_verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {service.years_experience && (
                    <p className="text-sm text-muted-foreground">
                      {service.years_experience} experience
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewProfile}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContactProvider}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Provider
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Order */}
          <Card>
            <CardHeader>
              <CardTitle>Order This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold">
                  ₹{service.price.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {service.delivery_time_days} days delivery
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>Payment Methods:</strong>
                  <div className="mt-1">
                    {service.payment_methods.length > 0 
                      ? service.payment_methods.join(', ')
                      : 'Contact provider for payment details'
                    }
                  </div>
                </div>
                
                <div className="text-sm">
                  <strong>Contact Options:</strong>
                  <div className="mt-1 space-y-1">
                    {service.contact_email && (
                      <div>✓ Email available</div>
                    )}
                    {service.contact_phone && service.phone_number && (
                      <div>✓ Phone: {service.phone_number}</div>
                    )}
                    {service.contact_website && service.website_url && (
                      <div>✓ Website: {service.website_url}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBookService}
              >
                Book Now
              </Button>
              
              <div className="text-xs text-muted-foreground text-center mt-3">
                Payment handled directly between buyer and seller
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
