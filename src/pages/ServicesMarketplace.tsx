import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Zap,
  Crown,
  Filter,
  MessageCircle,
  Bookmark,
  TrendingUp,
  ArrowRight
} from "lucide-react";

interface ServiceProvider {
  id: string;
  profile_slug: string;
  business_name: string;
  bio: string;
  location: string;
  average_rating: number;
  total_reviews: number;
  response_time_hours: number;
  is_verified: boolean;
  subscription_tier: string;
  services: ProService[];
}

interface ProService {
  id: string;
  title: string;
  description: string;
  category: string;
  pricing_type: string;
  base_price: number;
  delivery_time_days: number;
  views_count: number;
  bookings_count: number;
  tags: string[];
}

const categories = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Business Consulting',
  'Data & Analytics',
  'AI & Machine Learning'
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' }
];

export const ServicesMarketplace: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    loadServiceProviders();
  }, []);

  useEffect(() => {
    filterAndSortProviders();
  }, [providers, searchTerm, selectedCategory, sortBy, priceRange]);

  const loadServiceProviders = async () => {
    try {
      const { data: profilesData } = await supabase
        .from('pro_service_profiles')
        .select(`
          *,
          pro_services (
            id,
            title,
            description,
            category,
            pricing_type,
            base_price,
            delivery_time_days,
            views_count,
            bookings_count,
            tags
          )
        `)
        .eq('is_active', true)
        .order('is_verified', { ascending: false });

      if (profilesData) {
        setProviders(profilesData as any);
      }
    } catch (error) {
      console.error('Error loading service providers:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProviders = () => {
    let filtered = [...providers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(provider => 
        provider.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.services?.some(service => 
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(provider =>
        provider.services?.some(service => service.category === selectedCategory)
      );
    }

    // Filter by price range
    if (priceRange !== 'all') {
      filtered = filtered.filter(provider => {
        const hasServicesInRange = provider.services?.some(service => {
          const price = service.base_price || 0;
          switch (priceRange) {
            case 'under-1000':
              return price < 1000;
            case '1000-5000':
              return price >= 1000 && price <= 5000;
            case '5000-10000':
              return price >= 5000 && price <= 10000;
            case 'over-10000':
              return price > 10000;
            default:
              return true;
          }
        });
        return hasServicesInRange;
      });
    }

    // Sort providers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'price_low':
          const aMinPrice = Math.min(...(a.services?.map(s => s.base_price || 0) || [0]));
          const bMinPrice = Math.min(...(b.services?.map(s => s.base_price || 0) || [0]));
          return aMinPrice - bMinPrice;
        case 'price_high':
          const aMaxPrice = Math.max(...(a.services?.map(s => s.base_price || 0) || [0]));
          const bMaxPrice = Math.max(...(b.services?.map(s => s.base_price || 0) || [0]));
          return bMaxPrice - aMaxPrice;
        case 'popular':
          const aTotalBookings = a.services?.reduce((sum, s) => sum + (s.bookings_count || 0), 0) || 0;
          const bTotalBookings = b.services?.reduce((sum, s) => sum + (s.bookings_count || 0), 0) || 0;
          return bTotalBookings - aTotalBookings;
        case 'featured':
        default:
          // Featured: Verified first, then by subscription tier priority, then by rating
          if (a.is_verified !== b.is_verified) {
            return b.is_verified ? 1 : -1;
          }
          const tierPriority = { 'Pro Elite': 3, 'Pro Business': 2, 'Pro Starter': 1 };
          const aTierPriority = tierPriority[a.subscription_tier as keyof typeof tierPriority] || 0;
          const bTierPriority = tierPriority[b.subscription_tier as keyof typeof tierPriority] || 0;
          if (aTierPriority !== bTierPriority) {
            return bTierPriority - aTierPriority;
          }
          return (b.average_rating || 0) - (a.average_rating || 0);
      }
    });

    setFilteredProviders(filtered);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Pro Elite':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"><Crown className="h-3 w-3 mr-1" />Elite</Badge>;
      case 'Pro Business':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"><Zap className="h-3 w-3 mr-1" />Business</Badge>;
      case 'Pro Starter':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"><Star className="h-3 w-3 mr-1" />Starter</Badge>;
      default:
        return null;
    }
  };

  const handleContactProvider = (provider: ServiceProvider) => {
    // Navigate to booking form or contact modal
    toast({
      title: "Feature Coming Soon",
      description: "Direct contact functionality will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">TalentXcel Services Marketplace</h1>
        <p className="text-lg text-muted-foreground">
          Discover professional services from verified experts
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                <SelectItem value="over-10000">Over ₹10,000</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {filteredProviders.length} service provider{filteredProviders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Service Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{provider.business_name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    {provider.is_verified && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {getTierBadge(provider.subscription_tier)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {provider.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{provider.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{provider.average_rating?.toFixed(1) || '0.0'}</span>
                  <span>({provider.total_reviews || 0})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{provider.response_time_hours}h response</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {provider.bio}
              </p>

              {/* Services Preview */}
              {provider.services && provider.services.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className="font-semibold text-sm">Services:</h4>
                  {provider.services.slice(0, 2).map((service) => (
                    <div key={service.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm">{service.title}</h5>
                        <div className="text-sm font-semibold">
                          {service.pricing_type === 'fixed' ? (
                            `₹${service.base_price?.toLocaleString()}`
                          ) : service.pricing_type === 'hourly' ? (
                            `₹${service.base_price}/hr`
                          ) : (
                            'Contact for pricing'
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {service.delivery_time_days} days delivery
                        </span>
                      </div>
                    </div>
                  ))}
                  {provider.services.length > 2 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{provider.services.length - 2} more services
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleContactProvider(provider)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No services found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse all categories
          </p>
        </div>
      )}

      {/* Call to Action */}
      <Card className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-8 text-center">
          <Crown className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Become a Service Provider</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of professionals earning with their expertise
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Start Selling Your Services
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};