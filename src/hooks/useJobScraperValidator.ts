import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export interface JobValidationResult {
  success: boolean
  total_jobs: number
  valid_jobs: any[]
  rejected_jobs: Array<{
    job: any
    reason: string
    score: number
  }>
  stats: {
    accepted_count: number
    rejected_count: number
    acceptance_rate: string
  }
}

export const useJobScraperValidator = () => {
  return useMutation({
    mutationFn: async ({ jobs, min_score = 15 }: { jobs: any[], min_score?: number }): Promise<JobValidationResult> => {
      console.log('🔍 Validating jobs:', { count: jobs.length, min_score })
      
      const { data, error } = await supabase.functions.invoke('job-scraper-validator', {
        body: { jobs, min_score }
      })

      if (error) {
        console.error('❌ Job validation error:', error)
        throw error
      }

      console.log('✅ Job validation result:', data)
      return data
    },
    onSuccess: (data) => {
      const { stats } = data
      toast.success(
        `Job validation complete: ${stats.accepted_count} accepted (${stats.acceptance_rate})`,
        {
          description: `${stats.rejected_count} jobs rejected for quality issues`
        }
      )
    },
    onError: (error) => {
      console.error('❌ Job validation failed:', error)
      toast.error('Job validation failed', {
        description: error.message || 'Failed to validate scraped jobs'
      })
    }
  })
}

// Utility function to validate a single job
export const validateSingleJob = (job: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!job.job_url || typeof job.job_url !== 'string' || job.job_url.trim() === '') {
    errors.push('Missing or invalid job URL')
  }

  if (!job.title || typeof job.title !== 'string' || job.title.trim() === '') {
    errors.push('Missing or invalid job title')
  }

  if (!job.company || typeof job.company !== 'string' || job.company.trim() === '') {
    errors.push('Missing or invalid company name')
  }

  if (!job.posted_date) {
    errors.push('Missing posted date')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export default useJobScraperValidator