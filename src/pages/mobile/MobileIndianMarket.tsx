import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Clock,
  Users,
  Star,
  Phone,
  MessageCircle,
  Languages,
  Building,
  GraduationCap,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { IndianMobileOptimizations } from '@/components/mobile/IndianMobileOptimizations';


export const MobileIndianMarket = () => {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState('');
  

  // Tier 2/3 cities with job counts
  const tier2Cities = [
    { name: 'Pune', jobs: 15420, growth: '+12%' },
    { name: 'Jaipur', jobs: 8330, growth: '+8%' },
    { name: 'Lucknow', jobs: 6540, growth: '+15%' },
    { name: 'Kanpur', jobs: 4230, growth: '+6%' },
    { name: 'Nagpur', jobs: 5670, growth: '+10%' },
    { name: 'Indore', jobs: 7890, growth: '+14%' },
    { name: 'Bhopal', jobs: 3450, growth: '+7%' },
    { name: 'Visakhapatnam', jobs: 4560, growth: '+9%' },
    { name: 'Patna', jobs: 2340, growth: '+5%' },
    { name: 'Vadodara', jobs: 6780, growth: '+11%' }
  ];

  // Popular job categories for tier 2/3 cities
  const popularCategories = [
    { 
      name: 'Government Jobs', 
      count: '2.5L+', 
      icon: Building,
      popular: true,
      salaryRange: '₹3-8L',
      description: 'UPSC, SSC, Bank PO, Railway'
    },
    { 
      name: 'Banking & Finance', 
      count: '85K+', 
      icon: IndianRupee,
      popular: true,
      salaryRange: '₹2.5-6L',
      description: 'Bank jobs, Insurance, Finance'
    },
    { 
      name: 'Teaching', 
      count: '1.2L+', 
      icon: GraduationCap,
      popular: true,
      salaryRange: '₹2-5L',
      description: 'Schools, Colleges, Coaching'
    },
    { 
      name: 'Healthcare', 
      count: '65K+', 
      icon: Heart,
      popular: false,
      salaryRange: '₹3-7L',
      description: 'Hospitals, Clinics, Pharma'
    },
    { 
      name: 'Manufacturing', 
      count: '95K+', 
      icon: Building,
      popular: false,
      salaryRange: '₹2.5-5L',
      description: 'Production, Quality, Engineering'
    },
    { 
      name: 'Sales & Marketing', 
      count: '1.1L+', 
      icon: Users,
      popular: true,
      salaryRange: '₹2-6L',
      description: 'Direct sales, Digital marketing'
    }
  ];

  // Quick job application for mobile
  const QuickJobCard = ({ job }: { job: any }) => (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{job.title}</h3>
            <p className="text-xs text-muted-foreground">{job.company}</p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{job.location}</span>
              <IndianRupee className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">{job.salary}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {job.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Call HR
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MessageCircle className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Posted 2 hours ago • 15 applied</span>
        </div>
      </CardContent>
    </Card>
  );

  // Sample jobs for demonstration
  const sampleJobs = [
    {
      id: 1,
      title: 'Bank Clerk',
      company: 'State Bank of India',
      location: 'Jaipur',
      salary: '₹3-4L',
      type: 'Government'
    },
    {
      id: 2,
      title: 'Primary Teacher',
      company: 'Kendriya Vidyalaya',
      location: 'Lucknow',
      salary: '₹2.5-3.5L',
      type: 'Education'
    },
    {
      id: 3,
      title: 'Sales Executive',
      company: 'Asian Paints',
      location: 'Indore',
      salary: '₹2-4L',
      type: 'Sales'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold">TalentXcel</h1>
            <p className="text-xs text-muted-foreground">Jobs for India</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
            >
              <Languages className="h-4 w-4" />
            </Button>
            {!user && (
              <Button size="sm" asChild>
                <Link to="/auth?mode=signup&flow=mobile">Join</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-6">
        {/* Quick Search */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                placeholder="Search jobs in your city..."
                className="w-full"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">Government</Badge>
                <Badge variant="outline" className="text-xs">₹3L+ Salary</Badge>
                <Badge variant="outline" className="text-xs">No Experience</Badge>
                <Badge variant="outline" className="text-xs">Work from Home</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular in Your Region */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">🔥 Popular in Tier 2/3 Cities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularCategories.filter(cat => cat.popular).map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium">{category.count} jobs</span>
                        <span className="text-xs text-muted-foreground">• {category.salaryRange}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Cities Job Count */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Jobs in Your City
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tier2Cities.slice(0, 6).map((city, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <span className="font-medium text-sm">{city.name}</span>
                    <p className="text-xs text-muted-foreground">{city.jobs.toLocaleString()} active jobs</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {city.growth}
                    </Badge>
                    <Button size="sm" variant="ghost" className="ml-2">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Apply Jobs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">⚡ Quick Apply Jobs</h2>
          {sampleJobs.map((job) => (
            <QuickJobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Mobile-specific features */}
        <IndianMobileOptimizations />

        {/* Local language support */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Available in Your Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="justify-start">
                हिंदी में देखें
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                मराठी मध्ये
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                ગુજરાતીમાં
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                தமிழில்
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Join 1 Lakh+ Indians</h3>
                <p className="text-xs text-muted-foreground">
                  Building careers with TalentXcel
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span>4.8 Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>50K+ Hired</span>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link to="/auth?mode=signup&flow=mobile&market=india">
                  Start Your Career Journey
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                🇮🇳 Made in India • For India
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};