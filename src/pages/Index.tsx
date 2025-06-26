
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { LandingPage } from "@/components/landing/LandingPage";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch current user profile
  const { data: currentUserProfile } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      return data;
    },
    enabled: isLoggedIn
  });

  // Mock user data - in real app this would come from Supabase
  const mockUser = {
    name: currentUserProfile?.full_name || "Professional User",
    title: currentUserProfile?.title || "Software Engineer",
    completedCourses: 12,
    resumeViews: 156,
    appliedJobs: 8
  };

  // Check for missing profile fields
  const getMissingFields = () => {
    if (!currentUserProfile) return [];
    
    const missing = [];
    if (!currentUserProfile.full_name) missing.push('full name');
    if (!currentUserProfile.profile_picture_url) missing.push('profile picture');
    if (!currentUserProfile.title) missing.push('professional title');
    
    return missing;
  };

  const missingFields = getMissingFields();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {!isLoggedIn ? (
        <LandingPage />
      ) : (
        <UserDashboard 
          currentUserProfile={currentUserProfile}
          mockUser={mockUser}
          missingFields={missingFields}
        />
      )}
    </div>
  );
};

export default Index;
