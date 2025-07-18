import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  User, 
  MessageCircle,
  Shield,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  TrendingUp,
  Calculator,
  Scale,
  BookOpen,
  ChevronRight,
  Filter,
  SortAsc,
  ExternalLink,
  Plus,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Service {
  id: string;
  provider_id: string;
  title: string;
  professional_title: string;
  years_experience: string;
  location: string;
  description: string;
  whats_included: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  is_active: boolean;
  is_featured: boolean;
  average_rating: number;
  total_reviews: number;
  total_orders: number;
  tags: string[];
  contact_email: boolean;
  contact_phone: boolean;
  contact_website: boolean;
  website_url: string;
  phone_number: string;
  created_at: string;
  provider_name: string;
  provider_avatar: string;
  provider_location: string;
  is_verified: boolean;
  portfolio_files: string[];
  profile_picture_url: string;
  profile_link: string;
  status: string;
  contact_preferences: string[];
  payment_methods: string[];
}

export default function ServicesMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('best-rated');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('career');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data: servicesData, error } = await supabase
        .from('services')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            location,
            title
          )
        `)
        .eq('is_active', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        // Fallback without profiles
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          toast({
            title: "Error",
            description: "Failed to load services. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const transformedServices = fallbackData?.map(service => ({
          ...service,
          provider_name: 'Professional Provider',
          provider_avatar: '',
          provider_location: service.location || 'Location not specified',
          is_verified: true,
          profile_picture_url: service.profile_picture_url || `https://talentxcel.in/profile/user/${service.provider_id}/avatar`,
          profile_link: service.profile_link || `https://talentxcel.in/profile/user/${service.provider_id}`,
          contact_preferences: service.contact_preferences || [],
          payment_methods: service.payment_methods || []
        })) || [];

        setServices(transformedServices);
        return;
      }

      const transformedServices = servicesData?.map(service => {
        const profileData = service.profiles as any;
        return {
          ...service,
          provider_name: profileData?.full_name || 'Professional Provider',
          provider_avatar: profileData?.avatar_url || '',
          provider_location: service.location || profileData?.location || 'Location not specified',
          is_verified: true,
          profile_picture_url: service.profile_picture_url || profileData?.avatar_url || `https://talentxcel.in/profile/user/${service.provider_id}/avatar`,
          profile_link: service.profile_link || `https://talentxcel.in/profile/user/${service.provider_id}`,
          contact_preferences: service.contact_preferences || [],
          payment_methods: service.payment_methods || []
        };
      }) || [];

      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: 'all', label: 'All Services', icon: <Briefcase className="h-4 w-4" /> },
    { key: 'career', label: 'Career & Resume', icon: <Briefcase className="h-4 w-4" /> },
    { key: 'coaching', label: 'Coaching & Mentorship', icon: <User className="h-4 w-4" /> },
    { key: 'tech', label: 'Tech & Development', icon: <Code className="h-4 w-4" /> },
    { key: 'design', label: 'Design & Creative', icon: <Palette className="h-4 w-4" /> },
    { key: 'business', label: 'Business & Finance', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'legal', label: 'Legal & Compliance', icon: <Scale className="h-4 w-4" /> },
    { key: 'education', label: 'Education & Training', icon: <BookOpen className="h-4 w-4" /> },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || service.tags.some(tag => 
      tag.toLowerCase().includes(selectedCategory.toLowerCase())
    );
    
    const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'best-rated':
        return b.average_rating - a.average_rating;
      case 'most-booked':
        return b.total_orders - a.total_orders;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const featuredServices = sortedServices.filter(service => service.is_featured).slice(0, 3);

  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    
    return `${currencySymbols[currency] || currency}${price.toLocaleString()}`;
  };

  const ServiceCard: React.FC<{ service: Service; featured?: boolean }> = ({ service, featured = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-primary/30 transition-all duration-300 ${
        featured ? 'ring-2 ring-primary/20 shadow-lg' : 'hover:shadow-xl'
      }`}
    >
      {featured && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-none">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}
      
      <div className="p-6">
        {/* Provider Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 ring-2 ring-white/50 shadow-sm">
              <AvatarImage src={service.profile_picture_url} alt={service.provider_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5">
                <User className="h-6 w-6 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-slate-800">{service.provider_name}</h3>
                {service.is_verified && (
                  <Shield className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-slate-600 mb-1">{service.professional_title}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{service.provider_location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{service.years_experience}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Title & Description */}
        <div className="mb-4">
          <h4 className="font-semibold text-xl mb-2 text-slate-800 line-clamp-2">{service.title}</h4>
          <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">
            {service.description}
          </p>
          
          {/* What's Included */}
          {service.whats_included.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {service.whats_included.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {item}
                </Badge>
              ))}
              {service.whats_included.length > 3 && (
                <Badge variant="outline" className="text-xs text-slate-500">
                  +{service.whats_included.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-slate-700">{service.average_rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">({service.total_reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-slate-500">{service.total_orders} completed</span>
          </div>
        </div>

        {/* Pricing & Delivery */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {formatPrice(service.price, service.currency)}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Delivered in {service.delivery_time_days} days
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="flex flex-wrap gap-1">
            {service.payment_methods.slice(0, 2).map((method, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {method}
              </Badge>
            ))}
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">Contact:</span>
          {service.contact_preferences.map((pref, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {pref}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            asChild
            variant="outline" 
            size="sm"
            className="flex-1 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          >
            <Link to={service.profile_link} target="_blank" className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              View Profile
            </Link>
          </Button>
          <Button 
            asChild
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          >
            <Link to={`/services/${service.id}`}>
              Book Now
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Professional Services Marketplace
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Discover and connect with verified experts. Book services directly. Build your dream career.
              </p>
              
              {/* CTA for Providers */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white px-8 py-3 rounded-full"
                >
                  <Link to="/marketplace/post-service" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Become a Provider
                  </Link>
                </Button>
                <p className="text-sm text-slate-500">
                  Join 500+ verified professionals earning on TalentXcel
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200/50">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search for services, providers, or skills..."
                  className="pl-12 h-12 bg-white/80 border-slate-200/50 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 h-12 bg-white/80 border-slate-200/50 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.key} value={category.key}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 h-12 bg-white/80 border-slate-200/50 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best-rated">Best Rated</SelectItem>
                  <SelectItem value="most-booked">Most Booked</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Toggle 
                pressed={showAvailableOnly}
                onPressedChange={setShowAvailableOnly}
                className="text-sm rounded-full data-[state=on]:bg-green-100 data-[state=on]:text-green-700"
              >
                🟢 Available Now
              </Toggle>
            </div>
          </div>
        </motion.div>

        {/* Featured Services */}
        {featuredServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-slate-800">Featured Professionals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} featured />
              ))}
            </div>
          </motion.div>
        )}

        {/* All Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-800">All Services</h2>
            <p className="text-slate-600">{sortedServices.length} services available</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          
          {sortedServices.length === 0 && (
            <div className="text-center py-16">
              <div className="text-slate-400 mb-4">
                <MessageCircle className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No services found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}