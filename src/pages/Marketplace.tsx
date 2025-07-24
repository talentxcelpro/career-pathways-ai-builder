import React, { useState } from 'react';
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

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  // Sample marketplace services data
  const services = [
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
    },
    {
      id: '2',
      title: 'Professional Resume Writing',
      provider_name: 'Michael Chen',
      provider_avatar: '/placeholder.svg',
      category: 'Writing',
      price_range: '₹75-125',
      rating: 4.8,
      review_count: 203,
      experience_years: 6,
      description: 'Expert resume writer with 200+ successful placements',
      skills: ['Resume Writing', 'ATS Optimization', 'LinkedIn Profiles'],
      availability: 'Available today',
      location: 'Remote',
      is_verified: true,
      response_time: '1 hour'
    },
    {
      id: '3',
      title: 'Data Science Skill Training',
      provider_name: 'Dr. Emily Rodriguez',
      provider_avatar: '/placeholder.svg',
      category: 'Training',
      price_range: '₹80-120/hr',
      rating: 4.7,
      review_count: 89,
      experience_years: 10,
      description: 'PhD in Data Science, former Google ML engineer',
      skills: ['Python', 'Machine Learning', 'Statistics'],
      availability: 'Booked until next week',
      location: 'New York, NY',
      is_verified: true,
      response_time: '4 hours'
    },
    {
      id: '4',
      title: 'Interview Preparation',
      provider_name: 'James Thompson',
      provider_avatar: '/placeholder.svg',
      category: 'Coaching',
      price_range: '₹60-90/hr',
      rating: 4.6,
      review_count: 156,
      experience_years: 5,
      description: 'Former tech recruiter, specialized in FAANG interviews',
      skills: ['Technical Interviews', 'Behavioral Questions', 'Negotiation'],
      availability: 'Available tomorrow',
      location: 'Seattle, WA',
      is_verified: false,
      response_time: '3 hours'
    },
    {
      id: '5',
      title: 'Personal Brand Building',
      provider_name: 'Lisa Park',
      provider_avatar: '/placeholder.svg',
      category: 'Marketing',
      price_range: '₹90-140/hr',
      rating: 4.9,
      review_count: 94,
      experience_years: 7,
      description: 'Marketing strategist helping professionals build online presence',
      skills: ['Personal Branding', 'Social Media', 'Content Strategy'],
      availability: 'Available this week',
      location: 'Los Angeles, CA',
      is_verified: true,
      response_time: '2 hours'
    },
    {
      id: '6',
      title: 'Executive Communication Skills',
      provider_name: 'Robert Kumar',
      provider_avatar: '/placeholder.svg',
      category: 'Training',
      price_range: '₹120-180/hr',
      rating: 4.8,
      review_count: 67,
      experience_years: 12,
      description: 'Former Fortune 500 executive, communication expert',
      skills: ['Public Speaking', 'Executive Presence', 'Leadership Communication'],
      availability: 'Limited availability',
      location: 'Chicago, IL',
      is_verified: true,
      response_time: '6 hours'
    }
  ];

  const categories = ['Mentoring', 'Writing', 'Training', 'Coaching', 'Marketing'];
  const priceRanges = ['Under ₹50', '₹50-100', '₹100-150', '₹150+'];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    const matchesPrice = !selectedPriceRange; // Simplified for demo
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const stats = [
    { label: 'Expert Providers', value: '500+', icon: User },
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Mentoring': return 'text-blue-600 bg-blue-50';
      case 'Writing': return 'text-green-600 bg-green-50';
      case 'Training': return 'text-purple-600 bg-purple-50';
      case 'Coaching': return 'text-orange-600 bg-orange-50';
      case 'Marketing': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E2A78] via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <img 
                  src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                  alt="TalentXcel" 
                  className="h-12 w-12 rounded-lg"
                />
              </div>
              <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-display animate-fade-in">
              TalentXcel <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Marketplace</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 animate-fade-in">
              ⚡ Connect with <span className="text-yellow-300 font-semibold">top professionals</span> and supercharge your career journey with AI-powered matching
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-[#28C76F] to-emerald-500 hover:from-[#28C76F]/90 hover:to-emerald-500/90 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover-scale">
                <Rocket className="mr-2 h-5 w-5" />
                Explore Services
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-semibold px-8 py-3 rounded-full">
                <Zap className="mr-2 h-5 w-5" />
                Offer Your Skills
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 -mt-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover-scale group">
              <CardContent className="p-6 text-center">
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-[#1E2A78] to-purple-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                  <SelectItem value="">All Categories</SelectItem>
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
                  <SelectItem value="">All Prices</SelectItem>
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
              <Link to="/marketplace/post-service">
                <Button className="bg-gradient-to-r from-[#28C76F] to-emerald-500 hover:from-[#28C76F]/90 hover:to-emerald-500/90 text-white font-semibold px-6 py-3 rounded-xl hover-scale">
                  <Zap className="mr-2 h-4 w-4" />
                  Offer Your Services
                </Button>
              </Link>
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
                      <div className="flex items-center text-xl font-bold bg-gradient-to-r from-[#1E2A78] to-purple-600 bg-clip-text text-transparent">
                        <DollarSign className="h-5 w-5 text-green-600 mr-1" />
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
