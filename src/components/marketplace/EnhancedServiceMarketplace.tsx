
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin, Star, Clock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Service } from "@/types/service";

export default function EnhancedServiceMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // First get services data
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        return;
      }

      // Get provider details separately
      const providerIds = servicesData?.map(service => service.provider_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', providerIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Transform the data to match our Service interface
      const transformedServices: Service[] = servicesData?.map(service => {
        const profile = profilesData?.find(p => p.id === service.provider_id);
        
        return {
          id: service.id,
          provider_id: service.provider_id,
          title: service.title,
          professional_title: service.professional_title || '',
          years_experience: service.years_experience || '',
          location: service.location || '',
          description: service.description,
          whats_included: service.whats_included || [],
          client_requirements: service.client_requirements || '',
          delivery_time_days: service.delivery_time_days,
          price: service.price,
          currency: service.currency,
          payment_methods: service.payment_methods || [],
          contact_email: service.contact_email || false,
          contact_phone: service.contact_phone || false,
          contact_website: service.contact_website || false,
          website_url: service.website_url,
          phone_number: service.phone_number,
          tags: service.tags || [],
          portfolio_files: service.portfolio_files || [],
          is_active: service.is_active,
          is_featured: service.is_featured || false,
          average_rating: service.average_rating || 0,
          total_reviews: service.total_reviews || 0,
          total_orders: service.total_orders || 0,
          created_at: service.created_at,
          updated_at: service.updated_at,
          // Provider details
          provider_name: profile?.full_name || 'Unknown Provider',
          provider_avatar: undefined,
          provider_location: service.location,
          is_verified: false
        };
      }) || [];

      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || service.tags.includes(selectedCategory);
    
    const matchesPriceRange = priceRange === 'all' || 
      (priceRange === 'budget' && service.price < 5000) ||
      (priceRange === 'mid' && service.price >= 5000 && service.price < 20000) ||
      (priceRange === 'premium' && service.price >= 20000);

    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const handleContactProvider = (service: Service) => {
    // Handle contact logic here
    console.log('Contact provider:', service.provider_name);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Professional Services Marketplace</h1>
        <p className="text-muted-foreground mb-6">
          Discover expert professionals and quality services for your business needs
        </p>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services, skills, or professionals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="mobile-development">Mobile Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">₹0 - ₹5,000</SelectItem>
                <SelectItem value="mid">₹5,000 - ₹20,000</SelectItem>
                <SelectItem value="premium">₹20,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card 
            key={service.id} 
            className="group hover:shadow-lg transition-all duration-300 hover:border-border/60 cursor-pointer"
            onClick={() => handleServiceClick(service.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {service.provider_name?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {service.provider_name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {service.provider_location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{service.provider_location}</span>
                        </>
                      )}
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
                      ₹{service.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      fixed price
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactProvider(service);
                      }}
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

      {filteredServices.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
