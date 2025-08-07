import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Star, Download, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  location: string;
  job_title: string;
  experience_years: number;
  skills: string[];
  availability: string;
  match_score?: number;
  profile_photo_url?: string;
  last_active: string;
}

export const TalentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    experience: '',
    availability: '',
    skills: [] as string[],
    education: '',
    remote: false
  });
  const [searchResults, setSearchResults] = useState<TalentProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for demonstration
  const mockProfiles: TalentProfile[] = [
    {
      id: '1',
      full_name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      location: 'Bangalore, India',
      job_title: 'Senior Software Engineer',
      experience_years: 5,
      skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
      availability: 'Open to opportunities',
      match_score: 95,
      last_active: '2 days ago'
    },
    {
      id: '2',
      full_name: 'Rahul Patel',
      email: 'rahul.patel@email.com',
      location: 'Mumbai, India',
      job_title: 'Data Scientist',
      experience_years: 3,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'R'],
      availability: 'Available immediately',
      match_score: 88,
      last_active: '1 week ago'
    }
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockProfiles);
      setIsSearching(false);
    }, 1000);
  };

  const availabilityColors = {
    'Open to opportunities': 'bg-green-100 text-green-800',
    'Available immediately': 'bg-blue-100 text-blue-800',
    'Not looking': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Talent Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search by name, skills, job title, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={selectedFilters.location} onValueChange={(value) => 
                setSelectedFilters(prev => ({ ...prev, location: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Experience</Label>
              <Select value={selectedFilters.experience} onValueChange={(value) => 
                setSelectedFilters(prev => ({ ...prev, experience: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Any experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="2-3">2-3 years</SelectItem>
                  <SelectItem value="4-6">4-6 years</SelectItem>
                  <SelectItem value="7-10">7-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={selectedFilters.availability} onValueChange={(value) => 
                setSelectedFilters(prev => ({ ...prev, availability: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Any availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Available immediately</SelectItem>
                  <SelectItem value="open">Open to opportunities</SelectItem>
                  <SelectItem value="passive">Passive candidate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Remote Work</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="remote"
                  checked={selectedFilters.remote}
                  onCheckedChange={(checked) => 
                    setSelectedFilters(prev => ({ ...prev, remote: checked as boolean }))
                  }
                />
                <Label htmlFor="remote" className="text-sm">Open to remote work</Label>
              </div>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <Input
              placeholder="e.g., React, Python, AWS (comma separated)"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results ({searchResults.length} profiles found)</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export List
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Save Search
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.profile_photo_url} />
                        <AvatarFallback className="text-lg">
                          {profile.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{profile.full_name}</h3>
                          {profile.match_score && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              {profile.match_score}% match
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-foreground mb-2">{profile.job_title}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{profile.experience_years} years exp.</span>
                          </div>
                          <span>Last active: {profile.last_active}</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          <Badge 
                            className={availabilityColors[profile.availability] || 'bg-gray-100 text-gray-800'}
                          >
                            {profile.availability}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {profile.skills.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {profile.skills.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{profile.skills.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download CV
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination would go here */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Badge variant="outline">Page 1 of 1</Badge>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {searchResults.length === 0 && searchQuery && !isSearching && (
        <Card>
          <CardContent className="py-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <div className="text-sm text-muted-foreground">Total Profiles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">892</div>
            <div className="text-sm text-muted-foreground">Active Candidates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <div className="text-sm text-muted-foreground">New This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">324</div>
            <div className="text-sm text-muted-foreground">Profile Views</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};