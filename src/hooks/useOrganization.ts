import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const useOrganizationData = () => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      
      // For now, get all organizations (simplified for demo)
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('id, name, description, created_at')
        .limit(10);

      if (error) {
        console.error('Error fetching organizations:', error);
        return;
      }

      setOrganizations(orgs || []);
      
      // Set first organization as current if none selected
      if (orgs && orgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgs[0]);
      }
    } catch (error) {
      console.error('Error in fetchOrganizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
    }
  };

  const refreshData = () => {
    fetchOrganizations();
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    currentOrganization,
    organizations,
    loading,
    switchOrganization,
    refreshData
  };
};