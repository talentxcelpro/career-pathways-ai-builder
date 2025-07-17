
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, CheckCircle, ExternalLink, Phone, Mail, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import ServiceReviews from "@/components/marketplace/ServiceReviews";
import { formatCompactCurrency } from "@/utils/currencyUtils";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles:provider_id (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        const transformedService: Service = {
          ...data,
          provider_name: data.profiles?.full_name || 'Unknown Provider',
          provider_avatar: data.profiles?.avatar_url,
          provider_location: data.location,
          is_verified: false // You can add verification logic later
        };
        setService(transformedService);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactProvider = (method: string) => {
    if (!service) return;
    
    switch (method) {
      case 'email':
        window.location.href = `mailto:provider@example.com?subject=Inquiry about ${service.title}`;
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
        <p className="text-muted-foreground">The service you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={service.provider_avatar} />
                  <AvatarFallback>
                    {service.provider_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{service.title}</h1>
                    {service.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <span className="font-medium">{service.provider_name}</span>
                    <span>•</span>
                    <span>{service.professional_title}</span>
                    {service.is_verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{service.average_rating.toFixed(1)}</span>
                      <span>({service.total_reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.delivery_time_days} days delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
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
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>What You Need to Provide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{service.client_requirements}</p>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Service Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <ServiceReviews serviceId={service.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Service Price
                <span className="text-2xl font-bold">
                  ₹{formatCompactCurrency(service.price)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>• {service.delivery_time_days} days delivery</p>
                <p>• {service.total_orders} orders completed</p>
                <p>• Payment handled directly with provider</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Payment Methods Accepted:</h4>
                <div className="flex flex-wrap gap-2">
                  {service.payment_methods.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {service.contact_email && (
                <Button 
                  className="w-full" 
                  onClick={() => handleContactProvider('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
              
              {service.contact_phone && service.phone_number && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleContactProvider('phone')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Provider
                </Button>
              )}
              
              {service.contact_website && service.website_url && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleContactProvider('website')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              )}
              
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                <p>All payments are handled directly between you and the service provider.</p>
              </div>
            </CardContent>
          </Card>

          {/* Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={service.provider_avatar} />
                    <AvatarFallback>
                      {service.provider_name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{service.provider_name}</p>
                    <p className="text-sm text-muted-foreground">{service.professional_title}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• {service.years_experience} of experience</p>
                  <p>• {service.total_orders} orders completed</p>
                  <p>• {service.average_rating.toFixed(1)} star rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
