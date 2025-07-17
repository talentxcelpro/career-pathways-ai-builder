
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Award,
  Users,
  Calendar
} from "lucide-react";
import { formatCompactCurrency } from "@/utils/currencyUtils";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock service data - in real app, fetch from API
  const service = {
    id: id || '1',
    title: 'Professional Resume Review & Enhancement',
    description: 'Get your resume professionally reviewed and enhanced by an expert recruiter with 10+ years of experience in Fortune 500 companies.',
    category: 'Career Services',
    service_type: 'review',
    price_type: 'fixed',
    base_price: 2499,
    currency: 'INR',
    delivery_time_days: 3,
    provider_name: 'Priya Sharma',
    provider_avatar: '',
    provider_location: 'Mumbai, India',
    provider_title: 'Senior HR Manager & Career Coach',
    provider_experience: '10+ years',
    provider_email: 'priya.sharma@example.com',
    provider_phone: '+91 98765 43210',
    provider_website: 'https://priyacareercoach.com',
    rating: 4.9,
    reviews_count: 127,
    orders_completed: 89,
    is_featured: true,
    is_verified: true,
    tags: ['Resume Review', 'Career Coaching', 'ATS Optimization', 'Interview Prep'],
    portfolio_items: [
      {
        title: 'Software Engineer Resume Makeover',
        description: 'Complete transformation resulting in 3x more interview calls',
        image: '/api/placeholder/300/200'
      },
      {
        title: 'Marketing Manager Profile Enhancement',
        description: 'Strategic positioning for senior management roles',
        image: '/api/placeholder/300/200'
      }
    ],
    what_included: [
      'Comprehensive resume analysis',
      'ATS optimization',
      'Content enhancement',
      'Format improvements',
      '2 rounds of revisions',
      'LinkedIn profile tips'
    ],
    requirements: 'Please provide your current resume in PDF or DOC format along with target job descriptions.',
    provider_bio: 'Priya is a seasoned HR professional with over 10 years of experience at top Fortune 500 companies including Google, Microsoft, and Amazon. She has reviewed over 5000+ resumes and helped hundreds of professionals land their dream jobs.',
    provider_certifications: [
      'Certified Professional Resume Writer (CPRW)',
      'LinkedIn Talent Solutions Certified',
      'Society for Human Resource Management (SHRM-CP)'
    ],
    payment_methods: ['Bank Transfer', 'UPI', 'PayPal', 'Cash on Delivery'],
    reviews: [
      {
        id: 1,
        user_name: 'Rahul Kumar',
        rating: 5,
        comment: 'Excellent service! Got 5 interview calls within 2 weeks of using the enhanced resume.',
        date: '2024-01-15'
      },
      {
        id: 2,
        user_name: 'Sneha Patel',
        rating: 5,
        comment: 'Very professional and detailed feedback. Worth every penny!',
        date: '2024-01-10'
      }
    ]
  };

  const handleContactProvider = (method: string) => {
    switch (method) {
      case 'email':
        window.open(`mailto:${service.provider_email}`);
        break;
      case 'phone':
        window.open(`tel:${service.provider_phone}`);
        break;
      case 'website':
        window.open(service.provider_website, '_blank');
        break;
      default:
        console.log('Contact via', method);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/services')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={service.provider_avatar} />
                      <AvatarFallback>
                        {service.provider_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-2xl font-bold">{service.provider_name}</h1>
                        {service.is_verified && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-muted-foreground">{service.provider_title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {service.provider_location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {service.provider_experience}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {service.orders_completed} orders completed
                        </div>
                      </div>
                    </div>
                  </div>
                  {service.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Featured Provider
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{service.rating}</span>
                    <span className="text-muted-foreground">
                      ({service.reviews_count} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Delivered in {service.delivery_time_days} days</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Service Description</h3>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">What's Included</h3>
                      <ul className="space-y-2">
                        {service.what_included.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Requirements</h3>
                      <p className="text-muted-foreground">{service.requirements}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Payment Methods Accepted</h3>
                      <div className="flex flex-wrap gap-2">
                        {service.payment_methods.map((method) => (
                          <Badge key={method} variant="outline">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="portfolio" className="space-y-4">
                    {service.portfolio_items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <h4 className="font-medium mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    {service.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{review.user_name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                          <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="about" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">About {service.provider_name}</h3>
                      <p className="text-muted-foreground">{service.provider_bio}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Certifications</h3>
                      <ul className="space-y-2">
                        {service.provider_certifications.map((cert, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-blue-500" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Service Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ₹{formatCompactCurrency(service.base_price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {service.price_type === 'hourly' ? 'per hour' : 
                     service.price_type === 'package' ? 'per package' : 'fixed price'}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    💡 Payment is handled directly between you and the service provider
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Contact Provider</h4>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleContactProvider('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleContactProvider('phone')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleContactProvider('website')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  <p>Negotiate terms and payment directly with the provider</p>
                </div>
              </CardContent>
            </Card>

            {/* Provider Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Orders Completed:</span>
                  <span className="font-medium">{service.orders_completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating:</span>
                  <span className="font-medium">{service.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className="font-medium">Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Time:</span>
                  <span className="font-medium">{service.delivery_time_days} days</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Service Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
