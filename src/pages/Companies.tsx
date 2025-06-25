
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
  Users, 
  Star, 
  Briefcase, 
  Building, 
  Filter,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Sample companies data
  const companies = [
    {
      id: '1',
      name: 'TechCorp Inc.',
      description: 'Leading technology solutions provider specializing in AI and cloud computing',
      logo_url: '/placeholder.svg',
      location: 'San Francisco, CA',
      industry: 'Technology',
      size_range: '1000-5000',
      rating: 4.5,
      reviewCount: 234,
      openJobs: 15,
      employees: 3200,
      founded_year: 2010,
      isFollowing: false
    },
    {
      id: '2',
      name: 'InnovateLab',
      description: 'Innovative product development company focusing on consumer electronics',
      logo_url: '/placeholder.svg',
      location: 'Austin, TX',
      industry: 'Product Development',
      size_range: '100-500',
      rating: 4.2,
      reviewCount: 89,
      openJobs: 8,
      employees: 320,
      founded_year: 2015,
      isFollowing: true
    },
    {
      id: '3',
      name: 'DesignStudio',
      description: 'Creative design and branding agency serving Fortune 500 companies',
      logo_url: '/placeholder.svg',
      location: 'New York, NY',
      industry: 'Design',
      size_range: '50-200',
      rating: 4.7,
      reviewCount: 156,
      openJobs: 5,
      employees: 125,
      founded_year: 2008,
      isFollowing: false
    },
    {
      id: '4',
      name: 'DataDriven Analytics',
      description: 'Big data and analytics solutions for enterprise clients',
      logo_url: '/placeholder.svg',
      location: 'Seattle, WA',
      industry: 'Analytics',
      size_range: '200-1000',
      rating: 4.3,
      reviewCount: 178,
      openJobs: 12,
      employees: 650,
      founded_year: 2012,
      isFollowing: false
    },
    {
      id: '5',
      name: 'GreenTech Solutions',
      description: 'Sustainable technology innovations for a better tomorrow',
      logo_url: '/placeholder.svg',
      location: 'Portland, OR',
      industry: 'Clean Technology',
      size_range: '100-500',
      rating: 4.6,
      reviewCount: 92,
      openJobs: 7,
      employees: 280,
      founded_year: 2018,
      isFollowing: true
    }
  ];

  const industries = ['Technology', 'Product Development', 'Design', 'Analytics', 'Clean Technology', 'Healthcare', 'Finance'];
  const sizeRanges = ['1-50', '50-200', '200-1000', '1000-5000', '5000+'];

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
    const matchesSize = !selectedSize || company.size_range === selectedSize;
    
    return matchesSearch && matchesIndustry && matchesSize;
  });

  const stats = [
    { label: 'Companies', value: '500+', icon: Building },
    { label: 'Open Positions', value: '2.5K+', icon: Briefcase },
    { label: 'Verified Reviews', value: '15K+', icon: Star },
    { label: 'Industries', value: '25+', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Companies</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore top employers, read employee reviews, and find your perfect workplace culture match.
          </p>
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
                    placeholder="Search companies, roles, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sizes</SelectItem>
                  {sizeRanges.map(size => (
                    <SelectItem key={size} value={size}>{size} employees</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={company.logo_url} alt={company.name} />
                      <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium ml-1">{company.rating}</span>
                          <span className="text-sm text-gray-500 ml-1">({company.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={company.isFollowing ? "default" : "outline"}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Heart className={`h-4 w-4 ${company.isFollowing ? 'fill-current' : ''}`} />
                    <span>{company.isFollowing ? 'Following' : 'Follow'}</span>
                  </Button>
                </div>
                <CardDescription className="mt-3">
                  {company.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {company.employees.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{company.industry}</Badge>
                    <Badge variant="outline">Founded {company.founded_year}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-sm text-green-600">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {company.openJobs} open positions
                    </div>
                    <Link to={`/companies/${company.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
