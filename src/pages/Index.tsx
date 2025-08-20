
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { LandingPage } from "@/components/landing/LandingPage";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status in background
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect logged-in users after auth check completes
  if (authChecked && isLoggedIn) {
    return <Navigate to="/network" replace />;
  }

  // Show landing page immediately, even while auth is checking
  return <LandingPage />;
};

export default Index;
