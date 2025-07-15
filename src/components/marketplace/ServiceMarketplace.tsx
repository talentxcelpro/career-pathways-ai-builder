import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, DollarSign, User, MessageSquare, Filter, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import EnhancedServiceCard from "./EnhancedServiceCard";
import ServiceRecommendations from "./ServiceRecommendations";
import MarketplaceFilters from "./MarketplaceFilters";

// Enhanced mock data with additional fields for marketplace features
const mockServices = [
  {
    id: "1",
    title: "Professional Resume Review & Optimization",
    description: "Get your resume reviewed by industry experts and optimized for ATS systems with detailed feedback and improvement suggestions",
    category: "resume",
    service_type: "review",
    price_type: "fixed",
    base_price: 75,
    delivery_time_days: 3,
    skills_offered: ["Resume Writing", "ATS Optimization", "Career Strategy"],
    rating: 4.8,
    reviews_count: 124,
    orders_completed: 89,
    is_featured: true,
    is_verified: true,
    provider_name: "Sarah Johnson",
    provider_location: "New York, NY",
    provider_response_time: "2 hours",
    provider_avatar: "/placeholder.svg",
    provider_badge: "expert"
  },
  {
    id: "2",
    title: "Mock Interview Session with Feedback",
    description: "Practice your interview skills with experienced professionals and get detailed feedback on your performance",
    category: "interview",
    service_type: "coaching",
    price_type: "hourly",
    base_price: 60,
    delivery_time_days: 1,
    skills_offered: ["Interview Coaching", "Communication Skills", "Confidence Building"],
    rating: 4.9,
    reviews_count: 87,
    orders_completed: 156,
    is_featured: false,
    is_verified: true,
    provider_name: "Mike Chen",
    provider_location: "San Francisco, CA",
    provider_response_time: "1 hour",
    provider_avatar: "/placeholder.svg",
    provider_badge: "verified"
  },
  {
    id: "3",
    title: "LinkedIn Profile Optimization",
    description: "Transform your LinkedIn profile to attract recruiters and networking opportunities with professional copywriting",
    category: "linkedin_optimization",
    service_type: "design",
    price_type: "package",
    base_price: 120,
    delivery_time_days: 5,
    skills_offered: ["LinkedIn Optimization", "Personal Branding", "Networking"],
    rating: 4.7,
    reviews_count: 203,
    orders_completed: 178,
    is_featured: true,
    is_verified: true,
    provider_name: "Emily Rodriguez",
    provider_location: "Remote",
    provider_response_time: "4 hours",
    provider_avatar: "/placeholder.svg",
    provider_badge: "premium"
  },
  {
    id: "4",
    title: "Career Coaching & Strategy Session",
    description: "One-on-one career coaching sessions to help you navigate your professional journey and achieve your goals",
    category: "career_coaching",
    service_type: "coaching",
    price_type: "hourly",
    base_price: 90,
    delivery_time_days: 1,
    skills_offered: ["Career Planning", "Goal Setting", "Professional Development"],
    rating: 4.6,
    reviews_count: 156,
    orders_completed: 234,
    is_featured: false,
    is_verified: true,
    provider_name: "David Kim",
    provider_location: "Los Angeles, CA",
    provider_response_time: "3 hours",
    provider_avatar: "/placeholder.svg",
    provider_badge: "verified"
  },
  {
    id: "5",
    title: "Technical Skills Assessment & Training",
    description: "Comprehensive technical skills evaluation and personalized training program for career advancement",
    category: "skill_development",
    service_type: "training",
    price_type: "package",
    base_price: 200,
    delivery_time_days: 14,
    skills_offered: ["Technical Assessment", "Skill Development", "Programming"],
    rating: 4.9,
    reviews_count: 89,
    orders_completed: 67,
    is_featured: true,
    is_verified: true,
    provider_name: "Alex Thompson",
    provider_location: "Seattle, WA",
    provider_response_time: "6 hours",
    provider_avatar: "/placeholder.svg",
    provider_badge: "expert"
  },
  {
    id: "6",
    title: "Personal Branding & Portfolio Review",
    description: "Complete personal branding makeover including portfolio review and online presence optimization",
    category: "portfolio_review",
    service_type: "design",
    price_type: "fixed",
    base_price: 150,
    delivery_time_days: 7,
    skills_offered: ["Personal Branding", "Portfolio Design", "Online Presence"],
    rating: 4.8,
    reviews_count: 134,
    orders_completed: 98,
    is_featured: false,
    is_verified: false,
    provider_name: "Jessica Lee",
    provider_location: "Chicago, IL",
    provider_response_time: "8 hours",
    provider_avatar: "/placeholder.svg"
  }
];

export default function ServiceMarketplace() {
  const [services, setServices] = useState(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    "resume", "interview", "career_coaching", "skill_development", 
    "portfolio_review", "linkedin_optimization", "salary_negotiation"
  ];

  const serviceTypes = [
    "consultation", "review", "training", "coaching", "design"
  ];

  const locations = [
    "New York, NY", "San Francisco, CA", "Los Angeles, CA", "Seattle, WA", "Chicago, IL", "Remote"
  ];

  const handleFavorite = (serviceId: string) => {
    setFavorites(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedServiceType !== "all") count++;
    if (selectedLocation !== "all") count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 500) count++;
    if (minRating > 0) count++;
    if (verifiedOnly) count++;
    return count;
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedServiceType("all");
    setSelectedLocation("all");
    setPriceRange([0, 500]);
    setMinRating(0);
    setVerifiedOnly(false);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.skills_offered.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         service.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesServiceType = selectedServiceType === "all" || service.service_type === selectedServiceType;
    const matchesLocation = selectedLocation === "all" || service.provider_location === selectedLocation;
    const matchesPrice = service.base_price >= priceRange[0] && service.base_price <= priceRange[1];
    const matchesRating = service.rating >= minRating;
    const matchesVerified = !verifiedOnly || service.is_verified;

    return matchesSearch && matchesCategory && matchesServiceType && matchesLocation && matchesPrice && matchesRating && matchesVerified;
  });

  // Get featured and trending services for recommendations
  const featuredServices = services.filter(service => service.is_featured);
  const trendingServices = services.sort((a, b) => b.orders_completed - a.orders_completed);
  const recommendedServices = services.filter(service => service.rating >= 4.5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Professional Services Marketplace</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect with verified experts, book instantly, and accelerate your career growth with our comprehensive service directory.
        </p>
      </div>

      {/* Stats Bar */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Verified Experts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">1.2K+</div>
              <div className="text-sm text-muted-foreground">Services Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">2hr</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
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
        activeFiltersCount={getActiveFiltersCount()}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Services Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredServices.length} Service{filteredServices.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sorted by relevance</span>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or browse all categories
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <EnhancedServiceCard
                  key={service.id}
                  service={service}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(service.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar with Recommendations */}
        <div className="space-y-6">
          <ServiceRecommendations
            type="featured"
            services={featuredServices}
            onServiceClick={(id) => console.log('Navigate to service:', id)}
          />
          
          <ServiceRecommendations
            type="trending"
            services={trendingServices}
            onServiceClick={(id) => console.log('Navigate to service:', id)}
          />
          
          <ServiceRecommendations
            type="recommended"
            services={recommendedServices}
            onServiceClick={(id) => console.log('Navigate to service:', id)}
          />
        </div>
      </div>
    </div>
  );
}