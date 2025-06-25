
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
    { label: 'Partner Colleges', value: '250+', icon: Building },
    { label: 'Verified Alumni', value: '50K+', icon: GraduationCap },
    { label: 'Upcoming Events', value: '120+', icon: Calendar },
    { label: 'Career Networks', value: '180+', icon: Network }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Colleges</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with your alma mater, discover alumni networks, and explore career opportunities 
            through academic partnerships.
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
                    placeholder="Search colleges, universities, or programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Institution Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {collegeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <Card key={college.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={college.logo_url} alt={college.name} />
                      <AvatarFallback className="text-lg font-bold">
                        {college.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{college.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">#{college.ranking} Ranked</Badge>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium ml-1">{college.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  {college.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {college.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {college.students_count.toLocaleString()} students
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notable Programs</h4>
                    <div className="flex flex-wrap gap-1">
                      {college.notable_programs.slice(0, 3).map((program, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {program}
                        </Badge>
                      ))}
                      {college.notable_programs.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{college.notable_programs.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-blue-600">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      {college.verified_alumni.toLocaleString()} verified alumni
                    </div>
                    <div className="flex items-center text-green-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {college.upcoming_events} events
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Link to={`/colleges/${college.id}`}>
                      <Button className="w-full">
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
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
