
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Users, 
  Award,
  Grid3X3,
  List,
  Plus,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import ServiceRecommendations from "./ServiceRecommendations";
import { useSubscription } from "@/hooks/useSubscription";

export default function EnhancedServiceMarketplace() {
  const navigate = useNavigate();
  const { hasFeatureAccess, getSubscriptionTier } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for services
  const services = [
    {
      id: '1',
      title: 'Professional Resume Review & Enhancement',
      description: 'Get your resume professionally reviewed and enhanced by an expert recruiter with 10+ years of experience.',
      category: 'Career Services',
      service_type: 'review',
      price_type: 'fixed',
      base_price: 2499,
      currency: 'INR',
      delivery_time_days: 3,
      provider_name: 'Priya Sharma',
      provider_avatar: '',
      provider_location: 'Mumbai, India',
      rating: 4.9,
      reviews_count: 127,
      orders_completed: 89,
      is_featured: true,
      is_verified: true,
      tags: ['Resume Review', 'Career Coaching', 'ATS Optimization']
    },
    {
      id: '2',
      title: 'LinkedIn Profile Optimization',
      description: 'Transform your LinkedIn profile to attract recruiters and boost your professional presence online.',
      category: 'Career Services',
      service_type: 'consultation',
      price_type: 'fixed',
      base_price: 1999,
      currency: 'INR',
      delivery_time_days: 2,
      provider_name: 'Raj Patel',
      provider_avatar: '',
      provider_location: 'Bangalore, India',
      rating: 4.7,
      reviews_count: 95,
      orders_completed: 67,
      is_featured: false,
      is_verified: true,
      tags: ['LinkedIn', 'Profile Optimization', 'Personal Branding']
    },
    {
      id: '3',
      title: 'Mock Interview Coaching Session',
      description: 'Practice with industry experts and get feedback to ace your next job interview.',
      category: 'Interview Prep',
      service_type: 'coaching',
      price_type: 'hourly',
      base_price: 799,
      currency: 'INR',
      delivery_time_days: 1,
      provider_name: 'Sarah Johnson',
      provider_avatar: '',
      provider_location: 'Delhi, India',
      rating: 4.8,
      reviews_count: 156,
      orders_completed: 134,
      is_featured: true,
      is_verified: true,
      tags: ['Mock Interview', 'Interview Skills', 'Confidence Building']
    }
  ];

  const categories = [
    'all',
    'Career Services',
    'Interview Prep',
    'Skill Development',
    'Portfolio Review',
    'Job Search Strategy'
  ];

  const serviceTypes = [
    'all',
    'consultation',
    'review',
    'coaching',
    'training',
    'design'
  ];

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesServiceType = selectedServiceType === 'all' || service.service_type === selectedServiceType;
      
      return matchesSearch && matchesCategory && matchesServiceType;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.base_price - b.base_price;
        case 'price_high':
          return b.base_price - a.base_price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return 0; // Would sort by created_at in real app
        default: // featured
          return b.is_featured ? 1 : -1;
      }
    });
  }, [searchTerm, selectedCategory, selectedServiceType, sortBy]);

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const handlePostService = () => {
    if (!hasFeatureAccess('marketplace_posting')) {
      navigate('/pro/subscription');
      return;
    }
    navigate('/marketplace/post-service');
  };

  const currentTier = getSubscriptionTier();
  const canPostServices = hasFeatureAccess('marketplace_posting');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Services Marketplace</h1>
            <p className="text-muted-foreground mt-1">
              Connect with professionals and grow your career • Payment handled directly between parties
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!canPostServices && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Upgrade to Pro to post services
                </span>
              </div>
            )}
            <Button 
              onClick={handlePostService}
              className={!canPostServices ? 'opacity-50' : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              {canPostServices ? 'Post Service' : 'Upgrade to Post'}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services, providers, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {filteredServices.length} Services Found
                </h2>
                <p className="text-sm text-muted-foreground">
                  Showing results for "{searchTerm || 'all services'}"
                </p>
              </div>
            </div>

            {/* Services Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'}`}>
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onServiceClick={handleServiceClick}
                />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No services found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedServiceType('all');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ServiceRecommendations
              type="trending"
              services={services.filter(s => s.is_featured)}
              onServiceClick={handleServiceClick}
            />

            <ServiceRecommendations
              type="featured"
              services={services.filter(s => s.is_verified)}
              onServiceClick={handleServiceClick}
            />

            {/* Subscription Promotion */}
            {currentTier === 'Free' && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    Upgrade to Pro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Post your services and reach thousands of potential clients
                  </p>
                  <Button className="w-full" onClick={() => navigate('/pro/subscription')}>
                    View Plans
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Platform Info */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Browse Services</p>
                      <p className="text-muted-foreground">Find the right professional for your needs</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Contact Provider</p>
                      <p className="text-muted-foreground">Discuss requirements and negotiate terms</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Direct Payment</p>
                      <p className="text-muted-foreground">Handle payment directly with the provider</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 TalentXcel only charges subscription fees. All service payments are handled directly between buyers and sellers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
