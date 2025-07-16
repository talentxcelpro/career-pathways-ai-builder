
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
  Network
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Colleges = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Sample colleges data
  const colleges = [
    {
      id: '1',
      name: 'Stanford University',
      type: 'University',
      location: 'Stanford, CA',
      logo_url: '/placeholder.svg',
      description: 'Leading research university known for innovation and entrepreneurship',
      ranking: 2,
      alumni_count: 45000,
      students_count: 17000,
      established: 1885,
      notable_programs: ['Computer Science', 'Engineering', 'Business', 'Medicine'],
      upcoming_events: 3,
      verified_alumni: 2340,
      rating: 4.8
    },
    {
      id: '2',
      name: 'MIT',
      type: 'Institute',
      location: 'Cambridge, MA',
      logo_url: '/placeholder.svg',
      description: 'Premier institution for science, technology, engineering, and mathematics',
      ranking: 1,
      alumni_count: 38000,
      students_count: 11500,
      established: 1861,
      notable_programs: ['Engineering', 'Computer Science', 'Physics', 'Economics'],
      upcoming_events: 5,
      verified_alumni: 1890,
      rating: 4.9
    },
    {
      id: '3',
      name: 'UC Berkeley',
      type: 'University',
      location: 'Berkeley, CA',
      logo_url: '/placeholder.svg',
      description: 'Top public research university with diverse academic programs',
      ranking: 4,
      alumni_count: 78000,
      students_count: 45000,
      established: 1868,
      notable_programs: ['Engineering', 'Business', 'Public Policy', 'Liberal Arts'],
      upcoming_events: 8,
      verified_alumni: 4560,
      rating: 4.6
    },
    {
      id: '4',
      name: 'Carnegie Mellon',
      type: 'University',
      location: 'Pittsburgh, PA',
      logo_url: '/placeholder.svg',
      description: 'Global research university with strength in technology and arts',
      ranking: 15,
      alumni_count: 32000,
      students_count: 14500,
      established: 1900,
      notable_programs: ['Computer Science', 'Engineering', 'Drama', 'Design'],
      upcoming_events: 2,
      verified_alumni: 1230,
      rating: 4.7
    }
  ];

  const collegeTypes = ['University', 'Institute', 'College', 'Community College'];
  const locations = ['California', 'Massachusetts', 'New York', 'Pennsylvania', 'Texas'];

  const filteredColleges = colleges.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         college.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || college.type === selectedType;
    const matchesLocation = !selectedLocation || college.location.includes(selectedLocation);
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const stats = [
    { label: 'Total Colleges', value: '1,200+', icon: Building },
    { label: 'Verified Programs', value: '100+', icon: GraduationCap },
    { label: 'Student Reviews', value: '100+', icon: Star },
    { label: 'Placement Rate', value: '85%+', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Apple-inspired styling - more compact and engaging */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text-primary mb-2 font-display">
            Discover Your Perfect College
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            AI-powered discovery with comprehensive data on programs, placements, and smart guidance.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" size="sm" className="rounded-xl">Add Your College</Button>
            <Button variant="outline" size="sm" className="rounded-xl">Compare Colleges</Button>
          </div>
        </div>

        {/* Stats with glassmorphism - more compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 bg-white/80 backdrop-blur-apple shadow-apple-light rounded-2xl hover:shadow-apple-medium transition-all duration-300">
              <CardContent className="p-4">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-text-primary font-display mb-1">{stat.value}</div>
                <div className="text-sm text-text-secondary font-medium">{stat.label}</div>
              </CardContent>
            </Card>
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
                  <SelectItem value="">All Types</SelectItem>
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
                  <SelectItem value="">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Colleges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredColleges.map((college) => (
            <Card key={college.id} className="hover:shadow-apple-heavy transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm rounded-2xl group">
              <CardHeader className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 shadow-apple-light">
                      <AvatarImage src={college.logo_url} alt={college.name} />
                      <AvatarFallback className="text-2xl font-bold text-text-primary bg-gray-100">
                        {college.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl font-bold text-text-primary font-display group-hover:text-primary transition-colors">
                        {college.name}
                      </CardTitle>
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 px-3 py-1 rounded-xl">
                          #{college.ranking} Ranked
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="text-base font-semibold ml-2 text-text-primary">{college.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-6 text-base leading-relaxed text-text-secondary">
                  {college.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-6 text-base text-text-secondary">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {college.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {college.students_count.toLocaleString()} students
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3 text-lg">Notable Programs</h4>
                    <div className="flex flex-wrap gap-2">
                      {college.notable_programs.slice(0, 3).map((program, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-3 py-1 border-gray-200 text-text-secondary rounded-xl">
                          {program}
                        </Badge>
                      ))}
                      {college.notable_programs.length > 3 && (
                        <Badge variant="outline" className="text-sm px-3 py-1 border-gray-200 text-text-secondary rounded-xl">
                          +{college.notable_programs.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-base">
                    <div className="flex items-center text-primary">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      {college.verified_alumni.toLocaleString()} verified alumni
                    </div>
                    <div className="flex items-center text-green-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      {college.upcoming_events} events
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link to={`/colleges/${college.id}`}>
                      <Button className="w-full h-12 text-base font-semibold rounded-xl shadow-apple-light hover:shadow-apple-medium transition-all duration-200">
                        Explore Network
                      </Button>
                    </Link>
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
      </div>
    </div>
  );
};

export default Colleges;
