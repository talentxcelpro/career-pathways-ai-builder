
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Mail, Phone, Globe, User } from "lucide-react";
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
        .single();

      if (error) throw error;

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
          <p className="mt-2 text-muted-foreground">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
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
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={service.provider_avatar} alt={service.provider_name} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{service.provider_name}</p>
                      {service.professional_title && (
                        <p className="text-sm text-muted-foreground">{service.professional_title}</p>
                      )}
                      {service.provider_location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{service.provider_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatPrice(service.price, service.currency)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{service.delivery_time_days} days delivery</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </CardContent>
          </Card>

          {/* What's Included */}
          {service.whats_included.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.whats_included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Client Requirements */}
          {service.client_requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.client_requirements}</p>
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
              <div className="flex items-center justify-between">
                <span>Price</span>
                <span className="font-semibold">{formatPrice(service.price, service.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Time</span>
                <span className="font-semibold">{service.delivery_time_days} days</span>
              </div>
              <Button className="w-full" size="lg">
                Order Now
              </Button>
              <Button variant="outline" className="w-full">
                Contact Provider
              </Button>
            </CardContent>
          </Card>

          {/* Rating Card */}
          <Card>
            <CardHeader>
              <CardTitle>Rating & Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-bold">{service.average_rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  ({service.total_reviews} reviews)
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {service.total_orders} orders completed
              </p>
            </CardContent>
          </Card>

          {/* Contact Options */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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

          {/* Tags */}
          {service.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
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
          )}
        </div>
      </div>
    </div>
  );
}
