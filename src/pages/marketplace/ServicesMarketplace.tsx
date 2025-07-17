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
  SortAsc
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
}

export default function ServicesMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('best-rated');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFreeConsultOnly, setShowFreeConsultOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('career');
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // Try to fetch services with profile data
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        // If there's an error with the join, try fetching services without profiles
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
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
          profile_link: `https://talentxcel.in/profile/user/${service.provider_id}`,
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
          is_verified: true, // All providers are verified
          profile_picture_url: service.profile_picture_url || profileData?.avatar_url || `https://talentxcel.in/profile/user/${service.provider_id}/avatar`,
          profile_link: `https://talentxcel.in/profile/user/${service.provider_id}`,
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
    
    return matchesSearch && matchesCategory;
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
  const categoryServices = categories.reduce((acc, category) => {
    const categoryKey = category.key;
    if (categoryKey === 'all') return acc;
    
    acc[categoryKey] = sortedServices.filter(service => 
      service.tags.some(tag => tag.toLowerCase().includes(categoryKey.toLowerCase()))
    ).slice(0, 6);
    return acc;
  }, {} as Record<string, Service[]>);

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
    <Card className={`hover:shadow-lg transition-all cursor-pointer ${featured ? 'border-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={service.profile_picture_url} alt={service.provider_name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{service.provider_name}</h3>
                {service.is_verified && (
                  <Shield className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{service.professional_title}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{service.provider_location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{service.years_experience}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{service.average_rating.toFixed(1)} ({service.total_reviews})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-3">
          <h4 className="font-semibold text-lg mb-2">{service.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {service.description}
          </p>
          
          {service.whats_included.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {service.whats_included.slice(0, 3).map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    ✓ {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xl font-bold text-primary">
              {formatPrice(service.price, service.currency)}
            </div>
            <div className="text-xs text-muted-foreground">
              Delivered in {service.delivery_time_days} days
            </div>
          </div>
          <div className="flex items-center gap-2">
            {service.contact_email && (
              <Badge variant="outline" className="text-xs">Email</Badge>
            )}
            {service.contact_phone && (
              <Badge variant="outline" className="text-xs">Phone</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            asChild
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Link to={service.profile_link} target="_blank">
              View Profile
            </Link>
          </Button>
          <Button 
            asChild
            size="sm"
            className="flex-1"
          >
            <Link to={`/services/${service.id}`}>
              Book Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              TalentXcel – Professional Services Marketplace
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover and connect with verified experts. Book services directly. Build your dream career.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for services, providers, or skills..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
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
              <SelectTrigger className="w-full lg:w-48">
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
              className="text-sm"
            >
              🟢 Available Now
            </Toggle>
            <Toggle 
              pressed={showFreeConsultOnly}
              onPressedChange={setShowFreeConsultOnly}
              className="text-sm"
            >
              💬 Offers Free Consult
            </Toggle>
          </div>
        </div>

        {/* Featured Professionals */}
        {featuredServices.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">✨ Featured Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} featured />
              ))}
            </div>
          </div>
        )}

        {/* Browse by Category */}
        <div>
          <h2 className="text-2xl font-bold mb-6">🧭 Browse by Category</h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
              {categories.slice(1).map(category => (
                <TabsTrigger key={category.key} value={category.key} className="text-xs">
                  {category.icon}
                  <span className="hidden sm:inline ml-1">{category.label.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.slice(1).map(category => (
              <TabsContent key={category.key} value={category.key}>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">{category.label}</h3>
                  <Separator className="mb-6" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(categoryServices[category.key] || []).map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
                
                {(categoryServices[category.key] || []).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No services found in this category yet.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">💡 Want to Offer Your Services?</h3>
              <p className="text-muted-foreground mb-6">
                🎉 Join TalentXcel as a Verified Professional
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/pro/services">Apply as a Provider</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/help">Read Guidelines</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}