import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, MapPin, Users, Star, TrendingUp, 
  Award, Briefcase, Calendar, Globe, Edit,
  Plus, Eye, CheckCircle, BarChart3, Target,
  Mail, Phone, Link as LinkIcon, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface CompanyProfile {
  id: string;
  company_name: string;
  description: string;
  industry: string;
  company_size: string;
  founded_year: number;
  headquarters: string;
  website: string;
  logo_url?: string;
  banner_url?: string;
  specialties: string[];
  company_culture: string;
  benefits: string[];
  contact_email: string;
  contact_phone?: string;
  social_links: Record<string, string>;
  is_verified: boolean;
  employee_count: number;
  followers_count: number;
  created_at: string;
}

interface CompanyUpdate {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  type: 'announcement' | 'hiring' | 'achievement' | 'culture';
}

interface CompanyAnalytics {
  profile_views: number;
  follower_growth: number;
  post_engagement: number;
  job_applications: number;
  employee_referrals: number;
}

interface EnhancedCompanyProfileProps {
  companyId?: string;
  isEditable?: boolean;
}

export const EnhancedCompanyProfile: React.FC<EnhancedCompanyProfileProps> = ({
  companyId,
  isEditable = false
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState<Partial<CompanyProfile>>({});

  // Fetch company profile
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-profile', companyId],
    queryFn: async () => {
      if (!companyId) return null;

      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      return data as CompanyProfile;
    },
    enabled: !!companyId
  });

  // Fetch company updates
  const { data: updates = [] } = useQuery({
    queryKey: ['company-updates', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('company_updates')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as CompanyUpdate[];
    },
    enabled: !!companyId
  });

  // Fetch company analytics
  const { data: analytics } = useQuery({
    queryKey: ['company-analytics', companyId],
    queryFn: async () => {
      if (!companyId || !isEditable) return null;

      // Mock analytics data - in real app, fetch from analytics table
      return {
        profile_views: Math.floor(Math.random() * 10000) + 1000,
        follower_growth: Math.floor(Math.random() * 100) + 10,
        post_engagement: Math.floor(Math.random() * 50) + 20,
        job_applications: Math.floor(Math.random() * 200) + 50,
        employee_referrals: Math.floor(Math.random() * 30) + 5
      } as CompanyAnalytics;
    },
    enabled: !!companyId && isEditable
  });

  // Fetch company employees
  const { data: employees = [] } = useQuery({
    queryKey: ['company-employees', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, headline, title')
        .eq('current_company', company?.company_name)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!companyId && !!company?.company_name
  });

  // Update company profile mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (updateData: Partial<CompanyProfile>) => {
      if (!companyId) throw new Error('Company ID required');

      const { data, error } = await supabase
        .from('company_profiles')
        .update(updateData)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile', companyId] });
      setIsEditing(false);
      toast.success('Company profile updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update company profile');
    }
  });

  // Follow company mutation
  const followCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !companyId) throw new Error('Authentication required');

      const { error } = await supabase
        .from('company_followers')
        .insert({
          user_id: user.id,
          company_id: companyId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile', companyId] });
      toast.success('Following company!');
    },
    onError: () => {
      toast.error('Failed to follow company');
    }
  });

  const handleSaveChanges = () => {
    updateCompanyMutation.mutate(editForm);
  };

  const formatDisplayName = (profile: any) => {
    return profile?.full_name || 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const name = formatDisplayName(profile);
    if (name === 'Professional User') return 'PU';
    
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Company Not Found</h3>
            <p className="text-muted-foreground">
              The company profile you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Company Header */}
      <Card className="mb-8">
        <div className="relative">
          {/* Banner */}
          <div 
            className="h-48 bg-gradient-to-r from-primary to-primary-foreground rounded-t-lg"
            style={{
              backgroundImage: company.banner_url ? `url(${company.banner_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {isEditable && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute top-4 right-4"
              >
                <Camera className="h-4 w-4 mr-2" />
                Update Banner
              </Button>
            )}
          </div>

          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Company Logo */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={company.logo_url} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-2xl">
                    {company.company_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditable && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute -bottom-2 -right-2"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1 mt-16 md:mt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">{company.company_name}</h1>
                      {company.is_verified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {company.industry}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {company.headquarters}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {company.employee_count.toLocaleString()} employees
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Founded {company.founded_year}
                      </span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                      {company.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isEditable && (
                      <Button onClick={() => followCompanyMutation.mutate()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Follow
                      </Button>
                    )}
                    {isEditable && (
                      <Button 
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {/* Company Stats */}
                <div className="flex gap-6 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{company.followers_count.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{employees.length}</p>
                    <p className="text-sm text-muted-foreground">Employees on Platform</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{updates.length}</p>
                    <p className="text-sm text-muted-foreground">Recent Updates</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Company Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="employees">People</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          {isEditable && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle>About {company.company_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                  
                  {company.specialties && company.specialties.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {company.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {company.company_culture && (
                    <div>
                      <h4 className="font-medium mb-2">Company Culture</h4>
                      <p className="text-muted-foreground">{company.company_culture}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Benefits & Perks */}
              {company.benefits && company.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Benefits & Perks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {company.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{company.industry}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{company.company_size}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Founded</span>
                    <span className="font-medium">{company.founded_year}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Headquarters</span>
                    <span className="font-medium">{company.headquarters}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.website && (
                    <a 
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {company.website}
                    </a>
                  )}
                  {company.contact_email && (
                    <a 
                      href={`mailto:${company.contact_email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {company.contact_email}
                    </a>
                  )}
                  {company.contact_phone && (
                    <a 
                      href={`tel:${company.contact_phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {company.contact_phone}
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Featured Employees */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    People at {company.company_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employees.slice(0, 5).map((employee) => (
                      <Link
                        key={employee.id}
                        to={`/network/people/${employee.id}`}
                        className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.profile_picture_url} />
                          <AvatarFallback className="bg-muted text-xs">
                            {generateInitials(employee)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {formatDisplayName(employee)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {employee.headline || employee.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                    {employees.length > 5 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setActiveTab('employees')}
                      >
                        View all {employees.length} employees
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No updates yet. Stay tuned for company news!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {updates.map((update) => (
                    <div key={update.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={company.logo_url} />
                          <AvatarFallback>
                            {company.company_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{company.company_name}</h4>
                            <Badge variant="outline">{update.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(update.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-3">{update.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {update.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {update.comments_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                People at {company.company_name} ({employees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee) => (
                  <Link
                    key={employee.id}
                    to={`/network/people/${employee.id}`}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.profile_picture_url} />
                      <AvatarFallback className="bg-muted">
                        {generateInitials(employee)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {formatDisplayName(employee)}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {employee.headline || employee.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No open positions at the moment.</p>
                <p className="text-sm">Check back later for new opportunities!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isEditable && (
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Eye className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{analytics?.profile_views.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">+{analytics?.follower_growth}</p>
                  <p className="text-sm text-muted-foreground">New Followers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{analytics?.post_engagement}%</p>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <p className="text-2xl font-bold">{analytics?.job_applications}</p>
                  <p className="text-sm text-muted-foreground">Job Applications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">{analytics?.employee_referrals}</p>
                  <p className="text-sm text-muted-foreground">Employee Referrals</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};