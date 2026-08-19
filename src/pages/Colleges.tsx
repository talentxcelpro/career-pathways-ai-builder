
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
        {/* Education Command Center Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            TALENTXCEL EDUCATION COMMAND CENTER
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4 max-w-4xl mx-auto">
            Find the education path that fits your future.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tell us where you want to go. We'll map degrees, free learning, scholarships and the steps between them.
          </p>

          {/* Conversational Command Box */}
          <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-200/90 text-left space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                What do you want to become?
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder='"I want to become an AI engineer but I can&apos;t afford a traditional college."'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-13 text-sm sm:text-base border-2 border-slate-200 focus:border-indigo-600 rounded-xl text-slate-900 font-medium"
                  />
                </div>
                <Button
                  className="w-full sm:w-auto h-13 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shrink-0 shadow-md shadow-indigo-100"
                  asChild
                >
                  <Link to="/colleges/pathway">
                    Find My Path <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Popular Paths */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Popular paths:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Software Engineer',
                  'AI Researcher',
                  'Doctor',
                  'Data Scientist',
                  'Cybersecurity',
                  'Finance',
                  'Designer',
                  'Architect',
                ].map((item) => (
                  <Link
                    key={item}
                    to="/colleges/pathway"
                    className="px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Four Major Destinations (Explore → Fund → Plan → Achieve) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mt-10 text-left">
            <Link
              to="/colleges"
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 mb-1">
                EXPLORE
              </div>
              <div className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                Degrees &amp; Colleges
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Indian universities and verified tuition-free degrees worldwide.
              </p>
            </Link>

            <Link
              to="/colleges/scholarships"
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-purple-600 mb-1">
                FUND
              </div>
              <div className="font-black text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                Scholarships &amp; Grants
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Find full-funding opportunities to reduce net student cost to ₹0.
              </p>
            </Link>

            <Link
              to="/colleges/pathway"
              className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-indigo-700 mb-1">
                PLAN
              </div>
              <div className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                Career Pathway
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Step-by-step future operating system from your baseline to career.
              </p>
            </Link>

            <Link
              to="/profile"
              className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 mb-1">
                ACHIEVE
              </div>
              <div className="font-black text-white text-base group-hover:text-emerald-300 transition-colors">
                Career Passport
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Verified skill credentials and portfolio for global employers.
              </p>
            </Link>
          </div>
        </div>

        {/* Directory Section Demarcation */}
        <div className="mb-6 pt-6 border-t border-slate-200/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                DISCOVERY DIRECTORY
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Indian Universities &amp; Institutes
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              1,200+ Institutions Indexed · Search, Filter &amp; Compare
            </span>
          </div>
        </div>

        {/* Search and Filters with glassmorphism */}
        <Card className="mb-8 border border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
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
