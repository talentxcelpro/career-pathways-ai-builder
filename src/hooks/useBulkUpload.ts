import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { extractTextFromFile } from '@/utils/resumeTextExtraction';
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

  const processCVFile = useMutation({
    mutationFn: async ({ file, batchId }: ProcessCVParams) => {
      try {
        console.log('📁 Starting file upload:', file.name, 'to batch:', batchId);
        console.log('📁 File details:', { 
          name: file.name, 
          size: file.size, 
          type: file.type 
        });
        
      // Upload file to Supabase Storage with TalentXcel naming convention
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const fileName = `talentxcel_cv_${user.id}_${timestamp}_${sanitizedFileName}`;
      const filePath = `cv-uploads/${batchId}/${fileName}`;
      
      console.log('📂 Uploading to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('✅ File uploaded successfully:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
        
      console.log('🔗 Generated public URL:', publicUrl);
      
      // Validate the URL
      if (!publicUrl || publicUrl === 'undefined') {
        throw new Error('Failed to generate valid public URL for uploaded file');
      }

      // Prepare payload with client-extracted text to improve parsing
      const extractedText = await extractTextFromFile(file).catch(() => '');
      const requestPayload = {
        fileUrl: publicUrl,
        fileName: file.name,
        fileType: file.type,
        batchId,
        extractedText
      };
      
      console.log('🚀 About to call CV parser with payload:', JSON.stringify(requestPayload, null, 2));
      
      // Call the correct AI resume parser function
      try {
        const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
          body: requestPayload,
        });
        if (error) throw error;
        console.log('✅ Function response data (invoke):', data);
        return {
          fileUrl: publicUrl,
          extractedData: data,
          fileName: file.name
        };
      } catch (invokeErr: any) {
        console.warn('⚠️ invoke() failed, falling back to direct fetch:', invokeErr?.message || invokeErr);
        const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/ai-resume-parser`;
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'apikey': anonKey
          },
          body: JSON.stringify(requestPayload)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Function responded with ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        console.log('✅ Function response data (fetch fallback):', data);
        return {
          fileUrl: publicUrl,
          extractedData: data,
          fileName: file.name
        };
      }
      } catch (error: any) {
        console.error('❌ Complete upload process failed:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('❌ CV processing error:', error);
      toast.error(`Failed to process CV: ${error.message}`);
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

  // Get talent database stats (simplified until types are updated)
  const getTalentStats = useQuery({
    queryKey: ['talent-stats'],
    queryFn: async () => {
      // Simple profile count that we know works
      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Return zeros for new tables until types are regenerated
      return {
        totalProfiles: totalProfiles || 0,
        totalCVs: 0,
        totalMatches: 0,
        totalViews: 0
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