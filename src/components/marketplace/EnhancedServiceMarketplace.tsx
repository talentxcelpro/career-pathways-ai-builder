
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, MapPin, Clock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import { formatCompactCurrency } from "@/utils/currencyUtils";

export default function EnhancedServiceMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchServices();
  }, [searchTerm, selectedCategory, sortBy]);

  const fetchServices = async () => {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          profiles:provider_id (
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match our interface
      const transformedServices: Service[] = (data || []).map(service => ({
        ...service,
        provider_name: service.profiles?.full_name || 'Unknown Provider',
        provider_avatar: service.profiles?.avatar_url,
        provider_location: service.location,
        is_verified: false // You can add verification logic later
      }));

      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    window.open(`/services/${serviceId}`, '_blank');
  };

  const handleContactProvider = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    // This would open a contact modal or redirect to provider's contact page
    console.log('Contact provider:', service.provider_name);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Professional Services Marketplace</h1>
        <p className="text-muted-foreground">
          Connect with verified professionals for all your career and business needs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className="group hover:shadow-lg transition-all duration-300 hover:border-border/60 cursor-pointer h-full"
            onClick={() => handleServiceClick(service.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {service.provider_avatar ? (
                      <img 
                        src={service.provider_avatar} 
                        alt={service.provider_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {service.provider_name?.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {service.provider_name}
                      </h3>
                      {service.is_verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{service.professional_title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{service.location}</span>
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

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium line-clamp-2 mb-2">{service.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {service.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {service.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{service.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{service.average_rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({service.total_reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{service.delivery_time_days} days</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold">
                      ₹{formatCompactCurrency(service.price)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {service.currency}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleContactProvider(service, e)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                <p>Payment handled directly between buyer and seller</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No services found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new services.
          </p>
        </div>
      )}
    </div>
  );
}
