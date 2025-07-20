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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-white/20 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${
        featured ? 'ring-2 ring-primary/30 shadow-xl shadow-primary/5 bg-gradient-to-br from-white to-primary/[0.02]' : ''
      }`}
    >
      {/* Gradient Overlay for Featured */}
      {featured && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />
          <div className="absolute top-6 right-6 z-10">
            <Badge className="bg-gradient-to-r from-primary via-primary/95 to-accent text-white border-none shadow-lg px-3 py-1.5 rounded-full">
              <Sparkles className="h-3 w-3 mr-1.5" />
              <span className="font-semibold">Featured</span>
            </Badge>
          </div>
        </>
      )}
      
      <div className="relative p-8">
        {/* Premium Provider Info */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-3 ring-white/80 shadow-lg">
                <AvatarImage src={service.profile_picture_url} alt={service.provider_name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 text-primary text-lg font-bold">
                  {service.provider_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {service.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-xl text-foreground">{service.provider_name}</h3>
                {service.is_verified && (
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 px-2 py-0.5 text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground font-medium mb-2">{service.professional_title}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{service.provider_location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{service.years_experience}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Title & Description */}
        <div className="mb-6">
          <h4 className="font-bold text-2xl mb-3 text-foreground line-clamp-2 leading-tight">{service.title}</h4>
          <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed text-base">
            {service.description}
          </p>
          
          {/* What's Included - Enhanced */}
          {service.whats_included.length > 0 && (
            <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl p-4 mb-4 border border-green-100/50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">What's Included</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {service.whats_included.slice(0, 3).map((item, index) => (
                  <Badge key={index} className="bg-white/80 text-green-700 border-green-200/50 px-3 py-1 rounded-full text-xs font-medium">
                    ✓ {item}
                  </Badge>
                ))}
                {service.whats_included.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-border/50 rounded-full">
                    +{service.whats_included.length - 3} more included
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rating & Reviews - Enhanced */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 rounded-2xl border border-yellow-100/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-bold text-foreground">{service.average_rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({service.total_reviews} reviews)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100/50 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">{service.total_orders} completed</span>
            </div>
          </div>
        </div>

        {/* Pricing & Delivery - Premium */}
        <div className="flex items-end justify-between mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
          <div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatPrice(service.price, service.currency)}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Delivered in {service.delivery_time_days} days</span>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="flex flex-col gap-2 items-end">
            <div className="flex flex-wrap gap-1.5 justify-end">
              {service.payment_methods.slice(0, 2).map((method, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-white/50 border-border/30 rounded-full">
                  {method}
                </Badge>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Payment options</span>
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50/30 rounded-xl border border-blue-100/50">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Available via:</span>
          <div className="flex gap-2">
            {service.contact_preferences.map((pref, index) => (
              <Badge key={index} className="bg-blue-100/50 text-blue-700 border-blue-200/50 px-2 py-1 rounded-full text-xs">
                {pref}
              </Badge>
            ))}
          </div>
        </div>

        {/* Premium Action Buttons */}
        <div className="flex gap-3">
          <Button 
            asChild
            variant="outline" 
            size="lg"
            className="flex-1 border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded-xl py-3 font-semibold transition-all duration-300"
          >
            <Link to={service.profile_link} target="_blank" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </Button>
          <Button 
            asChild
            size="lg"
            className="flex-1 bg-gradient-to-r from-primary via-primary/95 to-accent hover:from-primary/90 hover:via-primary/85 hover:to-accent/90 rounded-xl py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to={`/services/${service.id}`} className="flex items-center gap-2">
              <span>Book Now</span>
              <ChevronRight className="h-4 w-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-white">
      {/* Compact Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative container mx-auto px-6 py-6">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
            >
              {/* Energetic Hero with Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.25, 0.25, 0, 1] }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 rounded-3xl blur-xl animate-pulse" />
                <h1 className="relative text-lg md:text-xl lg:text-2xl font-bold tracking-tight mb-2 text-white leading-tight">
                  <span className="block bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent animate-fade-in">
                    Empowering every professional to do meaningful work, grow continuously, and connect with purpose
                  </span>
                </h1>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-sm lg:text-base text-gray-300 mb-4 leading-relaxed max-w-2xl mx-auto font-light"
              >
                Join a marketplace where talent meets opportunity. 
                <span className="text-green-400 font-semibold"> Build your career.</span>
                <span className="text-blue-400 font-semibold"> Scale your impact.</span>
              </motion.p>
              
              {/* Search Interface - Primary CTA */}
              <div className="max-w-2xl mx-auto mb-12">
                <div className="bg-white rounded-2xl p-2 shadow-2xl">
                  <div className="flex">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search by role, skills, or keywords"
                        className="pl-12 h-14 border-0 text-lg placeholder:text-gray-500 focus:ring-0 focus:outline-none bg-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button 
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 h-14 rounded-xl font-semibold"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="mb-8">
                <p className="text-white/80 mb-4 text-sm font-semibold tracking-wide">POPULAR SEARCHES</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Design my mobile app', 'Hire a virtual assistant', 'AI/ML consultant', 'Build my website', 'Marketing strategy'].map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 rounded-full px-4 py-2 font-medium backdrop-blur-sm"
                      onClick={() => setSearchTerm(search)}
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Premium Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12 -mt-10 relative z-10"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-4xl mx-auto">
            {/* Search Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Find Your Perfect Expert</h2>
              <p className="text-muted-foreground">Browse thousands of verified professionals</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search for services, providers, or skills..."
                  className="pl-14 h-14 bg-background border-border/50 rounded-2xl text-lg placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-64 h-14 bg-background border-border/50 rounded-2xl text-lg">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                  {categories.map(category => (
                    <SelectItem key={category.key} value={category.key} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-lg bg-primary/10 text-primary">
                          {category.icon}
                        </div>
                        <span className="font-medium">{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 h-14 bg-background border-border/50 rounded-2xl text-lg">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-5 w-5 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                  <SelectItem value="best-rated" className="py-3">⭐ Best Rated</SelectItem>
                  <SelectItem value="most-booked" className="py-3">🔥 Most Booked</SelectItem>
                  <SelectItem value="newest" className="py-3">✨ Newest</SelectItem>
                  <SelectItem value="price-low" className="py-3">💰 Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="py-3">💎 Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Smart Quick Filters */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-border/30">
              <Toggle
                pressed={showAvailableOnly}
                onPressedChange={setShowAvailableOnly}
                className="px-4 py-2 rounded-xl bg-white border border-border/50 hover:bg-primary/5 hover:border-primary/30 data-[state=on]:bg-primary data-[state=on]:text-white"
              >
                🟢 Available Now
              </Toggle>
              <Badge variant="outline" className="px-4 py-2 rounded-xl border-border/50 bg-white">
                {sortedServices.length} services found
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Premium Featured Services */}
        {featuredServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Featured Excellence</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Premium 
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Professionals</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hand-picked experts with exceptional track records and outstanding results
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <ServiceCard service={service} featured />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">All Services</h2>
              <p className="text-muted-foreground">Discover your perfect professional match</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{sortedServices.length}</p>
              <p className="text-sm text-muted-foreground">services available</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
          
          {sortedServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-20"
            >
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto border border-white/20">
                <div className="text-muted-foreground/50 mb-6">
                  <MessageCircle className="h-20 w-20 mx-auto mb-4" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">No services found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search criteria or explore different categories</p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl"
                >
                  Reset Filters
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}