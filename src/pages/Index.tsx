
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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

  return (
    <>
      <Helmet>
        <title>TalentXcel | AI‑Powered Career Pathways</title>
        <meta name="description" content="Map skills, projects, and roles—guided by AI—to land your dream job faster with TalentXcel." />
        <link rel="canonical" href="https://talentxcel.in/" />
      </Helmet>
      {isLoading ? (
        <div>Loading...</div>
      ) : isLoggedIn ? (
        <Navigate to="/network" replace />
      ) : (
        <LandingPage />
      )}
    </>
  );
};

export default Index;
