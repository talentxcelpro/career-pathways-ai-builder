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
import { Progress } from "@/components/ui/progress";
import { 
  Search, Star, Clock, DollarSign, User, MessageSquare, Filter, TrendingUp, Plus, 
  IndianRupee, Sparkles, Timer, Shield, Zap, Trophy, Heart, Phone, Video,
  CheckCircle, Award, Target, Flame, Users, ArrowRight, Eye, ThumbsUp,
  BookOpen, Briefcase, Headphones, Camera, PenTool, Code, Crown
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/utils/currencyUtils";
import { motion, AnimatePresence } from "framer-motion";
import { AppleSubscriptionUI } from "@/components/subscription/AppleSubscriptionUI";
import { ServiceDetailDialog } from "./ServiceDetailDialog";

// Load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  urgency_message?: string;
  trust_signals?: string[];
  packages?: ServicePackage[];
  success_stories?: number;
  video_preview?: string;
}

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  delivery_days: number;
  popular?: boolean;
}

interface ServiceRequest {
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
}

const serviceIcons = {
  "Resume Writing": PenTool,
  "Interview Prep": Users,
  "Career Counseling": Target,
  "LinkedIn Profile": Briefcase,
  "Web Development": Code,
  "Design": Camera,
  "Writing": BookOpen,
  "Consultation": Headphones,
  "Video": Video,
  "default": Sparkles
};

const urgencyMessages = [
  "Only 3 slots left today!",
  "Booked 12 times this week",
  "High demand - 89% client satisfaction",
  "Trending now - 24 orders this month",
  "Limited time offer available"
];

const trustSignals = [
  "100% Client Satisfaction",
  "Verified Expert",
  "Money-back Guarantee",
  "24/7 Support",
  "Certified Professional"
];

export default function EnhancedServiceMarketplace() {
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
    averageResponseTime: "",
    successRate: 95,
    totalOrders: 2480
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchStats();
    loadRazorpayScript();
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

      const formattedServices = servicesData?.map((service, index) => ({
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category || "Other",
        service_type: service.pricing_type || "fixed",
        price_type: service.pricing_type || "fixed",
        base_price: service.base_price || service.hourly_rate || 0,
        delivery_time_days: service.delivery_time_days || 1,
        skills_offered: [],
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        reviews_count: Math.floor(Math.random() * 50) + 10,
        orders_completed: Math.floor(Math.random() * 100) + 20,
        is_featured: service.pro_service_profiles?.profiles?.[0]?.pro_status === 'elite',
        is_verified: ['starter', 'business', 'elite'].includes(service.pro_service_profiles?.profiles?.[0]?.pro_status),
        provider_name: service.pro_service_profiles?.profiles?.[0]?.full_name || "Professional Provider",
        provider_location: "Remote",
        provider_response_time: "2-4 hours",
        provider_avatar: "/placeholder.svg",
        provider_badge: service.pro_service_profiles?.profiles?.[0]?.pro_status,
        urgency_message: urgencyMessages[index % urgencyMessages.length],
        trust_signals: trustSignals.slice(0, 3),
        success_stories: Math.floor(Math.random() * 200) + 50,
        packages: generatePackages(service.base_price || 999),
        video_preview: index % 3 === 0 ? "/api/placeholder/video" : undefined
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

  const generatePackages = (basePrice: number): ServicePackage[] => {
    return [
      {
        id: '1',
        name: 'Basic',
        price: basePrice,
        features: ['Standard delivery', 'Basic revisions', 'Email support'],
        delivery_days: 7
      },
      {
        id: '2',
        name: 'Standard',
        price: Math.floor(basePrice * 1.8),
        features: ['Priority delivery', '3 revisions', 'Phone support', 'Express delivery'],
        delivery_days: 3,
        popular: true
      },
      {
        id: '3',
        name: 'Premium',
        price: Math.floor(basePrice * 2.5),
        features: ['24h delivery', 'Unlimited revisions', '24/7 support', 'Video call consultation', 'Money-back guarantee'],
        delivery_days: 1
      }
    ];
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
      setStats({
        totalProviders: 3,
        totalServices: 1,
        averageRating: 4.8,
        averageResponseTime: "2 hours",
        successRate: 95,
        totalOrders: 2480
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

  const handleBookNow = async (service: Service, packageType?: string) => {
    try {
      setLoading(true);
      
      const selectedPackage = service.packages?.[0] || { name: 'Basic', price: service.base_price };
      const packageToUse = service.packages?.find(p => p.name === packageType) || selectedPackage;
      
      // Create Razorpay order via edge function
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: { 
          action: 'create_service_order',
          amount: packageToUse.price,
          currency: 'INR',
          service_id: service.id,
          package_type: packageType || 'Basic'
        }
      });

      if (error) throw error;

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_9999999999999999', // Demo key for testing
        amount: data.amount || packageToUse.price * 100,
        currency: data.currency || 'INR',
        name: 'TalentXcel Pro',
        description: `${service.title} - ${packageToUse.name} Package`,
        order_id: data.id || `order_demo_${Date.now()}`,
        handler: async function (response: any) {
          try {
            // Verify payment via edge function
            const verifyResult = await supabase.functions.invoke('razorpay-payment', {
              body: {
                action: 'verify_service_payment',
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                service_id: service.id,
                package_type: packageType || 'Basic'
              }
            });

            if (verifyResult.error) throw verifyResult.error;

            toast.success(`Payment successful! Booking confirmed for ${service.title}`);
            setSelectedService(null);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com'
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      // Check if Razorpay is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Razorpay SDK failed to load');
        }
      }

      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesServiceType = selectedServiceType === "all" || service.service_type === selectedServiceType;
    const matchesLocation = selectedLocation === "all" || service.provider_location === selectedLocation;
    const matchesPrice = service.base_price >= priceRange[0] && service.base_price <= priceRange[1];
    const matchesRating = service.rating >= minRating;
    const matchesVerified = !verifiedOnly || service.is_verified;

    return matchesSearch && matchesCategory && matchesServiceType && matchesLocation && matchesPrice && matchesRating && matchesVerified;
  });

  const ServiceCard = ({ service }: { service: Service }) => {
    const IconComponent = serviceIcons[service.category as keyof typeof serviceIcons] || serviceIcons.default;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Card className="h-full border border-gray-200/60 bg-white/95 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
          {/* Urgency Banner */}
          {service.urgency_message && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 text-center">
              <Timer className="inline w-3 h-3 mr-1" />
              {service.urgency_message}
            </div>
          )}

          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    {service.is_featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(service.rating) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm font-semibold text-gray-900 ml-1">
                        {service.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({service.reviews_count} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFavorite(service.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(service.id) ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Provider Info */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-8 w-8 border-2 border-gray-200">
                <AvatarImage src={service.provider_avatar} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                  {service.provider_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{service.provider_name}</span>
                  {service.is_verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {service.provider_badge && (
                    <Badge variant="outline" className="text-xs">
                      {service.provider_badge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Responds in {service.provider_response_time}
                  </span>
                  <span className="flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    {service.orders_completed} orders
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {service.description}
            </p>

            {/* Trust Signals */}
            <div className="flex flex-wrap gap-1 mb-4">
              {service.trust_signals?.map((signal, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  {signal}
                </Badge>
              ))}
            </div>

            {/* Pricing & Actions */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{service.base_price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {service.price_type === 'hourly' ? '/hr' : ''}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {service.delivery_time_days} day delivery
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => setSelectedService(service)}
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call Back
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                  onClick={() => handleBookNow(service)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Book Now'}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Success Stories */}
            {service.success_stories && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center">
                    <ThumbsUp className="w-3 h-3 mr-1 text-green-500" />
                    {service.success_stories}+ success stories
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Viewed {Math.floor(Math.random() * 50) + 10} times today
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading amazing services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    TalentXcel Services
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Professional services marketplace - Global ready
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-semibold">{stats.totalProviders}+</span>
                  <span className="text-gray-600">Experts</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="p-1 bg-yellow-100 rounded-lg">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="font-semibold">{stats.averageRating}</span>
                  <span className="text-gray-600">Rating</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-semibold">{stats.successRate}%</span>
                  <span className="text-gray-600">Success</span>
                </div>
              </div>
              
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Custom Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-2xl rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 font-bold text-xl">Request Custom Service</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      toast.success("Request submitted! We'll get back to you soon.");
                      setShowRequestDialog(false);
                      setServiceRequest({
                        title: "",
                        description: "",
                        category: "",
                        budget: "",
                        timeline: ""
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="title">Service Title</Label>
                      <Input
                        id="title"
                        value={serviceRequest.title}
                        onChange={e => setServiceRequest(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={serviceRequest.description}
                        onChange={e => setServiceRequest(prev => ({ ...prev, description: e.target.value }))}
                        required
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={serviceRequest.category}
                        onValueChange={value => setServiceRequest(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        value={serviceRequest.budget}
                        onChange={e => setServiceRequest(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="e.g. ₹500 - ₹2000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeline">Timeline</Label>
                      <Input
                        id="timeline"
                        value={serviceRequest.timeline}
                        onChange={e => setServiceRequest(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="e.g. 2 weeks"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 text-white">
                        Submit Request
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border border-gray-200/60 bg-gradient-to-br from-white/95 via-blue-50/95 to-purple-50/95 shadow-xl rounded-2xl backdrop-blur-md overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 pointer-events-none" />
            <CardContent className="p-8 relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-3"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProviders}+</div>
                  <div className="text-sm text-gray-600 font-medium">Verified Experts</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-3"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalServices}+</div>
                  <div className="text-sm text-gray-600 font-medium">Services</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-3"
                >
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
                  <div className="text-sm text-gray-600 font-medium">Avg Rating</div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center space-y-3"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}+</div>
                  <div className="text-sm text-gray-600 font-medium">Orders Completed</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pro Upgrade Placeholder */}
        <div className="my-2 text-center">
          <a 
            href="/pro/subscription"
            className="inline-flex items-center text-xs text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade to Pro
          </a>
        </div>

        {/* Search and Filters */}
        <div className="my-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search services, providers, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-gray-200/60 bg-white/90 backdrop-blur-sm rounded-xl text-gray-900 font-medium shadow-lg focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-white/90 border-gray-200/60 rounded-xl font-medium">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger className="w-32 bg-white/90 border-gray-200/60 rounded-xl font-medium">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                className="border-gray-200/60 bg-white/90 rounded-xl font-medium"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
              >
                <Shield className={`h-4 w-4 mr-2 ${verifiedOnly ? 'text-green-500' : 'text-gray-400'}`} />
                Verified Only
              </Button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredServices.length} Service{filteredServices.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-gray-600">Discover talented professionals ready to help you succeed</p>
          </div>
        </div>

        {/* Service Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all services</p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedServiceType("all");
              setVerifiedOnly(false);
            }}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Service Detail Dialog */}
      <ServiceDetailDialog
        service={selectedService}
        open={!!selectedService}
        onOpenChange={() => setSelectedService(null)}
        onBookService={handleBookNow}
      />
    </div>
  );
}
