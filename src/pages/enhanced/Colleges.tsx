import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  Heart,
  MessageCircle,
  TrendingUp,
  Plus,
  Shield,
  Crown,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { toast } from 'sonner';
import { collegeService } from '@/services/collegeService';
import CollegeApplyButton from '@/components/colleges/CollegeApplyButton';
import { VerificationBadge } from '@/components/colleges/enhanced/VerificationBadge';
import { PremiumBadge } from '@/components/colleges/enhanced/PremiumBadge';
import { EnhancedFilters } from '@/components/colleges/enhanced/EnhancedFilters';
import { updateMetaTags } from '@/utils/metaTags';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { CollegeInsightsDashboard } from '@/components/colleges/enhanced/CollegeInsightsDashboard';

const EnhancedColleges = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    collegeType: 'all',
    city: 'all',
    state: 'all',
    ranking: 'all',
    verifiedOnly: false,
    premiumOnly: false,
    placementRange: [0, 100] as [number, number],
    feeRange: [0, 1000000] as [number, number]
  });
  const [bookmarkedColleges, setBookmarkedColleges] = useState(new Set());
  const [filterOptions, setFilterOptions] = useState({
    college_types: [],
    cities: [],
    states: [],
    disciplines: []
  });

  // SEO setup
  useEffect(() => {
    updateMetaTags({
      title: 'Top Colleges in India - Find Your Perfect College | TalentXcel',
      description: 'Discover verified colleges across India with placement rates, reviews, and direct admission guidance. Compare top universities and make informed decisions.',
      keywords: ['colleges in india', 'top universities', 'college admissions', 'verified colleges', 'placement rates']
    });
  }, []);

  const { data: colleges, isLoading, refetch } = useQuery({
    queryKey: ['colleges', searchTerm, filters],
    queryFn: async () => {
      let query = supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true);
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,college_type.ilike.%${searchTerm}%`);
      }
      
      if (filters.collegeType && filters.collegeType !== 'all') {
        query = query.eq('college_type', filters.collegeType);
      }
      if (filters.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }
      if (filters.state && filters.state !== 'all') {
        query = query.eq('state', filters.state);
      }
      
      // Enhanced filters
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true);
      }
      if (filters.premiumOnly) {
        query = query.eq('is_premium', true);
      }
      if (filters.placementRange[0] > 0 || filters.placementRange[1] < 100) {
        query = query.gte('placement_percentage', filters.placementRange[0])
                   .lte('placement_percentage', filters.placementRange[1]);
      }
      if (filters.feeRange[0] > 0 || filters.feeRange[1] < 1000000) {
        query = query.gte('average_fees_per_year', filters.feeRange[0])
                   .lte('average_fees_per_year', filters.feeRange[1]);
      }
      
      const { data, error } = await query.order('ranking_national', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    }
  });

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await collegeService.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
    loadFilterOptions();
  }, []);

  // Auto-refresh colleges data
  useSmartAutoRefresh(() => {
    refetch();
  }, REFRESH_INTERVALS.COMPANIES);

  const handleUniversalSearch = (query: string, aiFilters?: SearchFilters) => {
    if (aiFilters && aiFilters.query) {
      setSearchTerm(aiFilters.query);
    } else {
      setSearchTerm(query);
    }
  };

  const stats = [
    { label: 'Total Colleges', value: colleges?.length?.toString() || '0', icon: Building, color: 'bg-blue-500' },
    { label: 'Verified Colleges', value: colleges?.filter(c => c.is_verified)?.length?.toString() || '0', icon: Shield, color: 'bg-green-500' },
    { label: 'Premium Partners', value: colleges?.filter(c => c.is_premium)?.length?.toString() || '0', icon: Crown, color: 'bg-purple-500' },
    { label: 'Avg Placement Rate', value: '85%+', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  const handleBookmark = async (collegeId: string) => {
    try {
      if (bookmarkedColleges.has(collegeId)) {
        await collegeService.removeBookmark(collegeId);
        setBookmarkedColleges(prev => {
          const newSet = new Set(prev);
          newSet.delete(collegeId);
          return newSet;
        });
        toast.success('Bookmark removed');
      } else {
        await collegeService.bookmarkCollege(collegeId);
        setBookmarkedColleges(prev => new Set(prev).add(collegeId));
        toast.success('College bookmarked');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Global Education Intelligence Layer — Top Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Building className="h-4 w-4" />
              Indian Colleges
            </button>
            <button
              onClick={() => navigate('/colleges/global-programs')}
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              🌍 Global Programs
            </button>
            <button
              onClick={() => navigate('/colleges/scholarships')}
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              🎓 Scholarships
            </button>
            <button
              onClick={() => navigate('/colleges/pathway')}
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg hover:bg-muted text-sm font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/30"
            >
              ✨ Career Pathway
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">NEW</span>
            </button>
          </div>
        </div>

      {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-3">Discover Your Perfect College</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Find verified colleges across India with comprehensive data on programs, placements, reviews, and direct admission guidance. 
              Explore {colleges?.length || 0}+ colleges with detailed analytics and insights.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => navigate('/colleges/create-request')}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your College
              </Button>
              <Button
                onClick={() => navigate('/colleges/compare')}
                variant="outline"
              >
                <Network className="h-4 w-4 mr-2" />
                Compare Colleges
              </Button>
            </div>
          </div>

          {/* Analytics Dashboard */}
          {colleges && colleges.length > 0 && (
            <div className="mb-8">
              <CollegeInsightsDashboard colleges={colleges} />
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search colleges, programs, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Enhanced Filters */}
          <EnhancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
          />
        </div>

        {/* Colleges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded flex-1"></div>
                    <div className="h-6 bg-muted rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : colleges && colleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <Card key={college.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                
                {/* College Banner */}
                <div className="relative bg-muted overflow-hidden">
                  <AspectRatio ratio={16/9} className="relative">
                    <ImageWithFallback
                      src={college.cover_image_url || '/images/college-placeholder.svg'}
                      alt={`${college.name} campus banner image`}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      width={1200}
                      height={675}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      fallbackSrc="/images/college-placeholder.svg"
                      loading="eager"
                      unwrapped
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </AspectRatio>

                  {/* College Logo */}
                  <div className="absolute bottom-4 left-4">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage 
                        src={college.logo_url || '/images/college-placeholder.svg'} 
                        alt={`${college.name} logo`}
                        className="object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/college-placeholder.svg'; }}
                      />
                      <AvatarFallback className="bg-white text-primary">
                        <GraduationCap className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <VerificationBadge 
                      isVerified={college.is_verified} 
                      verificationStatus={college.verification_status}
                      size="sm"
                    />
                    <PremiumBadge 
                      isPremium={college.is_premium} 
                      isFeatured={college.featured}
                      size="sm"
                    />
                  </div>

                  {/* Bookmark Button */}
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleBookmark(college.id)}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      {bookmarkedColleges.has(college.id) ? (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      ) : (
                        <Heart className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    
                    {/* Title and Rankings */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
                        {college.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {college.ranking_national && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            #{college.ranking_national} National
                          </Badge>
                        )}
                        {college.college_type && (
                          <Badge variant="outline">
                            {college.college_type}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {college.description || 'Premier educational institution committed to academic excellence and innovation.'}
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {college.city && college.state && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{college.city}, {college.state}</span>
                        </div>
                      )}
                      {college.established_year && (
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>Est. {college.established_year}</span>
                        </div>
                      )}
                      {college.total_students && (
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span>{college.total_students.toLocaleString()}</span>
                        </div>
                      )}
                      {college.placement_percentage && (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="font-medium">{college.placement_percentage}%</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/colleges/${college.slug || college.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/colleges/${college.id}/chat`)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      {college.website && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(college.website, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No colleges found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters to find more colleges.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setFilters({
                collegeType: 'all',
                city: 'all', 
                state: 'all',
                ranking: 'all',
                verifiedOnly: false,
                premiumOnly: false,
                placementRange: [0, 100],
                feeRange: [0, 1000000]
              });
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedColleges;