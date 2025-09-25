import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Clock, 
  Star, 
  Search, 
  Plus,
  TrendingUp,
  BookOpen,
  Award,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessModels } from '@/hooks/useBusinessModels';

export const MentorshipExchange: React.FC = () => {
  const { mentorshipSessions, loading } = useBusinessModels();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const expertiseAreas = [
    'all',
    'career_development',
    'technical_skills',
    'leadership',
    'entrepreneurship',
    'design',
    'product_management',
    'sales_marketing'
  ];

  const filteredSessions = mentorshipSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise = selectedExpertise === 'all' || 
                            session.expertise_areas.includes(selectedExpertise);
    const matchesType = selectedType === 'all' || session.session_type === selectedType;
    
    return matchesSearch && matchesExpertise && matchesType;
  });

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'one_time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recurring': return 'bg-green-100 text-green-800 border-green-200';
      case 'package': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatExpertise = (expertise: string) => {
    return expertise.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatSessionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mentorship Exchange</h2>
          <p className="text-muted-foreground">Connect with mentors and grow your career</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Become a Mentor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">78</p>
                <p className="text-sm text-muted-foreground">Active Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">320</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">+18%</p>
                <p className="text-sm text-muted-foreground">Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search mentors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Expertise" />
              </SelectTrigger>
              <SelectContent>
                {expertiseAreas.map(area => (
                  <SelectItem key={area} value={area}>
                    {area === 'all' ? 'All Expertise' : formatExpertise(area)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="package">Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mentorship Sessions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session.mentor_profile?.profile_picture_url} />
                      <AvatarFallback>
                        {session.mentor_profile?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {session.mentor_profile?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.mentor_profile?.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">4.9</span>
                        <span className="text-xs text-muted-foreground">(24 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{session.price_txc}</p>
                    <p className="text-xs text-muted-foreground">TXC</p>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {session.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {session.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {session.duration_minutes}min
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        getSessionTypeColor(session.session_type)
                      )}
                    >
                      {formatSessionType(session.session_type)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {session.expertise_areas.slice(0, 2).map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs mr-2">
                        {formatExpertise(area)}
                      </Badge>
                    ))}
                    {session.expertise_areas.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{session.expertise_areas.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  {session.scheduled_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Next: {new Date(session.scheduled_at).toLocaleDateString()}
                    </div>
                  )}
                  
                  <Button className="w-full">
                    Book Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredSessions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No mentorship sessions found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or be the first to offer mentorship in this area.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Become a Mentor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};