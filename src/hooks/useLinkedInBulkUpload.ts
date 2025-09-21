import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LinkedInImportJob {
  id: string;
  filename: string;
  uploaded_by: string;
  total_records: number;
  processed_records: number;
  successful_imports: number;
  failed_imports: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tokens_awarded: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface LinkedInImportBatch {
  id: string;
  job_id: string;
  batch_number: number;
  batch_size: number;
  processed_count: number;
  success_count: number;
  error_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface UploadOptions {
  validateEmails: boolean;
  checkDuplicates: boolean;
  autoEnrich: boolean;
  tokenRewardPerUser: number;
}

export const useLinkedInBulkUpload = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // Fetch upload statistics
  const { data: uploadStats, isLoading: statsLoading } = useQuery({
    queryKey: ['linkedin-upload-stats'],
    queryFn: async () => {
      const { data: jobs } = await supabase
        .from('linkedin_import_jobs')
        .select('*');

      if (!jobs) return null;

      const totalUploads = jobs.reduce((sum, job) => sum + job.total_records, 0);
      const successfulImports = jobs.reduce((sum, job) => sum + (job.successful_imports || 0), 0);
      const failedImports = jobs.reduce((sum, job) => sum + (job.failed_imports || 0), 0);
      
      const today = new Date().toISOString().split('T')[0];
      const todayJobs = jobs.filter(job => job.created_at.startsWith(today));
      const todayUploads = todayJobs.reduce((sum, job) => sum + job.total_records, 0);

      const completedJobs = jobs.filter(job => job.status === 'completed' && job.completed_at);
      const avgProcessingTime = completedJobs.length > 0 
        ? completedJobs.reduce((sum, job) => {
            const start = new Date(job.created_at);
            const end = new Date(job.completed_at!);
            return sum + (end.getTime() - start.getTime());
          }, 0) / completedJobs.length / 60000 // Convert to minutes
        : 0;

      return {
        totalUploads,
        successfulImports,
        failedImports,
        todayUploads,
        avgProcessingTime: `${avgProcessingTime.toFixed(1)} minutes`,
        weeklyGrowth: 18.5 // This could be calculated from historical data
      };
    }
  });

  // Fetch recent upload history
  const { data: recentUploads, isLoading: historyLoading } = useQuery({
    queryKey: ['linkedin-recent-uploads'],
    queryFn: async () => {
      const { data: jobs } = await supabase
        .from('linkedin_import_jobs')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!jobs) return [];

      return jobs.map((job: any) => ({
        id: job.id,
        filename: job.filename,
        uploadedBy: job.profiles?.full_name || 'Unknown User',
        timestamp: job.created_at,
        status: job.status,
        processed: job.processed_records || 0,
        total: job.total_records,
        errors: job.failed_imports || 0
      }));
    }
  });

  // Fetch data quality metrics
  const { data: dataQuality } = useQuery({
    queryKey: ['linkedin-data-quality'],
    queryFn: async () => {
      // Get profiles imported from LinkedIn
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .not('linkedin_url', 'is', null);

      if (!profiles) return null;

      const totalProfiles = profiles.length;
      const profilesWithEmail = profiles.filter(p => p.email).length;
      const profilesWithPhone = profiles.filter(p => p.phone).length;
      const profilesWithSkills = profiles.filter(p => p.linkedin_skills && p.linkedin_skills.length > 0).length;
      const profilesWithTitle = profiles.filter(p => p.title).length;

      const completenessScore = Math.round(
        ((profilesWithEmail + profilesWithPhone + profilesWithSkills + profilesWithTitle) / (totalProfiles * 4)) * 100
      );

      // Detect duplicates by email
      const emailGroups = profiles.reduce((acc: any, profile) => {
        if (profile.email) {
          if (!acc[profile.email]) acc[profile.email] = [];
          acc[profile.email].push(profile);
        }
        return acc;
      }, {});
      
      const duplicates = Object.values(emailGroups).filter((group: any) => group.length > 1);
      const duplicateRate = Math.round((duplicates.length / totalProfiles) * 100 * 10) / 10;

      const validationIssues = [
        { 
          type: 'Missing Email', 
          count: totalProfiles - profilesWithEmail, 
          severity: 'high' as const 
        },
        { 
          type: 'Missing Phone', 
          count: totalProfiles - profilesWithPhone, 
          severity: 'medium' as const 
        },
        { 
          type: 'Missing Skills', 
          count: totalProfiles - profilesWithSkills, 
          severity: 'medium' as const 
        },
        { 
          type: 'Missing Job Title', 
          count: totalProfiles - profilesWithTitle, 
          severity: 'low' as const 
        }
      ].filter(issue => issue.count > 0);

      return {
        completenessScore,
        duplicateRate,
        validationIssues
      };
    }
  });

  // Real-time subscription for job progress
  const subscribeToJobProgress = (jobId: string) => {
    const channel = supabase
      .channel('linkedin-import-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'linkedin_import_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          const job = payload.new as LinkedInImportJob;
          if (job.total_records > 0) {
            const progress = Math.round((job.processed_records / job.total_records) * 100);
            setUploadProgress(progress);
            
            if (job.status === 'completed' || job.status === 'failed') {
              setIsUploading(false);
              setCurrentJobId(null);
              queryClient.invalidateQueries({ queryKey: ['linkedin-upload-stats'] });
              queryClient.invalidateQueries({ queryKey: ['linkedin-recent-uploads'] });
              
              if (job.status === 'completed') {
                toast.success(`Import completed! ${job.successful_imports} profiles imported successfully.`);
              } else {
                toast.error(`Import failed: ${job.error_message}`);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: UploadOptions }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tokenRewardPerUser', options.tokenRewardPerUser.toString());
      formData.append('validateEmails', options.validateEmails.toString());
      formData.append('checkDuplicates', options.checkDuplicates.toString());
      formData.append('autoEnrich', options.autoEnrich.toString());

      const { data, error } = await supabase.functions.invoke('bulk-linkedin-import', {
        body: formData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      setIsUploading(true);
      setUploadProgress(0);
      
      // Subscribe to progress updates
      const unsubscribe = subscribeToJobProgress(data.jobId);
      
      toast.success('File uploaded successfully! Processing started.');
      
      // Clean up subscription after 5 minutes (fallback)
      setTimeout(unsubscribe, 5 * 60 * 1000);
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast.error(`Upload failed: ${error.message}`);
    }
  });

  // Template download functions
  const downloadTemplate = async (templateType: 'contacts' | 'candidates' | 'leads') => {
    const templates = {
      contacts: {
        headers: ['First Name', 'Last Name', 'Email', 'LinkedIn URL', 'Job Title', 'Company', 'Location', 'Phone'],
        filename: 'linkedin_contacts_template.csv'
      },
      candidates: {
        headers: ['First Name', 'Last Name', 'Email', 'LinkedIn URL', 'Job Title', 'Company', 'Location', 'Skills', 'Experience Years', 'Education'],
        filename: 'linkedin_candidates_template.csv'
      },
      leads: {
        headers: ['First Name', 'Last Name', 'Email', 'LinkedIn URL', 'Job Title', 'Company', 'Location', 'Industry', 'Company Size'],
        filename: 'linkedin_leads_template.csv'
      }
    };

    const template = templates[templateType];
    const csvContent = template.headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = template.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    uploadStats,
    recentUploads,
    dataQuality,
    uploadProgress,
    isUploading,
    currentJobId,
    uploadFile: uploadMutation.mutate,
    isUploadLoading: uploadMutation.isPending,
    downloadTemplate,
    isStatsLoading: statsLoading,
    isHistoryLoading: historyLoading
  };
};