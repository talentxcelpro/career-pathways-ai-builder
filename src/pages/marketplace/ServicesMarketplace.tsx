
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SortAsc } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ServiceCard from "@/components/marketplace/ServiceCard";
import { useNavigate } from "react-router-dom";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  delivery_time_days: number;
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_location?: string;
  average_rating: number;
  total_reviews: number;
  total_orders: number;
  is_featured: boolean;
  is_verified?: boolean;
  tags: string[];
}

export default function ServicesMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [filterBy, setFilterBy] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [sortBy, filterBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (filterBy === 'featured') {
        query = query.eq('is_featured', true);
      } else if (filterBy === 'top_rated') {
        query = query.gte('average_rating', 4.0);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      const { data: servicesData, error: servicesError } = await query;

      if (servicesError) throw servicesError;

      if (!servicesData || servicesData.length === 0) {
        setServices([]);
        return;
      }

      // Get provider profiles
      const providerIds = [...new Set(servicesData.map(s => s.provider_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, location, verification_status')
        .in('id', providerIds);

      // Combine service and profile data
      const enrichedServices: Service[] = servicesData.map(service => {
        const profile = profilesData?.find(p => p.id === service.provider_id);
        return {
          id: service.id,
          title: service.title,
          description: service.description,
          price: service.price,
          currency: service.currency,
          delivery_time_days: service.delivery_time_days,
          provider_id: service.provider_id,
          provider_name: profile?.full_name || 'Unknown Provider',
          provider_avatar: profile?.profile_picture_url,
          provider_location: profile?.location || service.location,
          average_rating: service.average_rating || 0,
          total_reviews: service.total_reviews || 0,
          total_orders: service.total_orders || 0,
          is_featured: service.is_featured || false,
          is_verified: profile?.verification_status === 'verified',
          tags: service.tags || []
        };
      });

      setServices(enrichedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Professional Services</h1>
          <p className="text-muted-foreground">
            Find expert professionals for your projects and career needs
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services, providers, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="all">All Services</option>
                  <option value="featured">Featured Only</option>
                  <option value="top_rated">Top Rated</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
          </h2>
          {searchTerm && (
            <Badge variant="outline">
              Searching for: "{searchTerm}"
            </Badge>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onServiceClick={handleServiceClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
