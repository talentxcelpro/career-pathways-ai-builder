
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
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    console.log('Index: Loading state');
    return <div>Loading...</div>;
  }

  // Redirect logged-in users to network page
  if (isLoggedIn) {
    console.log('Index: User is logged in, redirecting to network');
    return <Navigate to="/network" replace />;
  }

  console.log('Index: Rendering landing page');
  return <LandingPage />;
};

export default Index;
