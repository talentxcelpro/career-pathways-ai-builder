import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { toast } from 'sonner';

const EnhancedColleges = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: colleges, isLoading, refetch } = useQuery({
    queryKey: ['colleges', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true);
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%,college_type.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('ranking_national', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    }
  });

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
    { label: 'Total Colleges', value: '1,200+', icon: Building },
    { label: 'Verified Programs', value: '15K+', icon: BookOpen },
    { label: 'Student Reviews', value: '50K+', icon: Star },
    { label: 'Placement Rate', value: '85%+', icon: TrendingUp }
  ];

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
            <Card key={index} className="text-center bg-white/50 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI-Powered College Search */}
        <div className="max-w-2xl mx-auto mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search colleges, programs, or ask AI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
              <Card key={college.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* College Banner */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500">
                  {college.cover_image_url ? (
                    <img
                      src={college.cover_image_url}
                      alt={`${college.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* College Logo - Overlapping the banner */}
                  <div className="absolute -bottom-6 left-6">
                    {college.logo_url ? (
                      <img
                        src={college.logo_url}
                        alt={`${college.name} logo`}
                        className="w-16 h-16 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <div className="absolute top-4 right-4">
                    <Button variant="secondary" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
                      <Bookmark className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="pt-8">
                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {college.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
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
                      {college.college_type && (
                        <Badge variant="outline" className="text-xs">
                          {college.college_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                    {college.description || 'Prestigious institution committed to academic excellence and innovation.'}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    {college.city && college.state && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{college.city}, {college.state}</span>
                      </div>
                    )}
                    {college.established_year && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Established {college.established_year}</span>
                      </div>
                    )}
                    {college.total_students && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{college.total_students.toLocaleString()} students</span>
                      </div>
                    )}
                    {college.placement_percentage && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>{college.placement_percentage}% placement rate</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-1" />
                      Compare
                    </Button>
                    <div className="flex gap-2">
                      <Link to={`/colleges/${college.slug || college.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm">
                        Apply Now
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