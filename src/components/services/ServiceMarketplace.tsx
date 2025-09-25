import React, { useState, useEffect } from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceFilters } from './ServiceFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Grid3X3, List, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - this would typically come from your database
const mockServices = [
  {
    id: '1',
    title: 'Professional Resume Writing Service',
    description: 'Get a professionally written resume that stands out to employers and passes ATS systems.',
    category: 'career-services',
    subcategory: 'resume-writing',
    price: 2500,
    currency: 'INR',
    provider: {
      id: 'provider-1',
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      verified: true,
      rating: 4.9,
      reviewCount: 127
    },
    images: ['/api/placeholder/400/300'],
    location: 'Mumbai, India',
    deliveryTime: '2-3 days',
    tags: ['ATS-friendly', 'Executive', 'Career Change'],
    rating: 4.9,
    reviewCount: 89,
    isFavorite: false
  },
  {
    id: '2',
    title: 'LinkedIn Profile Optimization',
    description: 'Optimize your LinkedIn profile to attract recruiters and build your professional brand.',
    category: 'career-services',
    subcategory: 'profile-optimization',
    price: 1500,
    currency: 'INR',
    provider: {
      id: 'provider-2',
      name: 'Rajesh Kumar',
      avatar: '/api/placeholder/40/40',
      verified: true,
      rating: 4.8,
      reviewCount: 95
    },
    images: ['/api/placeholder/400/300'],
    location: 'Bangalore, India',
    deliveryTime: '1-2 days',
    tags: ['LinkedIn', 'Personal Branding', 'SEO'],
    rating: 4.8,
    reviewCount: 67,
    isFavorite: true
  },
  {
    id: '3',
    title: 'Interview Coaching Session',
    description: 'One-on-one interview coaching to help you ace your next job interview.',
    category: 'career-services',
    subcategory: 'interview-prep',
    price: 3000,
    currency: 'INR',
    provider: {
      id: 'provider-3',
      name: 'Priya Sharma',
      avatar: '/api/placeholder/40/40',
      verified: true,
      rating: 4.9,
      reviewCount: 156
    },
    images: ['/api/placeholder/400/300'],
    location: 'Delhi, India',
    deliveryTime: '1 hour session',
    tags: ['Behavioral', 'Technical', 'Mock Interview'],
    rating: 4.9,
    reviewCount: 134,
    isFavorite: false
  },
  {
    id: '4',
    title: 'Custom Website Development',
    description: 'Build a professional website for your business with modern design and functionality.',
    category: 'web-development',
    subcategory: 'full-stack',
    price: 25000,
    currency: 'INR',
    provider: {
      id: 'provider-4',
      name: 'Tech Solutions Inc',
      avatar: '/api/placeholder/40/40',
      verified: true,
      rating: 4.7,
      reviewCount: 78
    },
    images: ['/api/placeholder/400/300'],
    location: 'Pune, India',
    deliveryTime: '2-3 weeks',
    tags: ['React', 'Node.js', 'Responsive'],
    rating: 4.7,
    reviewCount: 45,
    isFavorite: false
  },
  {
    id: '5',
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive digital marketing strategy to grow your business online.',
    category: 'marketing',
    subcategory: 'digital-marketing',
    price: 8000,
    currency: 'INR',
    provider: {
      id: 'provider-5',
      name: 'Marketing Pros',
      avatar: '/api/placeholder/40/40',
      verified: false,
      rating: 4.6,
      reviewCount: 52
    },
    images: ['/api/placeholder/400/300'],
    location: 'Hyderabad, India',
    deliveryTime: '1 week',
    tags: ['SEO', 'Social Media', 'PPC'],
    rating: 4.6,
    reviewCount: 32,
    isFavorite: false
  },
  {
    id: '6',
    title: 'Graphic Design Package',
    description: 'Complete branding package including logo, business cards, and marketing materials.',
    category: 'design',
    subcategory: 'branding',
    price: 5000,
    currency: 'INR',
    provider: {
      id: 'provider-6',
      name: 'Creative Studio',
      avatar: '/api/placeholder/40/40',
      verified: true,
      rating: 4.8,
      reviewCount: 91
    },
    images: ['/api/placeholder/400/300'],
    location: 'Chennai, India',
    deliveryTime: '5-7 days',
    tags: ['Logo', 'Branding', 'Print Design'],
    rating: 4.8,
    reviewCount: 73,
    isFavorite: false
  }
];

const categories = [
  {
    id: 'career-services',
    name: 'Career Services',
    subcategories: [
      { id: 'resume-writing', name: 'Resume Writing' },
      { id: 'profile-optimization', name: 'Profile Optimization' },
      { id: 'interview-prep', name: 'Interview Preparation' },
      { id: 'career-coaching', name: 'Career Coaching' }
    ]
  },
  {
    id: 'web-development',
    name: 'Web Development',
    subcategories: [
      { id: 'frontend', name: 'Frontend Development' },
      { id: 'backend', name: 'Backend Development' },
      { id: 'full-stack', name: 'Full Stack Development' },
      { id: 'ecommerce', name: 'E-commerce Development' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    subcategories: [
      { id: 'digital-marketing', name: 'Digital Marketing' },
      { id: 'content-marketing', name: 'Content Marketing' },
      { id: 'social-media', name: 'Social Media Marketing' },
      { id: 'seo', name: 'SEO Services' }
    ]
  },
  {
    id: 'design',
    name: 'Design',
    subcategories: [
      { id: 'graphic-design', name: 'Graphic Design' },
      { id: 'ui-ux', name: 'UI/UX Design' },
      { id: 'branding', name: 'Branding' },
      { id: 'illustration', name: 'Illustration' }
    ]
  }
];

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
  'ATS-friendly',
  'LinkedIn',
  'React',
  'SEO',
  'Branding',
  'Professional',
  'Fast Delivery',
  'Beginner Friendly',
  'Premium Quality'
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
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(service => service.subcategory === selectedSubcategory);
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
        // For demo, just reverse the order
        filtered.reverse();
        break;
      default:
        // Relevance - keep original order
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
    // Implement share functionality
    console.log('Share service:', serviceId);
  };

  const handleServiceClick = (serviceId: string) => {
    // Navigate to service detail page
    console.log('View service:', serviceId);
  };

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={cn(
          "lg:w-80 transition-all duration-200",
          showFilters ? "block" : "hidden lg:block"
        )}>
          <ServiceFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              setSelectedSubcategory(''); // Reset subcategory when category changes
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
            className="sticky top-4"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Controls Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    {filteredServices.length} services found
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || selectedLocation || minRating > 0 || verifiedOnly || selectedTags.length > 0) && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Active Filters:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategory && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {categories.find(c => c.id === selectedCategory)?.name}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSelectedCategory('')}
                          />
                        </Badge>
                      )}
                      {selectedLocation && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {selectedLocation}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSelectedLocation('')}
                          />
                        </Badge>
                      )}
                      {minRating > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {minRating}+ Rating
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setMinRating(0)}
                          />
                        </Badge>
                      )}
                      {verifiedOnly && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Verified Only
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setVerifiedOnly(false)}
                          />
                        </Badge>
                      )}
                      {selectedTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Services Grid/List */}
          {filteredServices.length > 0 ? (
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            )}>
              {filteredServices.map(service => (
                <ServiceCard
                  key={service.id}
                  {...service}
                  onFavorite={() => handleFavorite(service.id)}
                  onShare={() => handleShare(service.id)}
                  onClick={() => handleServiceClick(service.id)}
                  className={viewMode === 'list' ? "flex flex-col md:flex-row" : undefined}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="text-muted-foreground text-lg">No services found</div>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
