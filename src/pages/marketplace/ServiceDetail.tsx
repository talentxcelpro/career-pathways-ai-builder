
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Mail, 
  Phone, 
  Globe,
  Check,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCompactCurrency } from "@/utils/currencyUtils";
import ServiceReviews from "@/components/marketplace/ServiceReviews";

interface Service {
  id: string;
  title: string;
  description: string;
  professional_title: string;
  years_experience: string;
  location: string;
  price: number;
  currency: string;
  delivery_time_days: number;
  whats_included: string[];
  client_requirements: string;
  payment_methods: string[];
  contact_email: boolean;
  contact_phone: boolean;
  contact_website: boolean;
  website_url?: string;
  phone_number?: string;
  tags: string[];
  average_rating: number;
  total_reviews: number;
  total_orders: number;
  is_featured: boolean;
  provider_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:provider_id(full_name, avatar_url, email)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Error",
        description: "Service not found",
        variant: "destructive",
      });
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (method: 'email' | 'phone' | 'website') => {
    if (!service) return;

    switch (method) {
      case 'email':
        if (service.profiles?.email) {
          window.location.href = `mailto:${service.profiles.email}?subject=Inquiry about ${service.title}`;
        }
        break;
      case 'phone':
        if (service.phone_number) {
          window.location.href = `tel:${service.phone_number}`;
        }
        break;
      case 'website':
        if (service.website_url) {
          window.open(service.website_url, '_blank');
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">Service not found</p>
            <Button onClick={() => navigate('/services')}>
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/services')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={service.profiles?.avatar_url} />
                    <AvatarFallback>
                      {service.profiles?.full_name?.slice(0, 2).toUpperCase() || 'SP'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{service.title}</h1>
                      {service.is_featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-semibold text-muted-foreground">
                        {service.profiles?.full_name || 'Service Provider'}
                      </h2>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-muted-foreground mb-2">{service.professional_title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{service.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.years_experience} experience</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{service.average_rating.toFixed(1)}</span>
                        <span>({service.total_reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">About This Service</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
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

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {service.whats_included.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>What I Need From You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.client_requirements}</p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <ServiceReviews serviceId={service.id} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ₹{formatCompactCurrency(service.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">{service.currency}</div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{service.delivery_time_days} days delivery</span>
                </div>

                {/* Payment Methods */}
                <div>
                  <h4 className="font-medium mb-2">Payment Methods Accepted</h4>
                  <div className="flex flex-wrap gap-1">
                    {service.payment_methods.map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Contact Options */}
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Provider</h4>
                  <div className="space-y-2">
                    {service.contact_email && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleContact('email')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    )}
                    {service.contact_phone && service.phone_number && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleContact('phone')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    )}
                    {service.contact_website && service.website_url && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleContact('website')}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                  <p>Payment is handled directly between you and the service provider</p>
                </div>
              </CardContent>
            </Card>

            {/* Provider Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orders Completed</span>
                  <span className="font-medium">{service.total_orders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reviews</span>
                  <span className="font-medium">{service.total_reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{service.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
