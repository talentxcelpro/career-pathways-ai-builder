
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
  GraduationCap, 
  Calendar,
  BookOpen,
  Award,
  Building,
  Star,
  Network,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Share2,
  GitCompare,
  Sparkles
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

const Colleges = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Sample colleges data
  const colleges = [
    {
      id: '1',
      name: 'Indian Institute of Technology Delhi',
      type: 'Government',
      location: 'New Delhi, Delhi',
      logo_url: '/placeholder.svg',
      image_url: '/lovable-uploads/effdb875-ad25-42af-8f36-067d9541fc15.png',
      description: 'Premier engineering institution known for excellence in technical education and cutting-edge research.',
      ranking: 1,
      nationalRank: 1,
      alumni_count: 45000,
      students_count: 8500,
      established: 1961,
      notable_programs: ['Computer Science', 'Engineering', 'Electronics', 'Mechanical'],
      upcoming_events: 3,
      verified_alumni: 2340,
      rating: 4.9,
      placementRate: 95,
      verified: true,
      featured: true,
      tags: ['#1 National', 'Government', 'Featured']
    },
    {
      id: '2',
      name: 'Indian Institute of Technology Bombay',
      type: 'Government',
      location: 'Mumbai, Maharashtra',
      logo_url: '/placeholder.svg',
      image_url: '/placeholder.svg',
      description: 'Leading technological institute with strong industry connections and research excellence.',
      ranking: 2,
      nationalRank: 2,
      alumni_count: 38000,
      students_count: 11500,
      established: 1958,
      notable_programs: ['Engineering', 'Computer Science', 'Management', 'Design'],
      upcoming_events: 5,
      verified_alumni: 1890,
      rating: 4.8,
      placementRate: 92,
      verified: true,
      featured: true,
      tags: ['#2 National', 'Government', 'Featured']
    },
    {
      id: '3',
      name: 'Birla Institute of Technology and Science',
      type: 'Private',
      location: 'Pilani, Rajasthan',
      logo_url: '/placeholder.svg',
      image_url: '/placeholder.svg',
      description: 'Prestigious private institute known for innovative curriculum and entrepreneurship.',
      ranking: 4,
      nationalRank: 15,
      alumni_count: 78000,
      students_count: 45000,
      established: 1964,
      notable_programs: ['Engineering', 'Management', 'Pharmacy', 'Sciences'],
      upcoming_events: 8,
      verified_alumni: 4560,
      rating: 4.6,
      placementRate: 88,
      verified: true,
      featured: false,
      tags: ['#15 National', 'Private', 'Innovation Hub']
    },
    {
      id: '4',
      name: 'Vellore Institute of Technology',
      type: 'Private',
      location: 'Vellore, Tamil Nadu',
      logo_url: '/placeholder.svg',
      image_url: '/placeholder.svg',
      description: 'Modern university with global outlook and strong industry partnerships.',
      ranking: 15,
      nationalRank: 25,
      alumni_count: 32000,
      students_count: 14500,
      established: 1984,
      notable_programs: ['Computer Science', 'Engineering', 'Business', 'Design'],
      upcoming_events: 2,
      verified_alumni: 1230,
      rating: 4.4,
      placementRate: 85,
      verified: true,
      featured: false,
      tags: ['#25 National', 'Private', 'Global']
    }
  ];

  const collegeTypes = ['Government', 'Private', 'Deemed', 'Autonomous'];
  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === 'all' || college.type === selectedType;
    const matchesLocation = !selectedLocation || selectedLocation === 'all' || college.location.includes(selectedLocation);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const stats = [
    { label: 'Total Colleges', value: '1,200+', icon: Building },
    { label: 'Verified Programs', value: '100+', icon: GraduationCap },
    { label: 'Student Reviews', value: '100+', icon: Star },
    { label: 'Placement Rate', value: '85%+', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            TALENTXCEL EDUCATION INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Find the education path that fits your future.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
            Explore Indian colleges, global degrees, scholarships and AI-powered career pathways — backed by verified official evidence.
          </p>

          {/* Goal Search Box (What do you want to become?) */}
          <div className="max-w-2xl mx-auto mt-8 bg-white rounded-3xl p-3 shadow-md border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder='What do you want to become? "AI researcher, software engineer, doctor..."'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-13 text-sm sm:text-base border-0 focus-visible:ring-0 shadow-none text-slate-900 font-medium"
              />
            </div>
            <Button
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0"
              asChild
            >
              <Link to="/colleges/pathway">
                Find My Path <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Unified Education Navigation Tabs */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-8">
            <Button variant="default" size="sm" className="rounded-xl bg-slate-900 text-white font-semibold text-xs h-9" asChild>
              <Link to="/colleges">🇮🇳 Indian Colleges</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs h-9" asChild>
              <Link to="/colleges/global-programs">🌍 Global Degrees & ₹0 Programs</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-purple-700 font-semibold text-xs h-9" asChild>
              <Link to="/colleges/scholarships">🎓 Global Scholarships</Link>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs h-9" asChild>
              <Link to="/colleges/pathway">✨ AI Career Pathway</Link>
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <stat.icon className="h-6 w-6 text-indigo-600 mx-auto mb-1.5" />
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters with glassmorphism */}
        <Card className="mb-12 border-0 bg-white/90 backdrop-blur-apple shadow-apple-medium rounded-2xl">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary h-5 w-5" />
                  <Input
                    placeholder="Search colleges, universities, or programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 text-base">
                  <SelectValue placeholder="Institution Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  {collegeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 text-base">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Colleges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <Card key={college.id} className="overflow-hidden hover:shadow-apple-heavy transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm rounded-2xl group">
              {/* College Image */}
              <ImageWithFallback 
                src={college.image_url}
                alt={`${college.name} campus banner image`}
                width={1280}
                height={720}
                aspect="16/9"
              />
              {college.verified && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-green-500 text-white border-0 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              )}
              <div className="absolute top-4 right-4 z-10">
                <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <CardHeader className="p-6">
                <CardTitle className="text-xl font-bold text-text-primary font-display group-hover:text-primary transition-colors leading-tight">
                  {college.name}
                </CardTitle>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {college.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant={tag.includes('National') ? 'default' : tag === 'Government' ? 'secondary' : 'outline'}
                      className={`text-xs px-2 py-1 rounded-full ${
                        tag.includes('National') ? 'bg-yellow-500 text-white' : 
                        tag === 'Government' ? 'bg-blue-100 text-blue-700' :
                        tag === 'Featured' ? 'bg-purple-500 text-white' :
                        'border-gray-200 text-gray-600'
                      }`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <CardDescription className="mt-3 text-sm leading-relaxed text-text-secondary line-clamp-2">
                  {college.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <div className="space-y-4">
                  {/* Location and Established */}
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {college.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Est. {college.established}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-text-primary">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-semibold">{college.students_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Award className="h-4 w-4 mr-2" />
                      <span className="font-semibold">{college.placementRate}%</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    {/* Primary Apply Button */}
                    <Button 
                      className="w-full rounded-xl text-xs h-8 bg-[#28C76F] hover:bg-[#28C76F]/90 text-white font-semibold"
                    >
                      Apply Now
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                    
                    {/* Secondary Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-xl text-xs h-8 border-gray-200 hover:bg-gray-50"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat AI
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 rounded-xl text-xs h-8 border-gray-200 hover:bg-gray-50"
                      >
                        <GitCompare className="h-3 w-3 mr-1" />
                        Compare
                      </Button>
                      <Link to={`/colleges/${college.id}`} className="flex-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full rounded-xl text-xs h-8 border-gray-200 hover:bg-gray-50"
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredColleges.length === 0 && (
          <div className="text-center py-20">
            <GraduationCap className="h-24 w-24 text-gray-300 mx-auto mb-8" />
            <h3 className="text-2xl font-bold text-text-primary mb-4 font-display">No colleges found</h3>
            <p className="text-xl text-text-secondary">Try adjusting your search criteria or filters.</p>
          </div>
        )}
        
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

export default Colleges;
