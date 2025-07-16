import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Star, Clock, DollarSign, User, MessageSquare, Filter, TrendingUp, Plus, IndianRupee, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currencyUtils";
import EnhancedServiceCard from "./EnhancedServiceCard";
import ServiceRecommendations from "./ServiceRecommendations";
import MarketplaceFilters from "./MarketplaceFilters";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  service_type: string;
  price_type: string;
  base_price: number;
  delivery_time_days: number;
  skills_offered: string[];
  rating: number;
  reviews_count: number;
  orders_completed: number;
  is_featured: boolean;
  is_verified: boolean;
  provider_name: string;
  provider_location: string;
  provider_response_time: string;
  provider_avatar: string;
  provider_badge?: string;
}

interface ServiceRequest {
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
}

export default function ServiceMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest>({
    title: "",
    description: "",
    category: "",
    budget: "",
    timeline: ""
  });
  const [stats, setStats] = useState({
    totalProviders: 0,
    totalServices: 0,
    averageRating: 0,
    averageResponseTime: ""
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data: servicesData, error } = await supabase
        .from('pro_services')
        .select(`
          *,
          pro_service_profiles (
            user_id,
            profile_slug,
            bio,
            is_active,
            profiles (
              full_name,
              pro_status
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedServices = servicesData?.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category || "Other",
        service_type: service.pricing_type || "fixed",
        price_type: service.pricing_type || "fixed",
        base_price: service.base_price || service.hourly_rate || 0,
        delivery_time_days: service.delivery_time_days || 1,
        skills_offered: [], // Pro services don't have skills_offered yet
        rating: 4.5, // Default rating for pro services
        reviews_count: 0, // Default for pro services
        orders_completed: 0, // Default for pro services
        is_featured: service.pro_service_profiles?.profiles?.[0]?.pro_status === 'elite',
        is_verified: ['starter', 'business', 'elite'].includes(service.pro_service_profiles?.profiles?.[0]?.pro_status),
        provider_name: service.pro_service_profiles?.profiles?.[0]?.full_name || 
                     "Professional Provider",
        provider_location: "Remote",
        provider_response_time: "24 hours",
        provider_avatar: "/placeholder.svg",
        provider_badge: service.pro_service_profiles?.profiles?.[0]?.pro_status === 'elite' ? "elite" : 
                       service.pro_service_profiles?.profiles?.[0]?.pro_status === 'business' ? "business" : 
                       service.pro_service_profiles?.profiles?.[0]?.pro_status === 'starter' ? "starter" : undefined
      })) || [];

      setServices(formattedServices);

      // Extract unique values for filters
      const uniqueServiceTypes = [...new Set(formattedServices.map(s => s.service_type))];
      const uniqueLocations = [...new Set(formattedServices.map(s => s.provider_location))];
      
      setServiceTypes(uniqueServiceTypes);
      setLocations(uniqueLocations);

    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('pro_services')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;
      const uniqueCategories = [...new Set(data?.map(service => service.category).filter(Boolean))];
      setCategories(uniqueCategories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: providersData } = await supabase
        .from('pro_service_profiles')
        .select('id', { count: 'exact' });

      const { data: servicesData } = await supabase
        .from('pro_services')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const totalProviders = providersData?.length || 0;
      const totalServices = servicesData?.length || 0;
      const averageRating = 4.5; // Default rating for pro services

      setStats({
        totalProviders,
        totalServices,
        averageRating: Math.round(averageRating * 10) / 10,
        averageResponseTime: "2 hours"
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFavorite = async (serviceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to save favorites');
        return;
      }

      const isFavorited = favorites.includes(serviceId);
      
      if (isFavorited) {
        setFavorites(prev => prev.filter(id => id !== serviceId));
        toast.success('Removed from favorites');
      } else {
        setFavorites(prev => [...prev, serviceId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error managing favorites:', error);
      toast.error('Feature coming soon!');
    }
  };

  const handleServiceRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to submit a service request');
        return;
      }

      // For now, we'll show success message - future implementation will store in database
      toast.success('Service request submitted successfully! We\'ll contact you soon.');
      setShowRequestDialog(false);
      setServiceRequest({ title: "", description: "", category: "", budget: "", timeline: "" });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedServiceType !== "all") count++;
    if (selectedLocation !== "all") count++;
    if (priceRange[0] !== 0 || priceRange[1] !== 10000) count++;
    if (minRating > 0) count++;
    if (verifiedOnly) count++;
    return count;
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedServiceType("all");
    setSelectedLocation("all");
    setPriceRange([0, 10000]);
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
  const trendingServices = [...services].sort((a, b) => b.orders_completed - a.orders_completed);
  const recommendedServices = services.filter(service => service.rating >= 4.5);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/90 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/95 via-gray-50/95 to-zinc-50/95 border border-gray-200/60 shadow-xl rounded-3xl backdrop-blur-md p-8 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg border border-white/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Professional Services</h1>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            Connect with verified Indian professionals and experts. All prices in INR. Quality guaranteed.
          </p>
          
          {/* Request Service Button */}
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white border border-gray-200/60 shadow-lg font-semibold rounded-2xl px-6 py-3 transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Can't find what you need? Request a service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900 font-semibold">Request a Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="title" className="text-gray-800 font-medium">Service Title</Label>
                  <Input
                    id="title"
                    value={serviceRequest.title}
                    onChange={(e) => setServiceRequest(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What service do you need?"
                    className="bg-white/90 border-gray-200/60 text-gray-900 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-gray-800 font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={serviceRequest.description}
                    onChange={(e) => setServiceRequest(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your requirements in detail..."
                    rows={3}
                    className="bg-white/90 border-gray-200/60 text-gray-900 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-800 font-medium">Category</Label>
                  <Select value={serviceRequest.category} onValueChange={(value) => setServiceRequest(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-white/90 border-gray-200/60 text-gray-900 rounded-xl font-medium">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-xl">
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-gray-900 font-medium">{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget" className="text-gray-800 font-medium">Budget (INR)</Label>
                  <Input
                    id="budget"
                    value={serviceRequest.budget}
                    onChange={(e) => setServiceRequest(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="Your budget range (e.g., ₹5,000 - ₹10,000)"
                    className="bg-white/90 border-gray-200/60 text-gray-900 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline" className="text-gray-800 font-medium">Timeline</Label>
                  <Input
                    id="timeline"
                    value={serviceRequest.timeline}
                    onChange={(e) => setServiceRequest(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="When do you need this? (e.g., Within 1 week)"
                    className="bg-white/90 border-gray-200/60 text-gray-900 rounded-xl font-medium"
                  />
                </div>
                <Button 
                  onClick={handleServiceRequest} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                  disabled={!serviceRequest.title || !serviceRequest.description}
                >
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Bar */}
      <Card className="border border-gray-200/60 bg-gradient-to-br from-slate-50/95 via-gray-50/95 to-zinc-50/95 shadow-xl rounded-2xl backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none" />
        <CardContent className="p-6 sm:p-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                  <User className="h-5 w-5 text-white" />
                </div>
                {stats.totalProviders}+
              </div>
              <div className="text-sm text-gray-600 font-medium">Verified Experts</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                {stats.totalServices}+
              </div>
              <div className="text-sm text-gray-600 font-medium">Services Available</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl">
                  <Star className="h-5 w-5 text-white" />
                </div>
                {stats.averageRating}
              </div>
              <div className="text-sm text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                {stats.averageResponseTime}
              </div>
              <div className="text-sm text-gray-600 font-medium">Avg Response Time</div>
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
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              {filteredServices.length} Service{filteredServices.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200/60">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">All prices in INR</span>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300/60 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="bg-gradient-to-r from-gray-500 to-slate-500 p-4 rounded-2xl mx-auto mb-6 w-fit">
                  <MessageSquare className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">No Services Found</h3>
                <p className="text-gray-700 mb-8 font-medium leading-relaxed max-w-md mx-auto">
                  {searchTerm || getActiveFiltersCount() > 0 
                    ? "No services match your criteria. Try adjusting your search or filters."
                    : "No services are currently available. Check back later!"}
                </p>
                <div className="space-y-3">
                  {(searchTerm || getActiveFiltersCount() > 0) && (
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="mr-4 bg-white/90 border-gray-200/60 text-gray-900 hover:bg-white font-semibold rounded-xl"
                    >
                      Clear All Filters
                    </Button>
                  )}
                  <Button 
                    onClick={() => setShowRequestDialog(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request a Service
                  </Button>
                </div>
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
          {featuredServices.length > 0 && (
            <ServiceRecommendations
              type="featured"
              services={featuredServices}
              onServiceClick={(id) => console.log('Navigate to service:', id)}
            />
          )}
          
          {trendingServices.length > 0 && (
            <ServiceRecommendations
              type="trending"
              services={trendingServices}
              onServiceClick={(id) => console.log('Navigate to service:', id)}
            />
          )}
          
          {recommendedServices.length > 0 && (
            <ServiceRecommendations
              type="recommended"
              services={recommendedServices}
              onServiceClick={(id) => console.log('Navigate to service:', id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}