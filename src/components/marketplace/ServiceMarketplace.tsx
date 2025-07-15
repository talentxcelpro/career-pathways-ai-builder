import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, DollarSign, User, MessageSquare, Filter } from "lucide-react";
import { toast } from "sonner";

// Mock data for demonstration
const mockServices = [
  {
    id: "1",
    title: "Professional Resume Review & Optimization",
    description: "Get your resume reviewed by industry experts and optimized for ATS systems",
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
    provider_name: "Sarah Johnson"
  },
  {
    id: "2",
    title: "Mock Interview Session with Feedback",
    description: "Practice your interview skills with experienced professionals and get detailed feedback",
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
    provider_name: "Mike Chen"
  },
  {
    id: "3",
    title: "LinkedIn Profile Optimization",
    description: "Transform your LinkedIn profile to attract recruiters and networking opportunities",
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
    provider_name: "Emily Rodriguez"
  }
];

export default function ServiceMarketplace() {
  const [services, setServices] = useState(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  const categories = [
    "all", "resume", "interview", "career_coaching", "skill_development", 
    "portfolio_review", "linkedin_optimization", "salary_negotiation"
  ];

  const serviceTypes = [
    "all", "consultation", "review", "training", "coaching", "design"
  ];

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under $50", value: "0-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100 - $200", value: "100-200" },
    { label: "Over $200", value: "200+" }
  ];

  const createOrder = (serviceTitle: string, price: number) => {
    toast.success(`Order request sent for ${serviceTitle} - $${price}`);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.skills_offered.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesServiceType = selectedServiceType === "all" || service.service_type === selectedServiceType;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : parseInt(p));
      if (max) {
        matchesPrice = service.base_price >= min && service.base_price <= max;
      } else {
        matchesPrice = service.base_price >= min;
      }
    }

    return matchesSearch && matchesCategory && matchesServiceType && matchesPrice;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Service Marketplace</h2>
        <p className="text-muted-foreground">
          Find professional career services from verified experts
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services, skills, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              {service.is_featured && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1 text-sm font-medium">
                  Featured Service
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">{service.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{service.provider_name}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {service.service_type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {service.description}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-muted-foreground">({service.reviews_count})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{service.orders_completed} completed</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {service.skills_offered.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {service.skills_offered.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{service.skills_offered.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-bold text-lg">
                        ${service.base_price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {service.price_type === 'hourly' ? '/hour' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{service.delivery_time_days} days delivery</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => createOrder(service.title, service.base_price)}
                    className="flex-shrink-0"
                  >
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}