import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyFollowButton } from '@/components/company/CompanyFollowButton';
import { Loader2, Building, MapPin, Users, Briefcase, Star, Search, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies', searchTerm, industryFilter, sizeFilter],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select(`
          *,
          jobs (count),
          company_follows!left (
            id,
            user_id
          )
        `);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (industryFilter && industryFilter !== 'all') {
        query = query.eq('industry', industryFilter);
      }

      if (sizeFilter && sizeFilter !== 'all') {
        query = query.eq('size_range', sizeFilter);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: industries } = useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('industry')
        .not('industry', 'is', null);
      
      if (error) throw error;
      
      const uniqueIndustries = [...new Set(data.map(c => c.industry))];
      return uniqueIndustries.filter(Boolean);
    }
  });

  const followMutation = useMutation({
    mutationFn: async ({ companyId, isFollowing }: { companyId: string; isFollowing: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to subscribe to companies');
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('company_follows')
          .delete()
          .eq('company_id', companyId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('company_follows')
          .insert({
            company_id: companyId,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { isFollowing }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success(isFollowing ? 'Unsubscribed from company' : 'Subscribed to company');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update subscription');
    }
  });

  const handleFollowToggle = (companyId: string, isFollowing: boolean) => {
    followMutation.mutate({ companyId, isFollowing });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building className="h-8 w-8 text-blue-600" />
          Explore Companies
        </h1>
        <p className="text-gray-600 mt-2">
          Discover companies and explore their job opportunities
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries?.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Company Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="startup">Startup (1-50)</SelectItem>
                <SelectItem value="small">Small (51-200)</SelectItem>
                <SelectItem value="medium">Medium (201-1000)</SelectItem>
                <SelectItem value="large">Large (1000+)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setIndustryFilter('all');
                setSizeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      {!companies || companies.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company: any) => {
            const isFollowing = company.company_follows && company.company_follows.length > 0;
            
            return (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Building className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {company.name}
                        </CardTitle>
                        <CompanyFollowButton 
                          companyId={company.id}
                          size="sm"
                          variant="outline"
                          showFollowersCount={false}
                          className="ml-2"
                        />
                      </div>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        {company.industry && (
                          <>
                            <Badge variant="secondary" className="text-xs">
                              {company.industry}
                            </Badge>
                          </>
                        )}
                        {company.is_verified && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {company.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {company.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {company.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {company.location}
                      </div>
                    )}
                    
                    {company.employee_count_range && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {company.employee_count_range} employees
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      {company.jobs?.[0]?.count || 0} open positions
                    </div>

                    {company.founded_year && (
                      <div className="text-sm text-gray-600">
                        Founded in {company.founded_year}
                      </div>
                    )}
                  </div>

                  {company.tech_stack && company.tech_stack.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tech Stack:</p>
                      <div className="flex flex-wrap gap-1">
                        {company.tech_stack.slice(0, 4).map((tech: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {company.tech_stack.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{company.tech_stack.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/${company.slug}`}>View Company</Link>
                    </Button>
                    
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/jobs?company=${company.id}`}>View Jobs</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Companies;
