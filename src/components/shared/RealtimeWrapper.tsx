import React from 'react';
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider';
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
        .select('primary_role, is_employer')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });
  
  const isAdmin = profile?.primary_role === 'admin';
  const isEmployer = profile?.is_employer || false;

  return (
    <RealtimeProvider showToasts={true}>
      {children}
    </RealtimeProvider>
  );
}