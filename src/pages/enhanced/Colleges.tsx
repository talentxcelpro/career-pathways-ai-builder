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
  Bot,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  DollarSign,
  Sparkles,
  Heart,
  MessageCircle,
  Zap,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { toast } from 'sonner';
import { collegeService } from '@/services/collegeService';

const EnhancedColleges = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    collegeType: '',
    city: '',
    state: '',
    ranking: ''
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [bookmarkedColleges, setBookmarkedColleges] = useState(new Set());
  const [filterOptions, setFilterOptions] = useState({
    college_types: [],
    cities: [],
    states: [],
    disciplines: []
  });

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
    { label: 'Total Colleges', value: '1,2+', icon: Building, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Verified Programs', value: '100+', icon: BookOpen, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Student Reviews', value: '100+', icon: Star, gradient: 'from-yellow-500 to-orange-500' },
    { label: 'Placement Rate', value: '85%+', icon: TrendingUp, gradient: 'from-purple-500 to-pink-500' }
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

  const getCollegeImage = (college: any) => {
    // Use actual college images based on well-known colleges
    const collegeImages = {
      'IIT Delhi': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop',
      'University of Mumbai': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop',
      'Manipal Academy': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop',
      'Jadavpur University': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop',
      'Chandigarh University': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
      'Anna University': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
      'Amity University Noida': 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=400&fit=crop',
      'Lovely Professional University': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop',
      'Banaras Hindu University': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=400&fit=crop',
      'VIT Vellore': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=400&fit=crop'
    };
    
    return collegeImages[college.name] || college.cover_image_url || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Discover Your Perfect College</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            AI-powered discovery with comprehensive data on programs, placements, student reviews, and smart guidance.
          </p>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/40 hover:bg-white transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="relative p-4 text-center">
                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${stat.gradient} mb-3`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* AI-Powered Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search colleges, programs, or ask AI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-20 h-12 bg-white/70 backdrop-blur-sm border-white/40"
              />
              <Button
                onClick={() => setShowAIChat(true)}
                className="absolute right-2 top-2 h-8 px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                AI
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Select value={filters.collegeType} onValueChange={(value) => setFilters(prev => ({ ...prev, collegeType: value }))}>
              <SelectTrigger className="w-40 bg-white/70 backdrop-blur-sm border-white/40">
                <SelectValue placeholder="College Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filterOptions.college_types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.state} onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}>
              <SelectTrigger className="w-40 bg-white/70 backdrop-blur-sm border-white/40">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {filterOptions.states.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
              <SelectTrigger className="w-40 bg-white/70 backdrop-blur-sm border-white/40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {filterOptions.cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ collegeType: '', city: '', state: '', ranking: '' })}
              className="bg-white/70 backdrop-blur-sm border-white/40"
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Colleges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : colleges && colleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <Card key={college.id} className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden bg-white border-0 shadow-lg">
                {/* College Banner with actual images */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getCollegeImage(college)}
                    alt={`${college.name} campus`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* College Logo - Overlapping the banner */}
                  <div className="absolute -bottom-8 left-6">
                    {college.logo_url ? (
                      <img
                        src={college.logo_url}
                        alt={`${college.name} logo`}
                        className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Enhanced Badge for Featured/Verified */}
                  {college.is_verified && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500/90 text-white backdrop-blur-sm border-0">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}

                  {/* Interactive Bookmark Button */}
                  <div className="absolute top-4 right-4">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      onClick={() => handleBookmark(college.id)}
                      className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all"
                    >
                      {bookmarkedColleges.has(college.id) ? (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      ) : (
                        <Heart className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>
                </div>

                <CardHeader className="pt-10 pb-4">
                  <div className="space-y-3">
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors leading-tight">
                      {college.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {college.ranking_national && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold border-0">
                          #{college.ranking_national} National
                        </Badge>
                      )}
                      {college.college_type && (
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {college.college_type}
                        </Badge>
                      )}
                      {college.featured && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs border-0">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                    {college.description || 'Prestigious institution committed to academic excellence and innovation.'}
                  </CardDescription>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {college.city && college.state && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="truncate">{college.city}, {college.state}</span>
                      </div>
                    )}
                    {college.established_year && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>Est. {college.established_year}</span>
                      </div>
                    )}
                    {college.total_students && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span>{college.total_students.toLocaleString()}</span>
                      </div>
                    )}
                    {college.placement_percentage && (
                      <div className="flex items-center space-x-2 text-green-600 font-medium">
                        <TrendingUp className="h-4 w-4" />
                        <span>{college.placement_percentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => navigate(`/colleges/${college.id}/chat`)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat AI
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => navigate('/colleges/compare')}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Compare
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/colleges/${college.slug || college.id}`}>
                        <Button variant="outline" size="sm" className="hover:bg-gray-50">
                          Details
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                      <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (

          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No colleges found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedColleges;