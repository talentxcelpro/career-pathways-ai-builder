import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  switchOrganization: (orgId: string) => void;
  refreshData: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const useOrganizationData = () => {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get user's organizations through user_department_assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('user_department_assignments')
        .select(`
          department_id,
          organization_departments!inner(
            organization_id,
            organizations!inner(*)
          )
        `)
        .eq('user_id', user.id);

      if (assignmentError) {
        console.error('Error fetching user organizations:', assignmentError);
        return;
      }

      const uniqueOrgs = assignments?.reduce((acc, assignment) => {
        const org = assignment.organization_departments?.organizations;
        if (org && !acc.find(o => o.id === org.id)) {
          acc.push(org);
        }
        return acc;
      }, [] as Organization[]) || [];

      setOrganizations(uniqueOrgs);
      
      // Set first organization as current if none selected
      if (uniqueOrgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(uniqueOrgs[0]);
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
  }, [user?.id]);

  return {
    currentOrganization,
    organizations,
    loading,
    switchOrganization,
    refreshData
  };
};