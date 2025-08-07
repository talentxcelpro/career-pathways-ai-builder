import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkUploadParams {
  batchName: string;
  totalFiles: number;
}

interface ProcessCVParams {
  file: File;
  batchId: string;
}

export const useBulkUpload = () => {
  const queryClient = useQueryClient();

  // Create a new upload batch
  const uploadBatch = useMutation({
    mutationFn: async ({ batchName, totalFiles }: BulkUploadParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bulk_upload_batches')
        .insert({
          batch_name: batchName,
          total_files: totalFiles,
          uploaded_by: user.id,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-upload-batches'] });
      toast.success('Upload batch created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create upload batch: ' + error.message);
    }
  });

  // Process individual CV file
  const processCVFile = useMutation({
    mutationFn: async ({ file, batchId }: ProcessCVParams) => {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `cv-uploads/${batchId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Call CV parsing edge function
      const { data, error } = await supabase.functions.invoke('cv-parser', {
        body: {
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: file.type,
          batchId
        }
      });

      if (error) throw error;

      return {
        fileUrl: publicUrl,
        extractedData: data,
        fileName: file.name
      };
    },
    onError: (error: any) => {
      console.error('CV processing error:', error);
    }
  });

  // Get batch status and files
  const getBatchStatus = (batchId: string) => {
    return useQuery({
      queryKey: ['bulk-upload-batch', batchId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('bulk_upload_batches')
          .select(`
            *,
            cv_files (
              id,
              original_filename,
              parsing_status,
              parsing_results,
              created_at
            )
          `)
          .eq('id', batchId)
          .single();

        if (error) throw error;
        return data;
      },
      enabled: !!batchId
    });
  };

  // Get all upload batches
  const getUploadBatches = useQuery({
    queryKey: ['bulk-upload-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bulk_upload_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Get talent database stats
  const getTalentStats = useQuery({
    queryKey: ['talent-stats'],
    queryFn: async () => {
      const [
        { count: totalProfiles },
        { count: totalCVs },
        { count: totalMatches },
        { count: totalViews }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.rpc('count_table_rows', { table_name: 'cv_files' }),
        supabase.rpc('count_table_rows', { table_name: 'ai_job_matches_enhanced' }),
        supabase.rpc('count_table_rows', { table_name: 'profile_views' })
      ]);

      return {
        totalProfiles: totalProfiles || 0,
        totalCVs: totalCVs || 0,
        totalMatches: totalMatches || 0,
        totalViews: totalViews || 0
      };
    }
  });

  return {
    uploadBatch,
    processCVFile,
    getBatchStatus,
    getUploadBatches,
    getTalentStats
  };
};