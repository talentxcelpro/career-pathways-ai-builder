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
      
      // First check user's team memberships to get their companies
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: teamMemberships, error: teamError } = await supabase
        .from('company_team_members')
        .select(`
          company_id,
          companies:company_id (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (teamError) {
        console.error('Error fetching team memberships:', teamError);
        return;
      }

      // Map companies to organization format
      const orgs = teamMemberships?.map(membership => {
        const company = Array.isArray(membership.companies) ? membership.companies[0] : membership.companies;
        return {
          id: company.id,
          name: company.name,
          description: company.description,
          created_at: company.created_at
        };
      }) || [];

      setOrganizations(orgs);
      
      // Set first organization as current if none selected
      if (orgs.length > 0 && !currentOrganization) {
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