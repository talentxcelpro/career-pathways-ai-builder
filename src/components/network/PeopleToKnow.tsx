import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  TrendingUp, 
  Award, 
  Users, 
  Shield, 
  Crown,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface PeopleCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badgeColor: string;
  people: any[];
}

export const PeopleToKnow = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['people-to-know'],
    queryFn: async () => {
      // Get sample users for each category (in a real app, you'd have proper categorization)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, headline')
        .not('full_name', 'is', null)
        .limit(20);

      if (!profiles) return [];

      // Mock categorization - in real app, you'd have proper user roles/tags
      const shuffled = [...profiles].sort(() => 0.5 - Math.random());
      
      const categories: PeopleCategory[] = [
        {
          id: 'rising',
          title: 'Rising Professionals',
          subtitle: 'Early career standouts',
          icon: <TrendingUp className="h-4 w-4" />,
          badgeColor: 'bg-blue-100 text-blue-700',
          people: shuffled.slice(0, 3)
        },
        {
          id: 'contributors',
          title: 'Top Contributors',
          subtitle: 'Active community members',
          icon: <Award className="h-4 w-4" />,
          badgeColor: 'bg-green-100 text-green-700',
          people: shuffled.slice(3, 6)
        },
        {
          id: 'mentors',
          title: 'Community Mentors',
          subtitle: 'Experienced guides',
          icon: <Users className="h-4 w-4" />,
          badgeColor: 'bg-purple-100 text-purple-700',
          people: shuffled.slice(6, 9)
        },
        {
          id: 'coaches',
          title: 'Verified Career Coaches',
          subtitle: 'Professional development experts',
          icon: <Shield className="h-4 w-4" />,
          badgeColor: 'bg-orange-100 text-orange-700',
          people: shuffled.slice(9, 12)
        },
        {
          id: 'ambassadors',
          title: 'TalentXcel Ambassadors',
          subtitle: 'Platform champions',
          icon: <Crown className="h-4 w-4" />,
          badgeColor: 'bg-yellow-100 text-yellow-700',
          people: shuffled.slice(12, 15)
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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-accent/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-accent-foreground" />
          People to Know
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Grow your network meaningfully.
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-2 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category, categoryIndex) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`${category.badgeColor} border-0`}>
                      {category.icon}
                      <span className="ml-1 text-xs font-medium">{category.title}</span>
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {category.subtitle}
                </p>
                
                <div className="space-y-2">
                  {category.people.slice(0, 3).map((person, index) => (
                    <div 
                      key={person.id} 
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${(categoryIndex * 3 + index) * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <Link to={`/network/people/${person.id}`}>
                          <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-accent/20 transition-all">
                            <AvatarImage src={person.profile_picture_url} />
                            <AvatarFallback className="bg-gradient-to-br from-accent/20 to-primary/20 text-foreground font-semibold text-xs">
                              {generateInitials(person)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link 
                            to={`/network/people/${person.id}`}
                            className="text-sm font-medium text-foreground hover:text-accent transition-colors story-link"
                          >
                            {formatDisplayName(person)}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">
                            {person.title || person.headline || 'Professional'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-accent/10"
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {category.people.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-8 text-muted-foreground hover:text-accent hover:bg-accent/5"
                  >
                    View More {category.title}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
            
            {/* Explore All Button */}
            <div className="pt-4 border-t">
              <Link to="/network/discover">
                <Button variant="outline" className="w-full hover:bg-accent/10 text-sm">
                  <Star className="h-4 w-4 mr-2" />
                  Explore All Categories
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 p-3 bg-muted/50 rounded-full w-fit">
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No featured professionals available at the moment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};