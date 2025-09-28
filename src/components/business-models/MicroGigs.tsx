import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getAvatarProps } from '@/utils/avatarUtils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Search, 
  Plus,
  TrendingUp,
  Users,
  Target,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBusinessModels } from '@/hooks/useBusinessModels';

export const MicroGigs: React.FC = () => {
  const { gigs, loading } = useBusinessModels();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  const categories = [
    'all',
    'development',
    'design',
    'content_writing',
    'marketing',
    'data_entry',
    'consultation',
    'research'
  ];

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || gig.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'all' || gig.urgency_level === selectedUrgency;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatSkills = (skills: string[]) => {
    return skills.slice(0, 3).join(', ') + (skills.length > 3 ? ` +${skills.length - 3}` : '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Micro Gigs</h2>
          <p className="text-muted-foreground">Quick tasks and project opportunities</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Post a Gig
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Active Gigs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-muted-foreground">Freelancers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹4.2k</p>
                <p className="text-sm text-muted-foreground">Avg. Project</p>
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
                <p className="text-2xl font-bold">+45%</p>
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
                  placeholder="Search gigs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : formatCategory(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gigs Grid */}
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
          {filteredGigs.map((gig) => (
            <Card key={gig.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar 
                      {...getAvatarProps(gig.profiles)}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {gig.profiles?.full_name}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          getUrgencyColor(gig.urgency_level)
                        )}
                      >
                        {gig.urgency_level} priority
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      ₹{gig.budget_min}-{gig.budget_max}
                    </p>
                    <p className="text-xs text-muted-foreground">Budget</p>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {gig.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {gig.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {gig.estimated_hours}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {gig.skills_required.length} skills
                    </div>
                    {gig.deadline && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {new Date(gig.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatCategory(gig.category)}
                    </Badge>
                    
                    {gig.skills_required.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Skills: {formatSkills(gig.skills_required)}
                      </p>
                    )}
                  </div>
                  
                  <Button className="w-full">
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGigs.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No gigs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or be the first to post a gig in this category.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post a Gig
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};