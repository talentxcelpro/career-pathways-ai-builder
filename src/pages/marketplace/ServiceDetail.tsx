
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, User, Mail, Phone, Globe, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import ServiceReviews from "@/components/marketplace/ServiceReviews";

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
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles!services_provider_id_fkey (
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        const transformedService: Service = {
          id: data.id,
          provider_id: data.provider_id,
          title: data.title,
          professional_title: data.professional_title || '',
          years_experience: data.years_experience || '',
          location: data.location || '',
          description: data.description,
          whats_included: data.whats_included || [],
          client_requirements: data.client_requirements || '',
          delivery_time_days: data.delivery_time_days,
          price: data.price,
          currency: data.currency,
          payment_methods: data.payment_methods || [],
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          contact_website: data.contact_website,
          website_url: data.website_url || '',
          phone_number: data.phone_number || '',
          tags: data.tags || [],
          portfolio_files: data.portfolio_files || [],
          is_active: data.is_active,
          is_featured: data.is_featured,
          average_rating: data.average_rating,
          total_reviews: data.total_reviews,
          total_orders: data.total_orders,
          created_at: data.created_at,
          updated_at: data.updated_at,
          provider_name: data.profiles?.full_name || 'Unknown Provider',
          provider_avatar: data.profiles?.avatar_url,
          provider_location: data.location || data.profiles?.location,
          is_verified: false
        };

        setService(transformedService);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    
    return `${currencySymbols[currency] || currency} ${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground">The service you're looking for doesn't exist or has been removed.</p>
        </div>
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
                <div>
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={service.provider_avatar} alt={service.provider_name} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{service.provider_name}</p>
                      {service.professional_title && (
                        <p className="text-sm text-muted-foreground">{service.professional_title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{service.average_rating.toFixed(1)}</span>
                      <span>({service.total_reviews} reviews)</span>
                    </div>
                    <div>{service.total_orders} orders completed</div>
                    {service.provider_location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{service.provider_location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatPrice(service.price, service.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.delivery_time_days} days delivery
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{service.description}</p>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {service.whats_included.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Requirements */}
          {service.client_requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{service.client_requirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <ServiceReviews serviceId={service.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order This Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Price</span>
                <span className="font-semibold">{formatPrice(service.price, service.currency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Time</span>
                <span>{service.delivery_time_days} days</span>
              </div>
              <Button className="w-full" size="lg">
                Contact Provider
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          {service.payment_methods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.payment_methods.map((method) => (
                    <div key={method} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{method}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {service.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email available</span>
                </div>
              )}
              {service.contact_phone && service.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Phone available</span>
                </div>
              )}
              {service.contact_website && service.website_url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Website available</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
