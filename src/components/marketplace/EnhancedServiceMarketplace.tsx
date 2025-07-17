
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Star, Clock, TrendingUp, Users, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "@/types/service";
import ServiceCard from "./ServiceCard";
import ServiceRecommendations from "./ServiceRecommendations";
import MarketplaceFilters from "./MarketplaceFilters";

export default function EnhancedServiceMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServiceType, setSelectedServiceType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Mock data for filters (these would come from your database)
  const categories = ["consulting", "design", "development", "marketing", "writing"];
  const serviceTypes = ["one_time", "ongoing", "package"];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Remote"];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles!provider_id (
            id,
            full_name,
            location
          )
        `)
        .eq('is_active', true);

      if (error) throw error;

      // Transform the data to match our Service interface
      const transformedServices: Service[] = (data || []).map((serviceData: any) => ({
        id: serviceData.id,
        provider_id: serviceData.provider_id,
        title: serviceData.title,
        professional_title: serviceData.professional_title || 'Professional',
        years_experience: serviceData.years_experience || '1-2 years',
        location: serviceData.location || serviceData.profiles?.location || 'Remote',
        description: serviceData.description,
        whats_included: serviceData.what_included || [],
        client_requirements: serviceData.client_requirements || '',
        delivery_time_days: serviceData.delivery_time_days,
        price: serviceData.base_price,
        currency: serviceData.currency,
        payment_methods: serviceData.payment_methods || ['online'],
        contact_email: serviceData.contact_email || false,
        contact_phone: serviceData.contact_phone || false,
        contact_website: serviceData.contact_website || false,
        website_url: serviceData.website_url || '',
        phone_number: serviceData.phone_number || '',
        tags: serviceData.tags || [],
        portfolio_files: serviceData.portfolio_items || [],
        is_active: serviceData.is_active,
        is_featured: serviceData.is_featured,
        average_rating: serviceData.average_rating || 4.5,
        total_reviews: serviceData.total_reviews || 0,
        total_orders: serviceData.orders_completed || 0,
        created_at: serviceData.created_at,
        updated_at: serviceData.updated_at,
        // Provider details
        provider_name: serviceData.profiles?.full_name || 'Anonymous Provider',
        provider_avatar: undefined,
        provider_location: serviceData.location || serviceData.profiles?.location || 'Remote',
        is_verified: false
      }));

      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    // Search filter
    if (searchTerm && !service.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !service.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !service.provider_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategory !== "all" && !service.tags.includes(selectedCategory)) {
      return false;
    }

    // Location filter
    if (selectedLocation !== "all" && selectedLocation !== "remote" && 
        !service.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }

    // Price range filter
    if (service.price < priceRange[0] || service.price > priceRange[1]) {
      return false;
    }

    // Rating filter
    if (service.average_rating < minRating) {
      return false;
    }

    // Verified filter
    if (verifiedOnly && !service.is_verified) {
      return false;
    }

    return true;
  });

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all" ? selectedCategory : null,
    selectedServiceType !== "all" ? selectedServiceType : null,
    selectedLocation !== "all" ? selectedLocation : null,
    priceRange[0] > 0 || priceRange[1] < 500 ? "price" : null,
    minRating > 0 ? "rating" : null,
    verifiedOnly ? "verified" : null
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedServiceType("all");
    setSelectedLocation("all");
    setPriceRange([0, 500]);
    setMinRating(0);
    setVerifiedOnly(false);
  };

  const handleServiceClick = (serviceId: string) => {
    window.open(`/services/${serviceId}`, '_blank');
  };

  // Mock data for recommendations
  const trendingServices = services.slice(0, 5).map(service => ({
    ...service,
    rating: service.average_rating
  }));

  const featuredServices = services.filter(s => s.is_featured).slice(0, 5).map(service => ({
    ...service,
    rating: service.average_rating
  }));

  const recommendedServices = services.slice(2, 7).map(service => ({
    ...service,
    rating: service.average_rating
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Professional Services</h1>
          <p className="text-xl text-muted-foreground">
            Discover and connect with verified professionals
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <MarketplaceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedServiceType={selectedServiceType}
            setSelectedServiceType={setSelectedServiceType}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            categories={categories}
            serviceTypes={serviceTypes}
            locations={locations}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {filteredServices.length} Services Found
                </h2>
                <p className="text-muted-foreground">
                  Showing results for your criteria
                </p>
              </div>
              
              <Select defaultValue="relevance">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={{
                      id: service.id,
                      title: service.title,
                      description: service.description,
                      category: service.tags[0] || 'General',
                      service_type: 'professional',
                      price_type: 'fixed',
                      base_price: service.price,
                      currency: service.currency,
                      delivery_time_days: service.delivery_time_days,
                      provider_name: service.provider_name,
                      provider_avatar: service.provider_avatar,
                      provider_location: service.provider_location,
                      rating: service.average_rating,
                      reviews_count: service.total_reviews,
                      orders_completed: service.total_orders,
                      is_featured: service.is_featured,
                      is_verified: service.is_verified,
                      tags: service.tags
                    }}
                    onServiceClick={handleServiceClick}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No services found</h3>
                    <p>Try adjusting your filters or search terms</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {trendingServices.length > 0 && (
              <ServiceRecommendations
                type="trending"
                services={trendingServices}
                onServiceClick={handleServiceClick}
              />
            )}
            
            {featuredServices.length > 0 && (
              <ServiceRecommendations
                type="featured"
                services={featuredServices}
                onServiceClick={handleServiceClick}
              />
            )}
            
            {recommendedServices.length > 0 && (
              <ServiceRecommendations
                type="recommended"
                services={recommendedServices}
                onServiceClick={handleServiceClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
