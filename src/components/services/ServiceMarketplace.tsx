import React, { useState, useEffect } from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceFilters } from './ServiceFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Grid3X3, List, Filter, X, Sparkles, TrendingUp, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { allMockServices, serviceCategories } from '@/data/mockServices';
import { appleTextSizes, appleSpacing, appleVariants } from '@/utils/appleTypeScale';

// Use the comprehensive service data
const mockServices = allMockServices;

const categories = serviceCategories.map(cat => ({
  id: cat.id,
  name: cat.name,
  subcategories: cat.subcategories.map((sub, index) => ({
    id: sub.toLowerCase().replace(/\s+/g, '-'),
    name: sub
  }))
}));

const locations = [
  'Mumbai, India',
  'Delhi, India',
  'Bangalore, India',
  'Pune, India',
  'Hyderabad, India',
  'Chennai, India',
  'Kolkata, India',
  'Ahmedabad, India'
];

const popularTags = [
  'Professional',
  'Quality',
  'Fast Delivery',
  'Beginner Friendly',
  'Premium Quality',
  'Modern Design',
  'Custom Solution',
  'Expert Level',
  'Consultation'
];

export interface ServiceMarketplaceProps {
  className?: string;
}

export const ServiceMarketplace: React.FC<ServiceMarketplaceProps> = ({ className }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [services, setServices] = useState(mockServices);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');

  const [filteredServices, setFilteredServices] = useState(services);

  // Apply filters
  useEffect(() => {
    let filtered = services;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(service => service.subcategory?.toLowerCase().replace(/\s+/g, '-') === selectedSubcategory);
    }

    // Price range filter
    filtered = filtered.filter(service =>
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(service => service.location === selectedLocation);
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(service => service.rating >= minRating);
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter(service => service.provider.verified);
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(service =>
        selectedTags.some(tag => service.tags.includes(tag))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        filtered.reverse();
        break;
      default:
        break;
    }

    setFilteredServices(filtered);
  }, [
    services,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    priceRange,
    selectedLocation,
    minRating,
    deliveryTime,
    verifiedOnly,
    selectedTags,
    sortBy
  ]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceRange([0, 100000]);
    setSelectedLocation('');
    setMinRating(0);
    setDeliveryTime('');
    setVerifiedOnly(false);
    setSelectedTags([]);
    setSortBy('relevance');
  };

  const handleFavorite = (serviceId: string) => {
    setServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, isFavorite: !service.isFavorite }
          : service
      )
    );
  };

  const handleShare = (serviceId: string) => {
    console.log('Share service:', serviceId);
  };

  const handleServiceClick = (serviceId: string) => {
    console.log('View service:', serviceId);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20", className)}>
      {/* Apple-inspired Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iaHNsKHZhcigtLXByaW1hcnkpIC8gMC4xKSIvPgo8L3N2Zz4K')] opacity-30"></div>
        
        <div className="container mx-auto px-6 py-16 relative">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">100+ Professional Services Available</span>
            </div>
            
            <h1 className={cn(appleTextSizes['display-medium'], "font-bold text-foreground leading-tight")}>
              Find the Perfect
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Service </span>
              for Your Needs
            </h1>
            
            <p className={cn(appleTextSizes['title-large'], "text-muted-foreground max-w-2xl mx-auto leading-relaxed")}>
              Connect with verified professionals offering world-class services. From creative design to technical development, 
              find exactly what you need with transparent pricing and instant booking.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-green-500" />
                <span>500+ Verified Providers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.8+ Average Rating</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>1000+ Completed Projects</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Button 
                onClick={() => window.location.href = '/business-models'}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Business Models
              </Button>
              <Button 
                onClick={() => window.location.href = '/marketplace/post-service'}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Offer Your Services
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Showcase */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className={cn(appleTextSizes['headline-large'], "font-semibold mb-4")}>
            Explore Service Categories
          </h2>
          <p className={cn(appleTextSizes['body-large'], "text-muted-foreground")}>
            Browse our curated collection of professional services
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {serviceCategories.map((category) => (
            <Card 
              key={category.id} 
              className={cn(
                appleVariants.card.interactive,
                "group border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
              )}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className={cn(
                  "w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl",
                  category.color
                )}>
                  {category.icon}
                </div>
                <h3 className={cn(appleTextSizes['title-small'], "font-medium text-center")}>
                  {category.name}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Apple-inspired Filters Sidebar */}
          <div className={cn(
            "lg:w-80 transition-all duration-300",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <div className="sticky top-6">
              <Card className={cn(appleVariants.card.base, "backdrop-blur-xl bg-background/80 border-border/50")}>
                <CardHeader className="pb-4">
                  <h3 className={cn(appleTextSizes['title-medium'], "font-semibold")}>
                    Filter Services
                  </h3>
                </CardHeader>
                <ServiceFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={(category) => {
                    setSelectedCategory(category);
                    setSelectedSubcategory('');
                  }}
                  selectedSubcategory={selectedSubcategory}
                  onSubcategoryChange={setSelectedSubcategory}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  minRating={minRating}
                  onMinRatingChange={setMinRating}
                  deliveryTime={deliveryTime}
                  onDeliveryTimeChange={setDeliveryTime}
                  verifiedOnly={verifiedOnly}
                  onVerifiedOnlyChange={setVerifiedOnly}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  onClearFilters={clearFilters}
                  categories={categories}
                  locations={locations}
                  popularTags={popularTags}
                  className="px-6 pb-6"
                />
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Apple-inspired Controls Bar */}
            <Card className={cn(appleVariants.card.base, "backdrop-blur-xl bg-background/80 border-border/50")}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(
                        "lg:hidden transition-all duration-200",
                        appleVariants.button.ghost
                      )}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                    
                    <div className="space-y-1">
                      <div className={cn(appleTextSizes['title-small'], "font-semibold")}>
                        {filteredServices.length} services available
                      </div>
                      <div className={cn(appleTextSizes['body-medium'], "text-muted-foreground")}>
                        Trusted professionals ready to help
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory || selectedLocation || minRating > 0 || verifiedOnly || selectedTags.length > 0) && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-3">
                      <div className={cn(appleTextSizes['title-small'], "font-medium")}>Active Filters</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategory && (
                          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20">
                            {categories.find(c => c.id === selectedCategory)?.name}
                            <X
                              className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => setSelectedCategory('')}
                            />
                          </Badge>
                        )}
                        {selectedLocation && (
                          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground border-secondary/20">
                            {selectedLocation}
                            <X
                              className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => setSelectedLocation('')}
                            />
                          </Badge>
                        )}
                        {minRating > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border-yellow-200">
                            {minRating}+ Rating
                            <X
                              className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => setMinRating(0)}
                            />
                          </Badge>
                        )}
                        {verifiedOnly && (
                          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 border-green-200">
                            Verified Only
                            <X
                              className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => setVerifiedOnly(false)}
                            />
                          </Badge>
                        )}
                        {selectedTags.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent-foreground border-accent/20">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer hover:scale-110 transition-transform"
                              onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                            />
                          </Badge>
                        ))}
                        {(selectedCategory || selectedLocation || minRating > 0 || verifiedOnly || selectedTags.length > 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-xs h-8 px-3 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Apple-inspired Services Grid/List */}
            {filteredServices.length > 0 ? (
              <div className={cn(
                "transition-all duration-300",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-6"
              )}>
                {filteredServices.map((service, index) => (
                  <div
                    key={service.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ServiceCard
                      {...service}
                      onClick={() => handleServiceClick(service.id)}
                      onFavorite={() => handleFavorite(service.id)}
                      onShare={() => handleShare(service.id)}
                      className={cn(
                        appleVariants.card.interactive,
                        "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
                        viewMode === 'list' ? 'w-full' : ''
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className={cn(appleVariants.card.base, "backdrop-blur-xl bg-background/80 border-border/50")}>
                <CardContent className="p-16 text-center">
                  <div className={cn(appleSpacing['large'], "max-w-md mx-auto")}>
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                      <Filter className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className={cn(appleTextSizes['headline-small'], "font-semibold mb-2")}>
                      No services found
                    </h3>
                    <p className={cn(appleTextSizes['body-large'], "text-muted-foreground mb-6")}>
                      Try adjusting your filters or search terms to discover amazing services from our talented providers.
                    </p>
                    <Button 
                      onClick={clearFilters} 
                      variant="outline"
                      className={cn(appleVariants.button.secondary, "rounded-full px-6")}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Load More Button for Pagination */}
            {filteredServices.length > 12 && (
              <div className="text-center pt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  className={cn(appleVariants.button.secondary, "rounded-full px-8")}
                >
                  Load More Services
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};