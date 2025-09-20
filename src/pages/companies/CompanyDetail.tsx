import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFileUpload } from '@/hooks/useFileUpload';
import { 
  MapPin, 
  Users, 
  Star, 
  Briefcase, 
  Globe, 
  Calendar,
  Heart,
  Share2,
  Building,
  DollarSign,
  Coffee,
  Award,
  TrendingUp,
  Upload,
  Camera,
  Edit3,
  ExternalLink,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import { CompanyFollowButton } from '@/components/company/CompanyFollowButton';
import { CompanyPostsList } from '@/components/company/CompanyPostsList';
import { toast } from 'sonner';

const CompanyDetail = () => {
  const { id, slug } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { uploadFile, uploading } = useFileUpload({ bucket: 'companies' });
  
  // Determine if we're using slug or ID
  const identifier = slug || id;

  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch company data
  const { data: company, isLoading, refetch } = useQuery({
    queryKey: ['company-detail', identifier],
    queryFn: async () => {
      if (!identifier) return null;

      console.log('🏢 Fetching company with identifier:', identifier);

      // Build basic query first
      let query = supabase
        .from('companies')
        .select('*');

      // If it looks like a UUID, search by ID, otherwise by slug
      if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.log('🔍 Searching by ID:', identifier);
        query = query.eq('id', identifier);
      } else {
        console.log('🔍 Searching by slug:', identifier);
        query = query.eq('slug', identifier);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('❌ Error fetching company:', error);
        return null;
      }
      
      console.log('✅ Company fetched:', data?.name);
      return data;
    },
    enabled: !!identifier
  });

  // Fetch company jobs separately
  const { data: companyJobs } = useQuery({
    queryKey: ['company-jobs', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          employment_type,
          created_at,
          expires_at,
          is_active,
          salary_min,
          salary_max,
          salary_currency,
          description,
          skills_required,
          applications_count,
          views_count
        `)
        .eq('company_id', company.id)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching company jobs:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!company?.id
  });

  // Check if current user can edit this company
  const { data: canEdit } = useQuery({
    queryKey: ['can-edit-company', company?.id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !company?.id) return false;

      const { data: profile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('company_id', company.id)
        .eq('owner_id', currentUser.id)
        .maybeSingle();

      if (profile) return true;

      const { data: teamMember } = await supabase
        .from('company_team_members')
        .select('id')
        .eq('company_id', company.id)
        .eq('user_id', currentUser.id)
        .in('role', ['admin', 'owner'])
        .eq('is_active', true)
        .maybeSingle();

      return !!teamMember;
    },
    enabled: !!currentUser && !!company?.id
  });

  // Get company followers count
  const { data: followersCount } = useQuery({
    queryKey: ['company-followers', company?.id],
    queryFn: async () => {
      if (!company?.id) return 0;
      
      const { count } = await supabase
        .from('company_follows')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      return count || 0;
    },
    enabled: !!company?.id
  });

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    if (!company || !canEdit) {
      toast.error('You do not have permission to edit this company');
      return;
    }

    try {
      const fileName = `${company.id}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      const imageUrl = await uploadFile(file, fileName, 'companies');

      const updateField = type === 'logo' ? 'logo_url' : 'cover_image_url';
      
      const { error } = await supabase
        .from('companies')
        .update({ [updateField]: imageUrl })
        .eq('id', company.id);

      if (error) throw error;

      toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} updated successfully`);
      refetch();
    } catch (error: any) {
      toast.error(`Failed to update ${type}: ${error.message}`);
    }
  };

  // Attach jobs to company object for compatibility
  const companyWithJobs = company ? { ...company, jobs: companyJobs || [] } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-300"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative -mt-32 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="h-24 w-24 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!companyWithJobs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Company Not Found</h3>
          <p className="text-gray-600 mb-4">The company you're looking for doesn't exist.</p>
          <Link to="/companies">
            <Button>Browse All Companies</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Cover Image Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        {companyWithJobs.cover_image_url ? (
          <img 
            src={companyWithJobs.cover_image_url} 
            alt={`${companyWithJobs.name} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-700/90"></div>
        )}
        
        {/* Upload Banner Button for Authorized Users */}
        {canEdit && (
          <div className="absolute top-4 right-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'cover');
                }}
                className="hidden"
              />
              <Button variant="secondary" size="sm" disabled={uploading}>
                <Camera className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Update Banner'}
              </Button>
            </label>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Company Header */}
        <div className="relative -mt-32 mb-8">
          <Card className="p-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex items-start space-x-6 mb-4 md:mb-0">
                {/* Enhanced Profile Picture with Upload */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-blue-100">
                    <AvatarImage src={companyWithJobs.logo_url} alt={companyWithJobs.name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {companyWithJobs.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Upload Logo Button for Authorized Users */}
                  {canEdit && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-full flex items-center justify-center">
                      <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'logo');
                          }}
                          className="hidden"
                        />
                        <div className="bg-white rounded-full p-2 shadow-lg">
                          <Upload className="h-5 w-5 text-gray-700" />
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {companyWithJobs.name}
                    </h1>
                    {companyWithJobs.is_verified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Award className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      <span className="font-medium">{followersCount || 0} followers</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {companyWithJobs.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {companyWithJobs.employee_count_range} employees
                    </div>
                    {companyWithJobs.website && (
                      <a href={companyWithJobs.website} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                        <Globe className="h-4 w-4 mr-1" />
                        Website
                      </a>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {companyWithJobs.industry}
                    </Badge>
                    {companyWithJobs.founded_year && (
                      <Badge variant="outline">Founded {companyWithJobs.founded_year}</Badge>
                    )}
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {companyWithJobs.jobs?.length || 0} open positions
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <CompanyFollowButton 
                  companyId={companyWithJobs.id}
                  size="default"
                  variant="outline"
                  showFollowersCount={false}
                />
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Jobs ({companyWithJobs.jobs?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Activity
            </TabsTrigger>
            <TabsTrigger value="culture" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Culture
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="text-xl">About {companyWithJobs.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {companyWithJobs.description || 'No description available'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="text-xl">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Industry</span>
                      <span className="font-medium">{companyWithJobs.industry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Company Size</span>
                      <span className="font-medium">{companyWithJobs.employee_count_range} employees</span>
                    </div>
                    {companyWithJobs.founded_year && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Founded</span>
                        <span className="font-medium">{companyWithJobs.founded_year}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{companyWithJobs.location}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                    <CardTitle className="text-xl">
                      <TrendingUp className="h-5 w-5 inline mr-2" />
                      Current Openings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        <span className="font-medium text-green-600">{companyWithJobs.jobs?.length || 0}</span>
                      </div>
                      <p className="text-gray-600 text-sm">Active job postings</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-6">
              {companyWithJobs.jobs && companyWithJobs.jobs.length > 0 ? (
                companyWithJobs.jobs.filter((job: any) => job.is_active).map((job: any) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location || 'Remote'}
                            </span>
                            {job.employment_type && (
                              <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Posted {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {(job.salary_min || job.salary_max) && (
                            <div className="mb-3">
                              <span className="font-medium text-green-600 flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary_min && job.salary_max 
                                  ? `${job.salary_currency} ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}`
                                  : job.salary_min 
                                    ? `${job.salary_currency} ${job.salary_min?.toLocaleString()}+`
                                    : `Up to ${job.salary_currency} ${job.salary_max?.toLocaleString()}`
                                }
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{job.views_count || 0} views</span>
                            <span>{job.applications_count || 0} applications</span>
                          </div>
                        </div>
                        <div className="ml-6">
                          <Link to={`/jobs/${job.id}`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Open Positions</h3>
                  <p className="text-gray-600">This company doesn't have any job openings at the moment.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-xl">Company Activity</CardTitle>
                <CardDescription>Recent updates, posts, and company news</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CompanyPostsList companyId={companyWithJobs.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="culture" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-xl">Company Culture</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Learn more about our company culture and values.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Coffee className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-lg">Work-Life Balance</h3>
                    <p className="text-sm text-gray-600">Flexible hours and remote work options</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-lg">Growth Opportunities</h3>
                    <p className="text-sm text-gray-600">Clear career progression paths</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-lg">Team Collaboration</h3>
                    <p className="text-sm text-gray-600">Open communication and teamwork</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDetail;