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

  // Smart CV processing tier detection
  const detectProcessingTier = (file: File, extractedText: string) => {
    const indicators = {
      isSimple: extractedText.length < 1500 && extractedText.includes('@') && extractedText.includes('experience'),
      isComplex: file.size > 5000000 || extractedText.length > 10000 || extractedText.length < 100,
      needsOCR: extractedText.length < 100 && file.type === 'application/pdf'
    };
    
    if (indicators.isSimple) return 'regex';
    if (indicators.needsOCR || indicators.isComplex) return 'premium-ai';
    return 'basic-ai';
  };

  // Enhanced regex extraction for simple CVs (80% of cases)
  const smartExtract = (text: string) => {
    try {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const phoneRegex = /(\+?\d{1,4}[\s-]?)?(\d{3}[\s-]?\d{3}[\s-]?\d{4})/g;
      const nameMatch = text.match(/^([A-Z][a-zA-Z\s]{2,30})$/m);
      
      const email = text.match(emailRegex)?.[0];
      const phone = text.match(phoneRegex)?.[0];
      const name = nameMatch?.[1];
      
      if (email && name && text.length < 1500) {
        return {
          profile: { fullName: name, email, phone },
          summary: text.substring(0, 200) + '...',
          experience: [],
          education: [],
          skills: []
        };
      }
    } catch (error) {
      console.warn('Regex extraction failed:', error);
    }
    return null;
  };

  // Process single CV file with smart tier routing
  const processCVFile = useMutation({
    mutationFn: async ({ file, batchId }: ProcessCVParams) => {
      try {
        console.log('📁 Starting file upload:', file.name, 'to batch:', batchId);
        
        // Get user authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        const fileName = `talentxcel_cv_${user.id}_${timestamp}_${sanitizedFileName}`;
        const filePath = `cv-uploads/${batchId}/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
          
        if (!publicUrl || publicUrl === 'undefined') {
          throw new Error('Failed to generate valid public URL for uploaded file');
        }

        // Extract text and determine processing tier
        const extractedText = await extractTextFromFile(file).catch(() => '');
        const processingTier = detectProcessingTier(file, extractedText);
        
        console.log(`🎯 Processing tier: ${processingTier} for ${file.name}`);
        
        // Try smart extraction first for simple CVs
        if (processingTier === 'regex') {
          const smartResult = smartExtract(extractedText);
          if (smartResult) {
            console.log('✅ Smart extraction successful for:', file.name);
            return {
              fileUrl: publicUrl,
              extractedData: smartResult,
              fileName: file.name,
              processingTier: 'regex'
            };
          }
        }
        
        // Fallback to AI processing
        const requestPayload = {
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: file.type,
          batchId,
          extractedText,
          processingTier
        };
        
        try {
          const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
            body: requestPayload,
          });
          if (error) throw error;
          
          return {
            fileUrl: publicUrl,
            extractedData: data,
            fileName: file.name,
            processingTier
          };
        } catch (invokeErr: any) {
          console.warn('⚠️ invoke() failed, falling back to direct fetch:', invokeErr?.message);
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
          return {
            fileUrl: publicUrl,
            extractedData: data,
            fileName: file.name,
            processingTier
          };
        }
      } catch (error: any) {
        console.error('❌ CV processing failed:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('❌ CV processing error:', error);
      toast.error(`Failed to process CV: ${error.message}`);
    }
  });

  // Process multiple CVs in parallel (25 files simultaneously)
  const processBulkCVFiles = useMutation({
    mutationFn: async ({ files, batchId }: { files: File[], batchId: string }) => {
      console.log(`🚀 Starting bulk processing of ${files.length} CVs`);
      
      // Process files in chunks of 25 for optimal performance
      const CHUNK_SIZE = 25;
      const results = [];
      
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        console.log(`📦 Processing chunk ${Math.floor(i/CHUNK_SIZE) + 1}: ${chunk.length} files`);
        
        // Process chunk in parallel with smart retry
        const chunkPromises = chunk.map(async (file, index) => {
          const maxRetries = 3;
          let lastError;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const result = await processCVFile.mutateAsync({ file, batchId });
              return { success: true, result, file: file.name };
            } catch (error: any) {
              lastError = error;
              console.warn(`❌ Attempt ${attempt} failed for ${file.name}:`, error.message);
              
              if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            }
          }
          
          return { success: false, error: lastError, file: file.name };
        });
        
        const chunkResults = await Promise.allSettled(chunkPromises);
        results.push(...chunkResults);
        
        // Small delay between chunks to prevent rate limiting
        if (i + CHUNK_SIZE < files.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Process results
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
      
      console.log(`✅ Bulk processing complete: ${successful.length} successful, ${failed.length} failed`);
      
      return {
        successful: successful.length,
        failed: failed.length,
        results: results
      };
    },
    onSuccess: (data) => {
      toast.success(`Processed ${data.successful} CVs successfully${data.failed > 0 ? `, ${data.failed} failed` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['bulk-upload-batches'] });
    },
    onError: (error: any) => {
      console.error('❌ Bulk processing error:', error);
      toast.error('Bulk processing failed: ' + error.message);
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
    processBulkCVFiles,
    getBatchStatus,
    getUploadBatches,
    getTalentStats
  };
};