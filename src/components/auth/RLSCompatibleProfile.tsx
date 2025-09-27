import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, Shield, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Component to verify and display RLS-compatible user profile
 * Shows profile data and user roles to verify RLS integration
 */
export const RLSCompatibleProfile: React.FC = () => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch user profile (should work with RLS)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        setError('Failed to fetch profile data');
      } else {
        setProfile(profileData);
      }

      // Fetch user roles (should work with RLS)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (rolesError) {
        console.error('Roles fetch error:', rolesError);
        // Don't set error for roles as it's not critical
      } else {
        setUserRoles(rolesData || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          email: user.email,
        });

      if (error) {
        console.error('Error creating profile:', error);
        toast.error('Failed to create profile');
      } else {
        toast.success('Profile created successfully');
        await fetchUserData();
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      toast.error('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const createUserRole = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'user',
          is_active: true,
        });

      if (error) {
        console.error('Error creating user role:', error);
        toast.error('Failed to create user role');
      } else {
        toast.success('User role created successfully');
        await fetchUserData();
      }
    } catch (err) {
      console.error('Error creating user role:', err);
      toast.error('Failed to create user role');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to view profile information.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Authentication Status
          </CardTitle>
          <CardDescription>
            Current authentication state and session information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant="success">Authenticated</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">User ID:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email Verified:</span>
            <Badge variant={user.email_confirmed_at ? "success" : "secondary"}>
              {user.email_confirmed_at ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Profile Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Profile Data (RLS Protected)
          </CardTitle>
          <CardDescription>
            Profile information fetched through RLS policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-600 mb-2">{error}</p>
              <Button onClick={fetchUserData} size="sm">
                Retry
              </Button>
            </div>
          ) : profile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">{profile.id}</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Full Name:</span>
                <span className="text-sm">{profile.full_name || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{profile.email || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <Badge variant="success" className="w-full justify-center">
                Profile Successfully Loaded via RLS
              </Badge>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">No profile found</p>
              <Button onClick={createProfile} size="sm">
                Create Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            User Roles (RLS Protected)
          </CardTitle>
          <CardDescription>
            User roles fetched through RLS policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRoles.length > 0 ? (
            <div className="space-y-3">
              {userRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Badge variant="default">{role.role}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(role.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={role.is_active ? "success" : "secondary"}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              <Badge variant="success" className="w-full justify-center">
                Roles Successfully Loaded via RLS
              </Badge>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">No roles found</p>
              <Button onClick={createUserRole} size="sm">
                Create Default Role
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};