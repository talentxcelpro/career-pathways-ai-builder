import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Star, Download, Eye, RefreshCw, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  resume_url?: string;
  last_active: string;
}

export const TalentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    location: 'all',
    experience: 'all',
    availability: 'all',
    remote: false
  });
  const [searchResults, setSearchResults] = useState<TalentProfile[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isSearching, setIsSearching] = useState(false);

  const fetchCandidates = async (query = '', filters = selectedFilters) => {
    setIsSearching(true);
    try {
      let q = supabase
        .from('unified_candidates')
        .select('*', { count: 'exact' });

      if (query.trim()) {
        const term = `%${query.trim()}%`;
        q = q.or(`name.ilike.${term},title.ilike.${term},location.ilike.${term},description.ilike.${term}`);
      }

      if (filters.location && filters.location !== 'all') {
        q = q.ilike('location', `%${filters.location}%`);
      }

      if (filters.experience && filters.experience !== 'all') {
        const expNum = parseInt(filters.experience, 10);
        if (!isNaN(expNum)) {
          q = q.gte('experience_years', expNum);
        }
      }

      const { data, count, error } = await q
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      setTotalCount(count || 0);

      const mapped: TalentProfile[] = (data || []).map((c: any) => {
        let skillsArr: string[] = [];
        if (Array.isArray(c.skills)) {
          skillsArr = c.skills;
        } else if (typeof c.skills === 'string') {
          skillsArr = c.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recently';

        return {
          id: c.id,
          full_name: c.name || 'Candidate',
          email: c.email || 'Confidential',
          location: c.location || 'India',
          job_title: c.title || c.company || 'Professional',
          experience_years: c.experience_years || 0,
          skills: skillsArr,
          availability: c.looking_for_job ? 'Open to opportunities' : 'Available immediately',
          profile_photo_url: c.profile_picture_url || undefined,
          resume_url: c.resume_url || undefined,
          last_active: dateStr
        };
      });

      setSearchResults(mapped);
    } catch (err: any) {
      console.error('Failed to search candidates:', err);
      toast.error('Search error: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearch = () => {
    fetchCandidates(searchQuery, selectedFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const availabilityColors: Record<string, string> = {
    'Open to opportunities': 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    'Available immediately': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    'Not looking': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Live Candidate Talent Search
            </span>
            <Button variant="outline" size="sm" onClick={() => fetchCandidates(searchQuery, selectedFilters)} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search candidates by name, job title, skills, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Select 
                value={selectedFilters.location} 
                onValueChange={(val) => {
                  const updated = { ...selectedFilters, location: val };
                  setSelectedFilters(updated);
                  fetchCandidates(searchQuery, updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Noida">Noida / Delhi NCR</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum Experience</Label>
              <Select 
                value={selectedFilters.experience} 
                onValueChange={(val) => {
                  const updated = { ...selectedFilters, experience: val };
                  setSelectedFilters(updated);
                  fetchCandidates(searchQuery, updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Experience</SelectItem>
                  <SelectItem value="1">1+ Years</SelectItem>
                  <SelectItem value="3">3+ Years</SelectItem>
                  <SelectItem value="5">5+ Years</SelectItem>
                  <SelectItem value="8">8+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <Select 
                value={selectedFilters.availability} 
                onValueChange={(val) => {
                  const updated = { ...selectedFilters, availability: val };
                  setSelectedFilters(updated);
                  fetchCandidates(searchQuery, updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Availabilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="immediate">Available immediately</SelectItem>
                  <SelectItem value="open">Open to opportunities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base md:text-lg">
            <span>
              Candidate Results ({searchResults.length} of {totalCount} profiles in database)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              Searching real candidate records...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No candidates found matching the query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={profile.profile_photo_url} />
                        <AvatarFallback className="text-base font-semibold">
                          {profile.full_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-semibold truncate">{profile.full_name}</h3>
                          <Badge 
                            className={availabilityColors[profile.availability] || 'bg-gray-100 text-gray-800'}
                          >
                            {profile.availability}
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium text-foreground mb-2">{profile.job_title}</p>
                        
                        <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{profile.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>{profile.experience_years} yrs exp</span>
                          </div>
                          <span>Added: {profile.last_active}</span>
                          <span className="text-xs text-muted-foreground truncate">{profile.email}</span>
                        </div>

                        {profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {profile.skills.slice(0, 7).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skills.length > 7 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.skills.length - 7} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0">
                      {profile.resume_url && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => window.open(profile.resume_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                          View CV
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="default"
                        className="gap-2"
                        onClick={() => window.open(`/talent?search=${encodeURIComponent(profile.full_name)}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                        Full Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
