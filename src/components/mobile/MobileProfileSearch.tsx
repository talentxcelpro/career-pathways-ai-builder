import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, UserPlus, MessageCircle, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usePeopleSearch } from '@/hooks/usePeopleSearch';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

export const MobileProfileSearch: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'people' | 'all'>('people');
  
  const {
    searchTerm,
    setSearchTerm,
    results: peopleResults,
    isLoading: peopleLoading,
    hasSearch
  } = usePeopleSearch();

  const {
    searchTerm: globalSearchTerm,
    handleSearch: handleGlobalSearch,
    results: globalResults,
    isLoading: globalLoading
  } = useGlobalSearch();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleGlobalSearch(value);
  };

  const handleProfileClick = (profile: any) => {
    const username = profile.username || profile.id;
    navigate(`/profile/${username}`);
  };

  const currentResults = activeTab === 'people' ? peopleResults : globalResults;
  const isLoading = activeTab === 'people' ? peopleLoading : globalLoading;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search Header */}
      <div className="p-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search professionals..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-10 rounded-full bg-background/50 border-border/50"
          />
        </div>
        
        {/* Search Tabs */}
        <div className="flex mt-3 gap-1">
          <Button
            variant={activeTab === 'people' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('people')}
            className="rounded-full text-xs h-7"
          >
            People
          </Button>
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="rounded-full text-xs h-7"
          >
            All
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-auto">
        {!hasSearch && !globalSearchTerm ? (
          <div className="p-6 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Find Professionals</h3>
            <p className="text-sm text-muted-foreground">
              Search for people by name, company, or skills
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center space-x-3 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {currentResults.map((result: any) => {
              if (activeTab === 'people' || result.type === 'user') {
                const profile = activeTab === 'people' ? result : result;
                return (
                  <Card 
                    key={profile.id} 
                    className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleProfileClick(profile)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={profile.profile_picture_url || profile.avatar} 
                          alt={profile.full_name || profile.title} 
                        />
                        <AvatarFallback>
                          {(profile.full_name || profile.title || 'U').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {profile.full_name || profile.title || 'Unknown User'}
                        </h3>
                        {profile.title && (
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {profile.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {profile.location}
                              </span>
                            </div>
                          )}
                          {profile.industry && (
                            <Badge variant="secondary" className="text-xs h-4">
                              {profile.industry}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProfileClick(profile);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Connect functionality
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              } else {
                // Handle other search result types (posts, hashtags)
                return (
                  <Card 
                    key={result.id} 
                    className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(result.url)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {result.type === 'post' ? (
                          <MessageCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Search className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {result.title}
                        </h3>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">
                          {result.type}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              }
            })}

            {currentResults.length === 0 && (hasSearch || globalSearchTerm) && (
              <div className="p-6 text-center">
                <div className="text-muted-foreground mb-2">No results found</div>
                <p className="text-xs text-muted-foreground">
                  Try different keywords or check spelling
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};