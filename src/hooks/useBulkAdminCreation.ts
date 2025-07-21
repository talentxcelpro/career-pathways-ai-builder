
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkAdminResult {
  email: string;
  success: boolean;
  userId?: string;
  password?: string;
  error?: string;
  message: string;
}

interface BulkAdminResponse {
  success: boolean;
  results: BulkAdminResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export const useBulkAdminCreation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BulkAdminResult[]>([]);

  const createBulkSuperAdmins = async (emailList: string[]): Promise<BulkAdminResponse | null> => {
    setIsLoading(true);
    try {
      console.log('Creating bulk super admins for:', emailList);

      const { data, error } = await supabase.functions.invoke('bulk-create-super-admins', {
        body: { emailList }
      });

      if (error) {
        console.error('Bulk admin creation error:', error);
        toast.error(`Failed to create super admins: ${error.message}`);
        return null;
      }

      if (data?.success) {
        setResults(data.results);
        toast.success(`Successfully created ${data.summary.successful} out of ${data.summary.total} super admin accounts!`);
        
        if (data.summary.failed > 0) {
          toast.warning(`${data.summary.failed} accounts failed to create. Check the results for details.`);
        }

        return data;
      } else {
        toast.error('Failed to create super admin accounts');
        return null;
      }
    } catch (error) {
      console.error('Error in bulk admin creation:', error);
      toast.error('An unexpected error occurred while creating super admin accounts');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return {
    createBulkSuperAdmins,
    isLoading,
    results,
    clearResults
  };
};
