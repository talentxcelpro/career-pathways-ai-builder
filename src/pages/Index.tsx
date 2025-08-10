
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { LandingPage } from "@/components/landing/LandingPage";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
useEffect(() => {
  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.warn('Auth getUser error:', error.message);
      setIsLoggedIn(!!user);
    } catch (err) {
      console.warn('Auth check failed, continuing as guest:', err);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  checkUser();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setIsLoggedIn(!!session);
    setIsLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);

if (isLoading) {
  return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading…</div>;
}

  // Redirect logged-in users to network page
  if (isLoggedIn) {
    return <Navigate to="/network" replace />;
  }

  return <LandingPage />;
};

export default Index;
