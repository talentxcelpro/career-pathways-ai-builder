import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Search, Calendar, DollarSign, Users, TrendingUp, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export const ProUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Pro users
  const { data: proUsers, isLoading } = useQuery({
    queryKey: ['admin-pro-users'],
    queryFn: async () => {
      // Get active pro subscriptions with user profiles
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('pro_subscriptions')
        .select(`
          id,
          user_id,
          plan_name,
          price_amount,
          currency,
          status,
          started_at,
          expires_at,
          features
        `)
        .eq('status', 'active' as any)
        .order('created_at', { ascending: false });

      if (subscriptionsError) throw subscriptionsError;

      // Get user IDs for profiles lookup
      const userIds = subscriptionsData?.map((sub: any) => sub?.user_id) || [];
      
      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          title,
          location,
          phone,
          created_at
        `)
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get pro service profiles for additional data
      const { data: serviceProfiles, error: serviceProfilesError } = await supabase
        .from('pro_service_profiles')
        .select(`
          user_id,
          subscription_tier,
          business_name,
          bio,
          location,
          contact_email,
          contact_phone,
          is_verified,
          total_reviews,
          average_rating,
          total_bookings
        `)
        .in('user_id', userIds);

      if (serviceProfilesError) throw serviceProfilesError;

      // Merge all data
      const usersWithSubscriptions = subscriptionsData?.map((subscription: any) => {
        const profile = profiles?.find((p: any) => p?.id === subscription?.user_id);
        const serviceProfile = serviceProfiles?.find((sp: any) => sp?.user_id === subscription?.user_id);
        
        return {
          id: subscription?.user_id,
          full_name: (profile as any)?.full_name,
          title: (profile as any)?.title,
          location: (serviceProfile as any)?.location || (profile as any)?.location,
          phone: (serviceProfile as any)?.contact_phone || (profile as any)?.phone,
          created_at: (profile as any)?.created_at,
          subscription,
          serviceProfile
        };
      }) || [];

      return usersWithSubscriptions;
    }
  });

  // Fetch Pro stats
  const { data: proStats } = useQuery({
    queryKey: ['admin-pro-stats'],
    queryFn: async () => {
      const { data: subscriptions, error } = await supabase
        .from('pro_subscriptions')
        .select('*')
        .eq('status', 'active' as any);

      if (error) throw error;

      const totalRevenue = subscriptions?.reduce((sum: number, sub: any) => sum + (sub?.price_amount || 0), 0) || 0;
      const eliteUsers = subscriptions?.filter((sub: any) => sub?.plan_name === 'Elite').length || 0;
      const premiumUsers = subscriptions?.filter((sub: any) => sub?.plan_name === 'Premium').length || 0;
      const basicUsers = subscriptions?.filter((sub: any) => sub?.plan_name === 'Basic').length || 0;

      return {
        totalUsers: subscriptions?.length || 0,
        totalRevenue,
        eliteUsers,
        premiumUsers,
        basicUsers
      };
    }
  });

  const filteredUsers = proUsers?.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Elite':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'Premium':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'Basic':
        return 'bg-gradient-to-r from-green-500 to-teal-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Pro users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pro Users Management</h1>
          <p className="text-muted-foreground">Manage Pro subscriptions and Elite users</p>
        </div>
      <div className="flex items-center gap-2">
        <Crown className="h-6 w-6 text-yellow-500" />
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Elite Pro
        </Badge>
        <Button variant="outline" size="sm">
          Verification Requests
        </Button>
      </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Pro Users</p>
                <p className="text-2xl font-bold">{proStats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(proStats?.totalRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Elite Users</p>
                <p className="text-2xl font-bold">{proStats?.eliteUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Premium Users</p>
                <p className="text-2xl font-bold">{proStats?.premiumUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Basic Users</p>
                <p className="text-2xl font-bold">{proStats?.basicUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Pro users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pro Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers?.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user.full_name || 'N/A'}</h3>
                    <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <Badge className={getPlanColor((user.subscription as any)?.plan_name || (user.serviceProfile as any)?.subscription_tier || 'Basic')}>
                  {(user.subscription as any)?.plan_name || (user.serviceProfile as any)?.subscription_tier || 'Basic'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {(user.title || (user.serviceProfile as any)?.business_name) && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {(user.serviceProfile as any)?.business_name ? 'Business:' : 'Title:'}
                  </span>
                  <span>{(user.serviceProfile as any)?.business_name || user.title}</span>
                </div>
              )}

              {user.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user.serviceProfile && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Pro Service Profile</span>
                    {(user.serviceProfile as any)?.is_verified && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm space-y-1">
                    {(user.serviceProfile as any)?.total_reviews > 0 && (
                      <div className="flex justify-between">
                        <span>Reviews:</span>
                        <span className="font-medium">
                          {(user.serviceProfile as any)?.total_reviews} ({(user.serviceProfile as any)?.average_rating?.toFixed(1)}⭐)
                        </span>
                      </div>
                    )}
                    
                    {(user.serviceProfile as any)?.total_bookings > 0 && (
                      <div className="flex justify-between">
                        <span>Bookings:</span>
                        <span className="font-medium">{(user.serviceProfile as any)?.total_bookings}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {user.subscription && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Subscription</span>
                    <Badge variant="outline" className="text-xs">
                      {(user.subscription as any)?.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-medium">{(user.subscription as any)?.plan_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">
                        {formatCurrency((user.subscription as any)?.price_amount || 0)}
                      </span>
                    </div>
                    
                    {(user.subscription as any)?.expires_at && (
                      <div className="flex justify-between">
                        <span>Expires:</span>
                        <span className="font-medium">
                          {format(new Date((user.subscription as any).expires_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pro Users Found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No users match your search criteria.' : 'No Pro users available.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};