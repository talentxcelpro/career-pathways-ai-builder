import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Filter, MapPin, Users, Briefcase, 
  GraduationCap, Building, Calendar, Star,
  TrendingUp, Clock, BookOpen 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchFilters {
  query: string;
  location: string;
  industry: string[];
  experience: [number, number];
  company: string;
  skills: string[];
  dateRange: string;
  salary: [number, number];
  jobType: string[];
  remote: boolean;
}

interface SearchResult {
  id: string;
  type: 'person' | 'job' | 'company' | 'post' | 'course';
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  location?: string;
  relevanceScore: number;
  metadata: Record<string, any>;
}

export const AdvancedSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    industry: [],
    experience: [0, 10],
    company: '',
    skills: [],
    dateRange: 'all',
    salary: [0, 200000],
    jobType: [],
    remote: false
  });

  const [isSearching, setIsSearching] = useState(false);

  // Search query
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['advanced-search', filters, activeTab],
    queryFn: async () => {
      if (!filters.query.trim()) return [];

      setIsSearching(true);
      const results: SearchResult[] = [];

      try {
        // Search people
        if (activeTab === 'all' || activeTab === 'people') {
          const { data: people } = await supabase
            .from('profiles')
            .select(`
              id, full_name, headline, profile_picture_url, 
              current_company, location, bio, skills
            `)
            .or(`full_name.ilike.%${filters.query}%,headline.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`)
            .limit(10);

          if (people) {
            results.push(...people.map((person: any) => ({
              id: person.id,
              type: 'person' as const,
              title: person.full_name || 'Professional User',
              subtitle: person.headline || person.current_company,
              description: person.bio || 'Professional user on TalentXcel',
              image: person.profile_picture_url,
              location: person.location,
              relevanceScore: calculateRelevance(filters.query, [
                person.full_name,
                person.headline,
                person.bio
              ].filter(Boolean)),
              metadata: { skills: person.skills || [] }
            })));
          }
        }

        // Search jobs
        if (activeTab === 'all' || activeTab === 'jobs') {
          const { data: jobs } = await supabase
            .from('jobs')
            .select(`
              id, title, company, location, description, 
              salary_min, salary_max, job_type, is_remote,
              created_at, employer_id
            `)
            .or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,company.ilike.%${filters.query}%`)
            .eq('is_active', true)
            .limit(10);

          if (jobs) {
            results.push(...jobs.map((job: any) => ({
              id: job.id,
              type: 'job' as const,
              title: job.title,
              subtitle: job.company,
              description: job.description?.substring(0, 150) + '...' || '',
              location: job.location,
              relevanceScore: calculateRelevance(filters.query, [
                job.title,
                job.description,
                job.company
              ].filter(Boolean)),
              metadata: {
                salary: { min: job.salary_min, max: job.salary_max },
                jobType: job.job_type,
                isRemote: job.is_remote,
                createdAt: job.created_at
              }
            })));
          }
        }

        // Search posts
        if (activeTab === 'all' || activeTab === 'posts') {
          const { data: posts } = await supabase
            .from('posts')
            .select(`
              id, content, headline, created_at, author_id,
              profiles!posts_author_id_fkey(full_name, profile_picture_url)
            `)
            .or(`content.ilike.%${filters.query}%,headline.ilike.%${filters.query}%`)
            .eq('is_active', true)
            .limit(10);

          if (posts) {
            results.push(...posts.map((post: any) => ({
              id: post.id,
              type: 'post' as const,
              title: post.headline || 'Professional Post',
              subtitle: `by ${post.profiles?.full_name || 'Professional User'}`,
              description: post.content?.substring(0, 150) + '...' || '',
              image: post.profiles?.profile_picture_url,
              relevanceScore: calculateRelevance(filters.query, [
                post.headline,
                post.content
              ].filter(Boolean)),
              metadata: {
                authorId: post.author_id,
                createdAt: post.created_at
              }
            })));
          }
        }

        // Search courses
        if (activeTab === 'all' || activeTab === 'courses') {
          const { data: courses } = await supabase
            .from('courses')
            .select(`
              id, title, description, instructor_name, 
              level, duration, rating, price
            `)
            .or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
            .eq('is_active', true)
            .limit(10);

          if (courses) {
            results.push(...courses.map((course: any) => ({
              id: course.id,
              type: 'course' as const,
              title: course.title,
              subtitle: `by ${course.instructor_name}`,
              description: course.description?.substring(0, 150) + '...' || '',
              relevanceScore: calculateRelevance(filters.query, [
                course.title,
                course.description
              ].filter(Boolean)),
              metadata: {
                level: course.level,
                duration: course.duration,
                rating: course.rating,
                price: course.price
              }
            })));
          }
        }

        // Sort by relevance
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      } finally {
        setIsSearching(false);
      }
    },
    enabled: filters.query.trim().length > 0
  });

  const calculateRelevance = (query: string, fields: string[]): number => {
    const queryLower = query.toLowerCase();
    let score = 0;
    
    fields.forEach(field => {
      if (field) {
        const fieldLower = field.toLowerCase();
        if (fieldLower.includes(queryLower)) {
          // Exact match gets higher score
          if (fieldLower === queryLower) score += 10;
          // Word boundary match
          else if (fieldLower.split(' ').some(word => word === queryLower)) score += 7;
          // Substring match
          else score += 3;
        }
      }
    });
    
    return score;
  };

  const handleSearch = () => {
    // Trigger search by updating query
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'person': return <Users className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'company': return <Building className="h-4 w-4" />;
      case 'post': return <BookOpen className="h-4 w-4" />;
      case 'course': return <GraduationCap className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'person': return `/p/${result.id}`;
      case 'job': return `/jobs/${result.id}`;
      case 'post': return `/social/posts/${result.id}`;
      case 'course': return `/learning/courses/${result.id}`;
      default: return '#';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Advanced Search</h1>
        <p className="text-muted-foreground text-lg">
          Find exactly what you're looking for across our entire platform
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="City, state, or country"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Experience: {filters.experience[0]}-{filters.experience[1]} years
                </label>
                <Slider
                  value={filters.experience}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value as [number, number] }))}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Remote Work */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={filters.remote}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, remote: !!checked }))}
                />
                <label htmlFor="remote" className="text-sm font-medium">
                  Remote work available
                </label>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Posted</label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="day">Past 24 hours</SelectItem>
                    <SelectItem value="week">Past week</SelectItem>
                    <SelectItem value="month">Past month</SelectItem>
                    <SelectItem value="year">Past year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for people, jobs, companies, posts, courses..."
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="pl-10 text-lg h-12"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} size="lg" className="px-8">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results */}
          <div className="space-y-4">
            {isLoading || isSearching ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {filters.query ? 'No results found' : 'Start your search'}
                  </h3>
                  <p className="text-muted-foreground">
                    {filters.query 
                      ? 'Try different keywords or adjust your filters'
                      : 'Enter a search term to find people, jobs, posts, and courses'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">
                    Found {searchResults.length} results for "{filters.query}"
                  </p>
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {searchResults.map((result) => (
                  <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <Link to={getResultLink(result)} className="block">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            {result.image ? (
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={result.image} />
                                <AvatarFallback>
                                  {getResultIcon(result.type)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                                {getResultIcon(result.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                                  {result.title}
                                </h3>
                                {result.subtitle && (
                                  <p className="text-muted-foreground mb-2">{result.subtitle}</p>
                                )}
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {result.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="capitalize">
                                    {result.type}
                                  </Badge>
                                  {result.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {result.location}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {result.relevanceScore}% match
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};