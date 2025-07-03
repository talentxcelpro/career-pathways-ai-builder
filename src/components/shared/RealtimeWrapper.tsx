import React from 'react';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeWrapperProps {
  children: React.ReactNode;
}

export function RealtimeWrapper({ children }: RealtimeWrapperProps) {
  const { user } = useAuth();
  
  // Get user profile to determine roles
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('user_role, is_employer')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });
  
  const isAdmin = profile?.user_role === 'admin';
  const isEmployer = profile?.is_employer || false;

  return (
    <RealtimeProvider 
      userId={user?.id}
      isAdmin={isAdmin}
      isEmployer={isEmployer}
    >
      {children}
    </RealtimeProvider>
  );
}