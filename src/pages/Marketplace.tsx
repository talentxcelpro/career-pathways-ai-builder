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
  TrendingUp
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with TalentXcel branding */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
              alt="TalentXcel" 
              className="h-12 w-12 rounded-lg"
            />
            <div>
              <h1 className="text-4xl font-bold text-[#1E2A78] mb-2 font-display">Professional Services Backed by TalentXcel AI</h1>
              <p className="text-xl text-text-secondary max-w-3xl">
                Connect with verified AI-matched professionals and get expert guidance – Powered by TalentXcel AI intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search services, providers, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
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
                <SelectTrigger>
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
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                {filteredServices.length} services found
              </div>
              <Link to="/marketplace/post-service">
                <Button className="bg-[#28C76F] hover:bg-[#28C76F]/90 text-white">
                  Offer Your Services
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const CategoryIcon = getCategoryIcon(service.category);
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(service.category)}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2">{service.category}</Badge>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                      </div>
                    </div>
                    {service.is_verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Provider Info */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={service.provider_avatar} alt={service.provider_name} />
                        <AvatarFallback>{service.provider_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{service.provider_name}</div>
                        <div className="text-sm text-gray-600">{service.experience_years} years experience</div>
                      </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{service.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({service.review_count})</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.response_time} avg response
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {service.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Location and Availability */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {service.location}
                      </div>
                      <div className={`${service.availability.includes('Available') ? 'text-green-600' : 'text-orange-600'}`}>
                        {service.availability}
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-lg font-semibold text-gray-900">
                        <DollarSign className="h-4 w-4" />
                        {service.price_range}
                      </div>
                      <Link to={`/marketplace/${service.id}`}>
                        <Button size="sm" className="bg-[#28C76F] hover:bg-[#28C76F]/90 text-white">
                          View Details
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
