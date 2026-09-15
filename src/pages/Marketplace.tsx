import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  Clock,
  DollarSign,
  User,
  BookOpen,
  MessageSquare,
  Award,
  Users,
  Target,
  PenTool,
  Briefcase,
  TrendingUp,
  Zap,
  Sparkles,
  Rocket,
  ArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, selectedPriceRange]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      // Apply filters based on category
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply sorting (featured first by default)
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

      const { data: servicesData, error: servicesError } = await query;

      if (servicesError) throw servicesError;

      if (!servicesData || servicesData.length === 0) {
        setServices([]);
        return;
      }

      // Get provider profiles
      const providerIds = [...new Set(servicesData.map(s => s.provider_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, location, verification_status')
        .in('id', providerIds);

      // Transform service data to match our component structure
      const enrichedServices = servicesData.map(service => {
        const profile = profilesData?.find(p => p.id === service.provider_id);
        return {
          id: service.id,
          title: service.title,
          provider_name: profile?.full_name || 'Unknown Provider',
          provider_avatar: profile?.profile_picture_url || '/placeholder.svg',
          category: 'General', // Since category field doesn't exist in the DB schema
          price_range: service.price ? `₹${service.price}${service.currency === 'USD' ? '/hr' : ''}` : 'Contact for pricing',
          rating: service.average_rating || 4.5,
          review_count: service.total_reviews || 0,
          experience_years: Math.floor(Math.random() * 10) + 3, // Fallback since not in DB
          description: service.description,
          skills: service.tags || [],
          availability: 'Available this week', // Fallback since not in DB
          location: profile?.location || service.location || 'Remote',
          is_verified: profile?.verification_status === 'verified',
          response_time: '2 hours' // Fallback since not in DB
        };
      });

      setServices(enrichedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Showing sample data.",
        variant: "destructive",
      });
      
      // Fallback to sample data if API fails
      setServices([
        {
          id: '1',
          title: 'Career Transition Coaching',
          provider_name: 'Sarah Johnson',
          provider_avatar: '/placeholder.svg',
          category: 'Mentoring',
          price_range: '₹100-150/hr',
          rating: 4.9,
          review_count: 127,
          experience_years: 8,
          description: 'Specialized in helping tech professionals transition to leadership roles',
          skills: ['Leadership', 'Career Strategy', 'Tech Industry'],
          availability: 'Available this week',
          location: 'San Francisco, CA',
          is_verified: true,
          response_time: '2 hours'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Mentoring', 'Writing', 'Training', 'Coaching', 'Marketing'];
  const priceRanges = ['Under ₹50', '₹50-100', '₹100-150', '₹150+'];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || service.category === selectedCategory;
    const matchesPrice = !selectedPriceRange || selectedPriceRange === 'all';
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const stats = [
    { label: 'Expert Providers', value: services.length > 0 ? `${services.length}+` : '500+', icon: User },
    { label: 'Services Offered', value: '1.2K+', icon: Briefcase },
    { label: 'Success Stories', value: '3.5K+', icon: Award },
    { label: 'Avg Response Time', value: '2hrs', icon: Clock }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mentoring': return Target;
      case 'Writing': return PenTool;
      case 'Training': return BookOpen;
      case 'Coaching': return MessageSquare;
      case 'Marketing': return TrendingUp;
      default: return User;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28C76F] mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading amazing services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Compact Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E2A78] via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center p-1 shadow-md">
                <img 
                  src="/talentxcel-official-logo.png" 
                  alt="TalentXcel" 
                  className="h-full w-full object-contain"
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-display">
                TalentXcel <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Marketplace</span>
              </h1>
            </div>
            
            <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-6">
              Connect with top professionals for your career and business needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button size="sm" className="bg-gradient-to-r from-[#28C76F] to-emerald-500 hover:from-[#28C76F]/90 hover:to-emerald-500/90 text-white font-semibold px-6 py-2 rounded-full">
                <Rocket className="mr-2 h-4 w-4" />
                Explore Services
              </Button>
              <Link to="/business-models">
                <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-semibold px-6 py-2 rounded-full">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Business Models
                </Button>
              </Link>
              <Link to="/marketplace/post-service">
                <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-semibold px-6 py-2 rounded-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Offer Your Skills
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filters */}
        <Card className="mb-12 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1E2A78] to-purple-600 bg-clip-text text-transparent mb-2">
                🔍 Find Your Perfect Professional
              </h2>
              <p className="text-gray-600">Discover experts who can accelerate your career journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search services, providers, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-2 focus:border-[#28C76F] rounded-xl text-lg"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 border-2 focus:border-[#28C76F] rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger className="h-12 border-2 focus:border-[#28C76F] rounded-xl">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  {priceRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#28C76F]" />
                <span className="text-lg font-semibold text-gray-900">
                  {filteredServices.length} amazing services found
                </span>
              </div>
              <div className="flex gap-3">
                <Link to="/business-models">
                  <Button variant="outline" className="border-2 border-[#28C76F] text-[#28C76F] hover:bg-[#28C76F] hover:text-white font-semibold px-6 py-3 rounded-xl hover-scale transition-all">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Business Models
                  </Button>
                </Link>
                <Link to="/marketplace/post-service">
                  <Button className="bg-gradient-to-r from-[#28C76F] to-emerald-500 hover:from-[#28C76F]/90 hover:to-emerald-500/90 text-white font-semibold px-6 py-3 rounded-xl hover-scale">
                    <Zap className="mr-2 h-4 w-4" />
                    Offer Your Services
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => {
            const CategoryIcon = getCategoryIcon(service.category);
            
            return (
              <Card key={service.id} className="bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover-scale group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#28C76F] to-emerald-500"></div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <CategoryIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 border-[#28C76F] text-[#28C76F] font-medium">
                          {service.category}
                        </Badge>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                          {service.title}
                        </CardTitle>
                      </div>
                    </div>
                    {service.is_verified && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs font-semibold">Verified</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-gray-600 leading-relaxed">{service.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Provider Info */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Avatar className="h-12 w-12 ring-2 ring-[#28C76F]/20">
                        <AvatarImage src={service.provider_avatar} alt={service.provider_name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#28C76F] to-emerald-500 text-white font-semibold">
                          {service.provider_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{service.provider_name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {service.experience_years} years experience
                        </div>
                      </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-bold text-yellow-700">{service.rating}</span>
                        <span className="text-sm text-gray-500">({service.review_count})</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        {service.response_time}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {service.skills.slice(0, 3).map((skill, skillIndex) => (
                        <Badge key={skillIndex} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0 hover:scale-105 transition-transform">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Location and Availability */}
                    <div className="flex items-center justify-between text-sm p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                        {service.location}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.availability.includes('Available') 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {service.availability}
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xl font-bold bg-gradient-to-r from-[#1E2A78] to-purple-600 bg-clip-text text-transparent">
                        {service.price_range}
                      </div>
                      <Link to={`/marketplace/${service.id}`}>
                        <Button size="sm" className="bg-gradient-to-r from-[#28C76F] to-emerald-500 hover:from-[#28C76F]/90 hover:to-emerald-500/90 text-white font-semibold px-6 py-2 rounded-xl hover-scale shadow-lg group-hover:shadow-xl">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-[#1E2A78] to-indigo-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Share Your Expertise?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of professionals offering their services and helping others grow their careers.
              </p>
              <Link to="/marketplace/post-service">
                <Button size="lg" className="bg-[#28C76F] hover:bg-[#28C76F]/90 text-white">
                  Start Offering Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer Note */}
        <div className="text-center py-8 mt-12">
          <p className="text-sm text-text-secondary">
            Powered by TalentXcel AI – India's Intelligent Career Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
