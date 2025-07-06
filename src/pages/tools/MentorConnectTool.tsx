import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Search,
  Star,
  MapPin,
  Briefcase,
  MessageCircle,
  Calendar,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

const MentorConnectTool = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    industry: '',
    role: '',
    experience: '',
    location: '',
    expertise: ''
  });
  const [mentors, setMentors] = useState<any[]>([]);

  const searchMentors = async () => {
    if (!searchCriteria.industry || !searchCriteria.role) {
      toast.error('Please select industry and role preferences');
      return;
    }

    setIsSearching(true);
    
    // Simulate mentor search
    setTimeout(() => {
      setMentors([
        {
          id: 1,
          name: 'Sarah Johnson',
          title: 'Senior Product Manager at Google',
          experience: '8+ years',
          location: 'San Francisco, CA',
          rating: 4.9,
          expertise: ['Product Strategy', 'Team Leadership', 'User Research'],
          bio: 'Passionate about helping aspiring product managers navigate their career journey. Former startup founder with extensive experience in B2B and B2C products.',
          price: 'Free',
          availability: 'Available this week',
          image: '/api/placeholder/100/100'
        },
        {
          id: 2,
          name: 'Michael Chen',
          title: 'Staff Software Engineer at Microsoft',
          experience: '12+ years',
          location: 'Seattle, WA',
          rating: 4.8,
          expertise: ['System Design', 'Technical Leadership', 'Career Growth'],
          bio: 'Helping engineers advance to senior and staff levels. Specializes in system design, technical interviews, and leadership development.',
          price: '$50/session',
          availability: 'Available next week',
          image: '/api/placeholder/100/100'
        },
        {
          id: 3,
          name: 'Emily Rodriguez',
          title: 'VP of Marketing at Stripe',
          experience: '10+ years',
          location: 'Austin, TX',
          rating: 4.7,
          expertise: ['Growth Marketing', 'Brand Strategy', 'Team Building'],
          bio: 'Marketing leader with expertise in scaling teams and driving growth. Happy to share insights on career progression in marketing.',
          price: '$75/session',
          availability: 'Available in 2 weeks',
          image: '/api/placeholder/100/100'
        }
      ]);
      setIsSearching(false);
      toast.success('Found matching mentors!');
    }, 2000);
  };

  const connectWithMentor = (mentorId: number) => {
    toast.success('Connection request sent! The mentor will be notified.');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Mentor Connect Tool
        </h1>
        <p className="text-gray-600 mt-2">
          Find and connect with industry mentors to accelerate your career growth
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Find Your Mentor</CardTitle>
              <CardDescription>
                Set your preferences to find the perfect mentor match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Industry *</Label>
                <Select 
                  value={searchCriteria.industry} 
                  onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, industry: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Role/Function *</Label>
                <Select 
                  value={searchCriteria.role} 
                  onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineering">Software Engineering</SelectItem>
                    <SelectItem value="product-management">Product Management</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Experience Level</Label>
                <Select 
                  value={searchCriteria.experience} 
                  onValueChange={(value) => setSearchCriteria(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10-15">10-15 years</SelectItem>
                    <SelectItem value="15+">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g., San Francisco, Remote"
                  value={searchCriteria.location}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label>Expertise Area</Label>
                <Input
                  placeholder="e.g., Technical Leadership"
                  value={searchCriteria.expertise}
                  onChange={(e) => setSearchCriteria(prev => ({ ...prev, expertise: e.target.value }))}
                />
              </div>

              <Button 
                onClick={searchMentors}
                disabled={isSearching}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSearching ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Mentors
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Mentor Results */}
        <div className="lg:col-span-2">
          {mentors.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Available Mentors</h2>
                <Badge variant="secondary">{mentors.length} matches</Badge>
              </div>
              
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.image} alt={mentor.name} />
                        <AvatarFallback>{mentor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold">{mentor.name}</h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {mentor.title}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {mentor.experience}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {mentor.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {mentor.rating}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm">{mentor.bio}</p>

                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-green-600">{mentor.price}</span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {mentor.availability}
                            </span>
                          </div>
                          
                          <Button 
                            onClick={() => connectWithMentor(mentor.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Find Your Mentor</h3>
                <p className="text-gray-600 text-center">
                  Set your search criteria and discover mentors who can guide your career journey
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorConnectTool;