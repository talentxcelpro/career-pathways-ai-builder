import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Sparkles, 
  Target,
  Briefcase,
  GraduationCap,
  TrendingUp,
  MapPin,
  Building,
  RefreshCw,
  Search,
  Filter,
  Zap,
  Star,
  Brain,
  Network
} from 'lucide-react';
import { useEnhancedConnectionSuggestions } from '@/hooks/useEnhancedConnectionSuggestions';
import { Link } from 'react-router-dom';
import { ProfileCompletionPrompt } from './ProfileCompletionPrompt';

type FilterType = 'all' | 'skill_match' | 'location_match' | 'industry_match' | 'title_match';

export const EnhancedSmartConnectAI: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    suggestions,
    isLoading,
    sendConnection,
    isSendingConnection,
    refreshSuggestions,
    currentUserProfile
  } = useEnhancedConnectionSuggestions();

  const filteredSuggestions = suggestions
    .filter(suggestion => {
      // Filter by type
      if (selectedFilter !== 'all' && suggestion.suggestionType !== selectedFilter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          suggestion.full_name?.toLowerCase().includes(searchLower) ||
          suggestion.title?.toLowerCase().includes(searchLower) ||
          suggestion.company?.toLowerCase().includes(searchLower) ||
          suggestion.location?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'skill_match': return 'Similar Skills';
      case 'location_match': return 'Same Location';
      case 'industry_match': return 'Same Industry';
      case 'title_match': return 'Similar Role';
      default: return 'Suggested';
    }
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'skill_match': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'location_match': return 'bg-green-100 text-green-800 border-green-200';
      case 'industry_match': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'title_match': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentUserProfile) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-8 text-center">
          <Target className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Complete Your Profile</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your career information, skills, and interests to get personalized AI-powered connection recommendations.
          </p>
          <Link to="/profile/edit">
            <Button size="lg" className="gap-2">
              <Target className="h-4 w-4" />
              Complete Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Completion Prompt */}
      <ProfileCompletionPrompt />
      {/* Enhanced Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">AI Connect</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      <Zap className="h-3 w-3 mr-1" />
                      Powered by AI
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Network className="h-3 w-3 mr-1" />
                      {suggestions.length} matches found
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                Discover meaningful connections through AI-powered matching based on your career profile, skills, and goals.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={refreshSuggestions}
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', icon: Users },
                { key: 'skill_match', label: 'Skills', icon: Target },
                { key: 'title_match', label: 'Roles', icon: Briefcase },
                { key: 'location_match', label: 'Location', icon: MapPin },
                { key: 'industry_match', label: 'Industry', icon: Building }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(key as FilterType)}
                  className="gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Connections
            {filteredSuggestions.length > 0 && (
              <Badge variant="secondary">{filteredSuggestions.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-14 h-14 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-20"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="w-20 h-8 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredSuggestions.length > 0 ? (
            <div className="space-y-4">
              {filteredSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="group p-5 border rounded-lg hover:shadow-md transition-all bg-gradient-to-r from-background to-muted/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <Link to={`/user/${suggestion.id}`}>
                        <Avatar className="w-14 h-14 cursor-pointer hover:scale-105 transition-transform ring-2 ring-primary/10">
                          <AvatarImage src={suggestion.profile_picture_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {suggestion.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/user/${suggestion.id}`}
                          className="hover:text-primary transition-colors block"
                        >
                          <h4 className="font-semibold text-lg truncate">{suggestion.full_name}</h4>
                        </Link>
                        {suggestion.title && (
                          <p className="text-muted-foreground mb-2 line-clamp-1">{suggestion.title}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          {suggestion.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span className="truncate max-w-32">{suggestion.company}</span>
                            </div>
                          )}
                          {suggestion.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-24">{suggestion.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Match Information */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSuggestionTypeColor(suggestion.suggestionType)}`}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {getSuggestionTypeLabel(suggestion.suggestionType)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {suggestion.matchScore}% match
                          </Badge>
                        </div>

                        {/* Match Reasons */}
                        {suggestion.matchReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {suggestion.matchReasons.slice(0, 3).map((reason, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-accent/50">
                                {reason}
                              </Badge>
                            ))}
                            {suggestion.matchReasons.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{suggestion.matchReasons.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        onClick={() => sendConnection(suggestion.id)}
                        disabled={isSendingConnection}
                        className="gap-2"
                      >
                        <UserPlus className="h-3 w-3" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                {searchTerm 
                  ? `No results for "${searchTerm}". Try different keywords or filters.`
                  : 'Try selecting a different filter or update your profile with more information.'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-2 justify-center">
                  <Link to="/profile/edit">
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={refreshSuggestions}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mentor Matching */}
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5" />
              AI Mentor Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-3">
                <GraduationCap className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Coming Soon</p>
              <p className="text-xs text-muted-foreground">
                AI-powered mentor recommendations based on career stage and goals
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Collaboration Opportunities */}
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              Project Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-3">
                <Network className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Coming Soon</p>
              <p className="text-xs text-muted-foreground">
                Find collaborators for projects, startups, and content creation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};