
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateUserOptions {
  email: string;
  name: string;
  role?: string;
  temporaryPassword?: string;
}

export const useUserCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createUserViaEdgeFunction = async (options: CreateUserOptions) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication session not found');
    }

    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: {
        userEmail: options.email,
        userName: options.name,
        userRole: options.role || 'job_seeker',
        temporaryPassword: options.temporaryPassword
      },
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to send a request to the Edge Function');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Unknown error from Edge Function');
    }

    return data;
  };

  const createUserDirectly = async (options: CreateUserOptions) => {
    // This is a fallback method that creates users directly through the client
    // Note: This requires the user to have admin privileges and proper RLS policies
    
    // First, check if we have admin privileges
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_app_admin', { _user_id: user.id });

    if (adminError || !isAdmin) {
      throw new Error('Admin privileges required');
    }

    // For now, we'll use the Edge Function as the primary method
    // Direct user creation would require additional admin APIs
    throw new Error('Direct user creation not implemented - please use Edge Function method');
  };

  const createUser = async (options: CreateUserOptions) => {
    setIsCreating(true);
    try {
      // Try Edge Function first
      try {
        const result = await createUserViaEdgeFunction(options);
        toast.success(`User ${options.email} created successfully`);
        return result;
      } catch (edgeFunctionError) {
        console.error('Edge Function failed:', edgeFunctionError);
        
        // If Edge Function fails, try direct creation (fallback)
        try {
          const result = await createUserDirectly(options);
          toast.success(`User ${options.email} created successfully (fallback method)`);
          return result;
        } catch (directCreationError) {
          console.error('Direct creation also failed:', directCreationError);
          throw edgeFunctionError; // Throw the original Edge Function error
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createUser,
    isCreating
  };
};
