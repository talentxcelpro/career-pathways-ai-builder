import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Star, 
  TrendingUp, 
  Award, 
  Users, 
  Shield, 
  Crown,
  UserPlus,
  MapPin,
  Briefcase,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface PeopleCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badgeColor: string;
  people: any[];
}

const Discover = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['discover-people'],
    queryFn: async () => {
      // Get users for each category
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, headline, location, current_company')
        .not('full_name', 'is', null)
        .limit(50);

      if (!profiles) return [];

      // Mock categorization - in real app, you'd have proper user roles/tags
      const shuffled = [...profiles].sort(() => 0.5 - Math.random());
      
      const categories: PeopleCategory[] = [
        {
          id: 'rising',
          title: 'Rising Professionals',
          subtitle: 'Early career standouts making their mark',
          icon: <TrendingUp className="h-4 w-4" />,
          badgeColor: 'bg-blue-100 text-blue-700',
          people: shuffled.slice(0, 8)
        },
        {
          id: 'contributors',
          title: 'Top Contributors',
          subtitle: 'Active community members sharing knowledge',
          icon: <Award className="h-4 w-4" />,
          badgeColor: 'bg-green-100 text-green-700',
          people: shuffled.slice(8, 16)
        },
        {
          id: 'mentors',
          title: 'Community Mentors',
          subtitle: 'Experienced professionals guiding others',
          icon: <Users className="h-4 w-4" />,
          badgeColor: 'bg-purple-100 text-purple-700',
          people: shuffled.slice(16, 24)
        },
        {
          id: 'coaches',
          title: 'Verified Career Coaches',
          subtitle: 'Professional development experts',
          icon: <Shield className="h-4 w-4" />,
          badgeColor: 'bg-orange-100 text-orange-700',
          people: shuffled.slice(24, 32)
        },
        {
          id: 'ambassadors',
          title: 'TalentXcel Ambassadors',
          subtitle: 'Platform champions and advocates',
          icon: <Crown className="h-4 w-4" />,
          badgeColor: 'bg-yellow-100 text-yellow-700',
          people: shuffled.slice(32, 40)
        }
      ];

      return categories;
    }
  });

  const formatDisplayName = (profile: any) => {
    return profile?.full_name || 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Discover Professionals
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect with industry leaders, rising talents, and expert professionals across various fields
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search professionals by name, title, or company..." 
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" className="h-12 px-6">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Categories */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, j) => (
                      <div key={j} className="p-4 border rounded-lg space-y-3">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded"></div>
                          <div className="h-3 bg-muted rounded w-3/4 mx-auto"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-8">
            {categories.map((category, categoryIndex) => (
              <Card key={category.id} className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={`${category.badgeColor} border-0`}>
                          {category.icon}
                          <span className="ml-2 font-medium">{category.title}</span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {category.subtitle}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.people.slice(0, 8).map((person, index) => (
                      <div 
                        key={person.id} 
                        className="group p-4 rounded-lg border hover:border-primary/20 hover:bg-muted/30 transition-all duration-200 animate-fade-in hover-scale"
                        style={{ animationDelay: `${(categoryIndex * 8 + index) * 0.05}s` }}
                      >
                        <div className="text-center space-y-3">
                          <Link to={`/network/people/${person.id}`}>
                            <Avatar className="w-16 h-16 mx-auto ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                              <AvatarImage src={person.profile_picture_url} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold">
                                {generateInitials(person)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          
                          <div className="space-y-1">
                            <Link 
                              to={`/network/people/${person.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors story-link block"
                            >
                              {formatDisplayName(person)}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {person.title || 'Professional'}
                            </p>
                            {person.current_company && (
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/80">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{person.current_company}</span>
                              </div>
                            )}
                            {person.location && (
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/80">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{person.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto mb-6 p-4 bg-muted/50 rounded-full w-fit">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No professionals found</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We're currently building our community of professionals. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;