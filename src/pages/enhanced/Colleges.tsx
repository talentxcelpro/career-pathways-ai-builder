import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Users, 
  GraduationCap, 
  Calendar,
  BookOpen,
  Award,
  Building,
  Star,
  Network,
  Filter,
  Bot,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { collegeService } from '@/services/collegeService';
import { College, CollegeFilters } from '@/types/colleges';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const EnhancedColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CollegeFilters>({});
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [bookmarkedColleges, setBookmarkedColleges] = useState<Set<string>>(new Set());

  // Load colleges and filter options
  useEffect(() => {
    loadColleges();
    loadFilterOptions();
    loadBookmarkedColleges();
  }, []);

  // Reload colleges when filters change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadColleges();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filters]);

  const loadColleges = async () => {
    try {
      setLoading(true);
      const searchParams = {
        filters: {
          ...filters,
          search: searchTerm
        },
        sort_by: 'ranking_national' as const,
        sort_order: 'asc' as const,
        page: 1,
        limit: 20
      };

      const { colleges } = await collegeService.searchColleges(searchParams);
      setColleges(colleges);
    } catch (error) {
      console.error('Error loading colleges:', error);
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const options = await collegeService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadBookmarkedColleges = async () => {
    try {
      const bookmarks = await collegeService.getBookmarkedColleges();
      setBookmarkedColleges(new Set(bookmarks.map((b: any) => b.college_id)));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleBookmark = async (collegeId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      if (bookmarkedColleges.has(collegeId)) {
        await collegeService.removeBookmark(collegeId);
        setBookmarkedColleges(prev => {
          const newSet = new Set(prev);
          newSet.delete(collegeId);
          return newSet;
        });
        toast.success('College removed from bookmarks');
      } else {
        await collegeService.bookmarkCollege(collegeId);
        setBookmarkedColleges(prev => new Set(prev).add(collegeId));
        toast.success('College bookmarked');
      }
    } catch (error) {
      toast.error('Please login to bookmark colleges');
    }
  };

  const updateFilter = (key: keyof CollegeFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const stats = [
    { label: 'Total Colleges', value: '1,200+', icon: Building },
    { label: 'Verified Programs', value: '15K+', icon: BookOpen },
    { label: 'Student Reviews', value: '50K+', icon: Star },
    { label: 'Placement Rate', value: '85%+', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Discover Your Perfect College</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered college discovery with comprehensive data on programs, placements, and student experiences.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and AI Assistant */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search colleges, programs, or ask AI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Ask AI Assistant
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={filters.featured_only ? "default" : "outline"} 
            size="sm"
            onClick={() => updateFilter('featured_only', !filters.featured_only)}
          >
            <Award className="h-4 w-4 mr-1" />
            Top Ranked
          </Button>
          <Button 
            variant={filters.verification_status?.includes('verified') ? "default" : "outline"} 
            size="sm"
            onClick={() => updateFilter('verification_status', 
              filters.verification_status?.includes('verified') ? [] : ['verified']
            )}
          >
            Verified Only
          </Button>
          <Select value={filters.college_type?.[0] || 'all'} onValueChange={(value) => 
            updateFilter('college_type', value === 'all' ? [] : [value])
          }>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Institution Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {filterOptions.college_types?.map((type: string) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {Object.keys(filters).length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-40 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Colleges Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <Link key={college.id} to={`/colleges/${college.slug || college.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
                  <div className="relative">
                    {college.cover_image_url && (
                      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/30 rounded-t-lg"></div>
                    )}
                    <button
                      onClick={(e) => handleBookmark(college.id, e)}
                      className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                    >
                      {bookmarkedColleges.has(college.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={college.logo_url} alt={college.name} />
                          <AvatarFallback className="text-sm font-bold">
                            {college.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">{college.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {college.ranking_national && (
                              <Badge variant="secondary" className="text-xs">
                                #{college.ranking_national} Ranked
                              </Badge>
                            )}
                            {college.is_verified && (
                              <Badge variant="default" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2 line-clamp-2">
                      {college.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Location and Basic Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {college.city}, {college.state}
                        </div>
                        {college.established_year && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Est. {college.established_year}
                          </div>
                        )}
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {college.total_students && (
                          <div className="flex items-center text-blue-600">
                            <Users className="h-4 w-4 mr-1" />
                            {college.total_students.toLocaleString()} students
                          </div>
                        )}
                        {college.placement_percentage && (
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {college.placement_percentage}% placement
                          </div>
                        )}
                        {college.average_fees_per_year && (
                          <div className="flex items-center text-orange-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ₹{(college.average_fees_per_year / 100000).toFixed(1)}L/year
                          </div>
                        )}
                        {college.total_faculty && (
                          <div className="flex items-center text-purple-600">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {college.total_faculty} faculty
                          </div>
                        )}
                      </div>

                      {/* College Type and Recognition */}
                      {(college.college_type || college.recognition?.length) && (
                        <div className="flex flex-wrap gap-1">
                          {college.college_type && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {college.college_type}
                            </Badge>
                          )}
                          {college.recognition?.slice(0, 2).map((rec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {rec}
                            </Badge>
                          ))}
                          {college.recognition && college.recognition.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{college.recognition.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && colleges.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No colleges found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}

        {/* AI Features Teaser */}
        {colleges.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6 text-center">
              <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Get AI-Powered Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Let our AI help you find the perfect college match based on your profile, interests, and career goals.
              </p>
              <div className="flex justify-center space-x-4">
                <Button>
                  <Bot className="h-4 w-4 mr-2" />
                  Get Personalized Recommendations
                </Button>
                <Button variant="outline">
                  Compare Colleges
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedColleges;