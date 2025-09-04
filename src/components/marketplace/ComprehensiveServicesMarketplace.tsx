import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Search, 
  Filter,
  Star,
  Crown,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  MessageSquare,
  Bookmark,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Plus,
  Briefcase,
  FileText,
  Video,
  Mic,
  PenTool,
  Code,
  Palette,
  BarChart3,
  Globe,
  Camera
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { TierBadge } from '@/components/ui/tier-badge';

interface ServiceProvider {
  id: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  responseTime: number;
  completedProjects: number;
  isVerified: boolean;
  subscriptionTier: 'starter' | 'business' | 'elite';
  specializations: string[];
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  provider: ServiceProvider;
  pricing: {
    type: 'fixed' | 'hourly' | 'package';
    startingPrice: number;
    currency: string;
  };
  deliveryTime: string;
  features: string[];
  addOns?: Array<{
    name: string;
    price: number;
    description: string;
  }>;
  portfolio: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  orderCount: number;
  isFeatured: boolean;
  isNew: boolean;
}

const serviceCategories = [
  {
    id: 'resume-cv',
    name: 'Resume & CV',
    icon: <FileText className="h-5 w-5" />,
    subcategories: ['Resume Writing', 'CV Design', 'LinkedIn Optimization', 'Cover Letters']
  },
  {
    id: 'career-coaching',
    name: 'Career Coaching',
    icon: <Users className="h-5 w-5" />,
    subcategories: ['Career Consultation', 'Interview Prep', 'Salary Negotiation', 'Career Transition']
  },
  {
    id: 'skill-development',
    name: 'Skill Development',
    icon: <TrendingUp className="h-5 w-5" />,
    subcategories: ['Technical Training', 'Soft Skills', 'Certification Prep', 'Language Learning']
  },
  {
    id: 'portfolio-branding',
    name: 'Portfolio & Branding',
    icon: <Palette className="h-5 w-5" />,
    subcategories: ['Portfolio Design', 'Personal Branding', 'Website Development', 'Social Media']
  },
  {
    id: 'video-audio',
    name: 'Video & Audio',
    icon: <Video className="h-5 w-5" />,
    subcategories: ['Video Resume', 'Presentation Creation', 'Podcast Production', 'Video Interviews']
  },
  {
    id: 'business-consulting',
    name: 'Business Consulting',
    icon: <BarChart3 className="h-5 w-5" />,
    subcategories: ['Business Strategy', 'Market Research', 'Financial Planning', 'Startup Advice']
  }
];

export const ComprehensiveServicesMarketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [deliveryTime, setDeliveryTime] = useState('all');
  const [providerLevel, setProviderLevel] = useState('all');

  // Mock enhanced services data
  const services: Service[] = [
    {
      id: '1',
      title: 'Professional ATS-Optimized Resume Writing',
      description: 'Get a professionally written resume that passes ATS systems and impresses hiring managers. Includes LinkedIn optimization and cover letter.',
      category: 'resume-cv',
      subcategory: 'Resume Writing',
      provider: {
        id: 'p1',
        name: 'Sarah Wilson',
        avatar: '/avatars/sarah.jpg',
        title: 'Senior HR Professional & Resume Writer',
        location: 'Mumbai, India',
        rating: 4.9,
        reviews: 847,
        responseTime: 2,
        completedProjects: 1250,
        isVerified: true,
        subscriptionTier: 'elite',
        specializations: ['ATS Optimization', 'Executive Resumes', 'Tech Industry'],
        hourlyRate: 1500,
        availability: 'available'
      },
      pricing: {
        type: 'package',
        startingPrice: 2999,
        currency: 'INR'
      },
      deliveryTime: '3-5 days',
      features: [
        'ATS-optimized resume',
        'LinkedIn profile optimization',
        'Professional cover letter',
        '2 rounds of revisions',
        'Keyword optimization',
        '30-day support'
      ],
      addOns: [
        { name: 'Rush delivery (24 hours)', price: 1500, description: 'Get your resume in 24 hours' },
        { name: 'Additional revision round', price: 500, description: 'Extra revision beyond included rounds' },
        { name: 'Video consultation', price: 1000, description: '30-min video call for personalized advice' }
      ],
      portfolio: ['/portfolio/resume1.jpg', '/portfolio/resume2.jpg'],
      tags: ['Resume', 'ATS', 'LinkedIn', 'Cover Letter'],
      rating: 4.9,
      reviewCount: 234,
      orderCount: 567,
      isFeatured: true,
      isNew: false
    },
    {
      id: '2',
      title: 'Complete Career Transformation Coaching',
      description: 'Comprehensive 4-week program to help you transition to your dream career. Includes assessments, strategy, networking guidance, and interview prep.',
      category: 'career-coaching',
      subcategory: 'Career Consultation',
      provider: {
        id: 'p2',
        name: 'Rajesh Kumar',
        avatar: '/avatars/rajesh.jpg',
        title: 'Certified Career Coach & Former Tech Executive',
        location: 'Bangalore, India',
        rating: 4.8,
        reviews: 423,
        responseTime: 1,
        completedProjects: 890,
        isVerified: true,
        subscriptionTier: 'business',
        specializations: ['Tech Careers', 'Leadership Development', 'Career Transition'],
        hourlyRate: 2000,
        availability: 'available'
      },
      pricing: {
        type: 'fixed',
        startingPrice: 15000,
        currency: 'INR'
      },
      deliveryTime: '4 weeks',
      features: [
        '4 one-on-one coaching sessions',
        'Career assessment & analysis',
        'Personalized career roadmap',
        'Interview preparation',
        'Networking strategy',
        'LinkedIn profile makeover',
        '3 months email support'
      ],
      portfolio: ['/portfolio/coaching1.jpg', '/portfolio/coaching2.jpg'],
      tags: ['Career Coaching', 'Transition', 'Strategy', 'Interview Prep'],
      rating: 4.8,
      reviewCount: 156,
      orderCount: 234,
      isFeatured: true,
      isNew: false
    },
    {
      id: '3',
      title: 'Interactive Video Resume Creation',
      description: 'Stand out with a professional video resume that showcases your personality and skills. Perfect for creative roles and modern companies.',
      category: 'video-audio',
      subcategory: 'Video Resume',
      provider: {
        id: 'p3',
        name: 'Priya Sharma',
        avatar: '/avatars/priya.jpg',
        title: 'Video Producer & Creative Director',
        location: 'Delhi, India',
        rating: 4.7,
        reviews: 312,
        responseTime: 3,
        completedProjects: 445,
        isVerified: true,
        subscriptionTier: 'business',
        specializations: ['Video Production', 'Creative Content', 'Branding'],
        hourlyRate: 1200,
        availability: 'busy'
      },
      pricing: {
        type: 'package',
        startingPrice: 4999,
        currency: 'INR'
      },
      deliveryTime: '5-7 days',
      features: [
        'Professional video filming',
        'Script writing assistance',
        'Professional editing',
        'Background music',
        'Multiple format delivery',
        '2 revision rounds'
      ],
      portfolio: ['/portfolio/video1.jpg', '/portfolio/video2.jpg'],
      tags: ['Video Resume', 'Creative', 'Branding', 'Production'],
      rating: 4.7,
      reviewCount: 89,
      orderCount: 123,
      isFeatured: false,
      isNew: true
    }
  ];

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'elite': return <Crown className="h-4 w-4" />;
      case 'business': return <Zap className="h-4 w-4" />;
      case 'starter': return <Star className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'business': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'starter': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TieredAccessGuard
      feature="comprehensive_services_marketplace"
      requiredTier="free"
      requiresAuth={false}
    >
      <div className="space-y-6">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">TalentXcel Services Marketplace</h1>
              <p className="text-xl mb-6 opacity-90">
                Connect with verified professionals to accelerate your career growth
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for services (e.g., 'resume writing', 'career coaching'...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base h-12"
                />
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-5 gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="delivery">Fastest Delivery</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-2000">Under ₹2,000</SelectItem>
                    <SelectItem value="2000-5000">₹2,000 - ₹5,000</SelectItem>
                    <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                    <SelectItem value="10000-25000">₹10,000 - ₹25,000</SelectItem>
                    <SelectItem value="over-25000">Over ₹25,000</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={deliveryTime} onValueChange={setDeliveryTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Delivery Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="3days">Up to 3 Days</SelectItem>
                    <SelectItem value="1week">Up to 1 Week</SelectItem>
                    <SelectItem value="2weeks">Up to 2 Weeks</SelectItem>
                    <SelectItem value="1month">Up to 1 Month</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={providerLevel} onValueChange={setProviderLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Provider Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Browse by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All Services</TabsTrigger>
                {serviceCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="hidden sm:inline">{category.name}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {serviceCategories.map((category) => (
                    <Card 
                      key={category.id} 
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {category.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{category.name}</h3>
                        <div className="space-y-1">
                          {category.subcategories.slice(0, 3).map((sub) => (
                            <p key={sub} className="text-xs text-muted-foreground">{sub}</p>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {serviceCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">{category.name} Services</h2>
                      <div className="flex gap-2">
                        {category.subcategories.map((sub) => (
                          <Badge key={sub} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                            {sub}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              {/* Service Header */}
              <div className="relative">
                {service.portfolio[0] && (
                  <img 
                    src={service.portfolio[0]} 
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {service.isFeatured && (
                    <Badge className="bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {service.isNew && (
                    <Badge className="bg-green-500 text-white">New</Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Provider Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <img 
                      src={service.provider.avatar} 
                      alt={service.provider.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {service.provider.isVerified && (
                      <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{service.provider.name}</h4>
                      <Badge className={getTierColor(service.provider.subscriptionTier)}>
                        {getTierIcon(service.provider.subscriptionTier)}
                        <span className="ml-1 capitalize">{service.provider.subscriptionTier}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{service.provider.rating}</span>
                        <span>({service.provider.reviews})</span>
                      </div>
                      <Badge className={getAvailabilityColor(service.provider.availability)}>
                        {service.provider.availability}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">{service.description}</p>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">What's included:</p>
                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {service.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{service.orderCount} orders</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{service.rating} ({service.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Pricing and Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-lg font-bold">
                      ₹{service.pricing.startingPrice.toLocaleString()}
                      {service.pricing.type === 'hourly' && (
                        <span className="text-sm font-normal text-muted-foreground">/hour</span>
                      )}
                    </div>
                    {service.pricing.type === 'package' && (
                      <div className="text-xs text-muted-foreground">Starting price</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button size="sm">
                      Order Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Services
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Become a Provider CTA */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <Crown className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Start Selling Your Services</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals earning with TalentXcel. Share your expertise, build your reputation, and grow your income.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Global Reach</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span>Grow Your Business</span>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="h-5 w-5 mr-2" />
              Start Selling Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </TieredAccessGuard>
  );
};