import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle,
  FileX,
  Building2,
  DollarSign,
  Settings,
  Wrench,
  Brain,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSkillEnrichment, getFallbackSkills } from '@/hooks/useSkillEnrichment';

interface JobIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  suggestion: string;
  data?: any;
}

interface ValidationResult {
  isValid: boolean;
  severity: string;
  issues: JobIssue[];
  score: number;
}

interface CleanupSummary {
  salary_frequency_fixes?: number;
  salary_issues: number;
  company_issues: number;
  skill_mismatches: number;
  total_flagged: number;
}

export const JobDataManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [cleanupSummary, setCleanupSummary] = useState<CleanupSummary | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [skillEnrichmentProgress, setSkillEnrichmentProgress] = useState<{ current: number; total: number } | null>(null);
  
  const skillEnrichment = useSkillEnrichment();

  useEffect(() => {
    fetchJobStats();
  }, []);

  const fetchJobStats = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, status, salary_max, company_name, skills_required, title')
        .limit(1000);

      if (error) throw error;

      const totalJobs = jobs.length;
      const activeJobs = jobs.filter((j: any) => j?.status === 'active').length;
      const flaggedJobs = jobs.filter((j: any) => j?.status === 'flagged').length;
      const rejectedJobs = jobs.filter((j: any) => j?.status === 'rejected').length;
      
      // Analyze data quality issues
      const salaryIssues = jobs.filter((j: any) => j?.salary_max && j?.salary_max > 15000000).length;
      const missingCompany = jobs.filter((j: any) => !j?.company_name || j?.company_name.trim() === '').length;
      const missingSkills = jobs.filter((j: any) => !j?.skills_required || j?.skills_required.length === 0).length;

      setStats({
        totalJobs,
        activeJobs,
        flaggedJobs,
        rejectedJobs,
        salaryIssues,
        missingCompany,
        missingSkills,
        qualityScore: Math.round(((totalJobs - flaggedJobs - rejectedJobs) / totalJobs) * 100)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch job statistics');
    }
  };

  const runCleanupAll = async () => {
    setIsLoading(true);
    try {
      console.log('Starting enhanced salary frequency cleanup...');
      
      const cleanupResults = {
        salary_frequency_fixes: 0,
        salary_issues: 0,
        company_issues: 0,
        skill_mismatches: 0,
        total_flagged: 0
      };

      // 1. Detect jobs with potential salary frequency issues
      const { data: suspiciousJobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, salary_min, salary_max, employment_type, experience_level, title')
        .or('salary_max.gt.5000000,and(salary_max.lt.50000,experience_level.neq.intern)')
        .limit(500);

      if (!fetchError && suspiciousJobs) {
        console.log(`Found ${suspiciousJobs.length} potentially problematic salary entries`);
        
        // Process each suspicious job
        for (const job of suspiciousJobs) {
          let shouldUpdate = false;
          let newFrequency = 'yearly';
          let newMin = (job as any)?.salary_min;
          let newMax = (job as any)?.salary_max;
          
          // Detect likely monthly salaries (very high amounts for non-executives)
          if ((job as any)?.salary_max && (job as any)?.salary_max > 5000000 && 
              !['executive', 'director', 'vp', 'cxo'].includes((job as any)?.experience_level || '')) {
            shouldUpdate = true;
            newFrequency = 'monthly';
            newMin = (job as any)?.salary_min ? Math.round((job as any).salary_min / 12) : null;
            newMax = Math.round((job as any).salary_max / 12);
          }
          
          // Detect likely hourly rates (very small amounts for non-interns)
          else if ((job as any)?.salary_max && (job as any)?.salary_max < 50000 && (job as any)?.experience_level !== 'intern') {
            shouldUpdate = true;
            newFrequency = 'hourly';
            // Keep the amounts as-is for hourly
          }
          
          if (shouldUpdate) {
            const { error: updateError } = await supabase
              .from('jobs')
              .update({
                salary_frequency: newFrequency,
                salary_min: newMin,
                salary_max: newMax,
                notes: `Auto-corrected salary frequency to ${newFrequency}`
              } as any)
              .eq('id', (job as any)?.id);

            if (!updateError) {
              cleanupResults.salary_frequency_fixes++;
            }
          }
        }
      }

      // 2. Flag remaining unrealistic salaries (after frequency fix)
      const { data: salaryIssues, error: salaryError } = await supabase
        .from('jobs')
        .update({ 
          status: 'flagged',
          notes: 'Flagged: Still unrealistic salary after frequency correction'
        } as any)
        .gt('salary_max', 10000000)
        .select('id');

      if (!salaryError && salaryIssues) {
        cleanupResults.salary_issues = salaryIssues.length;
      }

      // 3. Flag jobs missing company names
      const { data: companyIssues, error: companyError } = await supabase
        .from('jobs')
        .update({
          status: 'flagged',
          notes: 'Flagged: Missing company information'
        } as any)
        .or('company_name.is.null,company_name.eq.')
        .select('id');

      if (!companyError && companyIssues) {
        cleanupResults.company_issues = companyIssues.length;
      }

      // 4. Flag obvious skill mismatches
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, skills_required')
        .not('skills_required', 'is', null)
        .limit(100);

      if (!jobsError && jobs) {
        for (const job of jobs) {
          const hasReactSkills = (job as any)?.skills_required?.some((skill: string) => 
            ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript'].includes(skill));
          const isNonTechRole = (job as any)?.title?.toLowerCase().includes('sales') || 
                                (job as any)?.title?.toLowerCase().includes('recruitment') ||
                                (job as any)?.title?.toLowerCase().includes('marketing') ||
                                (job as any)?.title?.toLowerCase().includes('hr');

          if (hasReactSkills && isNonTechRole) {
            await supabase
              .from('jobs')
              .update({
                status: 'flagged',
                notes: 'Flagged: Skill-role mismatch detected'
              } as any)
              .eq('id', (job as any)?.id);
            cleanupResults.skill_mismatches++;
          }
        }
      }

      cleanupResults.total_flagged = cleanupResults.salary_issues + 
                                    cleanupResults.company_issues + 
                                    cleanupResults.skill_mismatches;

      setCleanupSummary(cleanupResults);
      await fetchJobStats(); // Refresh stats
      
      toast.success(
        `Cleanup completed! Fixed ${cleanupResults.salary_frequency_fixes} salary frequencies, ` +
        `flagged ${cleanupResults.total_flagged} other issues`
      );
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to run cleanup');
    } finally {
      setIsLoading(false);
    }
  };

  const enrichJobSkills = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setSkillEnrichmentProgress({ current: 0, total: 0 });
    
    try {
      // Get jobs that need skill enrichment
      const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, title, industry, description, experience_level, employment_type, skills_required, ai_skill_tags')
        .or('skills_required.is.null,ai_skill_tags.is.null')
        .limit(50);

      if (fetchError) throw fetchError;
      if (!jobs || jobs.length === 0) {
        toast.info('No jobs found that need skill enrichment');
        return;
      }

      setSkillEnrichmentProgress({ current: 0, total: jobs.length });
      let enriched = 0;

      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        setSkillEnrichmentProgress({ current: i + 1, total: jobs.length });
        
        try {
          // Check if job already has good skills
          const hasGoodSkills = (job as any)?.ai_skill_tags && (job as any)?.ai_skill_tags.length >= 5;
          if (hasGoodSkills) continue;

          // Enrich skills using AI
          const enrichmentData = {
            job_title: (job as any)?.title,
            industry: (job as any)?.industry || undefined,
            description: (job as any)?.description ? (job as any)?.description.slice(0, 500) : undefined,
            experience_level: (job as any)?.experience_level || undefined,
            employment_type: (job as any)?.employment_type || undefined,
          };

          let newSkills: string[] = [];
          
          try {
            const result = await skillEnrichment.mutateAsync(enrichmentData);
            if (result.success && result.skills.length > 0) {
              newSkills = result.skills;
            }
          } catch (aiError) {
            console.warn('AI skill enrichment failed, using fallback:', aiError);
            newSkills = getFallbackSkills((job as any)?.title);
          }

          if (newSkills.length === 0) continue;

          // Update job with new skills
          const { error: updateError } = await supabase
            .from('jobs')
            .update({
              ai_skill_tags: newSkills,
              skills_required: (job as any)?.skills_required || newSkills,
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', (job as any)?.id);

          if (updateError) {
            console.error('Failed to update job skills:', updateError);
          } else {
            enriched++;
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (jobError) {
          console.error(`Failed to enrich skills for job ${(job as any)?.id}:`, jobError);
        }
      }

      toast.success(
        `Skill enrichment complete`,
        {
          description: `Enhanced skills for ${enriched} out of ${jobs.length} jobs`
        }
      );

    } catch (error) {
      console.error('❌ Skill enrichment failed:', error);
      toast.error('Skill enrichment failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
      setSkillEnrichmentProgress(null);
      await fetchJobStats(); // Refresh stats
    }
  };

  const validateSpecificJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      // First get the job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId as any)
        .single();

      if (jobError) throw jobError;

      // Then validate it
      const { data, error } = await supabase.functions.invoke('job-quality-checker', {
        body: { 
          action: 'validate_job',
          jobData: job
        }
      });

      if (error) throw error;

      setValidationResult(data);
      setSelectedJob(job);
      toast.success('Job validation completed');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate job');
    } finally {
      setIsLoading(false);
    }
  };

  const fixJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('job-quality-checker', {
        body: { 
          action: 'fix_job',
          jobId
        }
      });

      if (error) throw error;

      toast.success(data.message);
      await fetchJobStats(); // Refresh stats
    } catch (error) {
      console.error('Fix job error:', error);
      toast.error('Failed to fix job');
    } finally {
      setIsLoading(false);
    }
  };

  const enrichJob = async (jobData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('job-quality-checker', {
        body: { 
          action: 'enrich_job',
          jobData
        }
      });

      if (error) throw error;

      toast.success('Job data enriched successfully');
      return data.enrichedData;
    } catch (error) {
      console.error('Enrich job error:', error);
      toast.error('Failed to enrich job data');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Data Quality Manager</h1>
          <p className="text-muted-foreground">Monitor and fix job posting data quality issues</p>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={runCleanupAll} 
            disabled={isLoading}
            variant="default"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading && !skillEnrichmentProgress ? 'animate-spin' : ''}`} />
            {isLoading && !skillEnrichmentProgress ? 'Running Cleanup...' : 'Fix Salary & Company Issues'}
          </Button>
          
          <Button 
            onClick={enrichJobSkills} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && skillEnrichmentProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enriching Skills... ({skillEnrichmentProgress.current}/{skillEnrichmentProgress.total})
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                AI Skill Enrichment
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validation">Job Validation</TabsTrigger>
          <TabsTrigger value="cleanup">Cleanup Results</TabsTrigger>
          <TabsTrigger value="tools">Fix Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div className="ml-2">
                        <p className="text-sm font-medium">Total Jobs</p>
                        <p className="text-2xl font-bold">{stats.totalJobs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="ml-2">
                        <p className="text-sm font-medium">Active</p>
                        <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div className="ml-2">
                        <p className="text-sm font-medium">Flagged</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.flaggedJobs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <FileX className="h-4 w-4 text-red-600" />
                      <div className="ml-2">
                        <p className="text-sm font-medium">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{stats.rejectedJobs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Data Quality Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Quality Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(stats.qualityScore)}`}>
                      {stats.qualityScore}%
                    </span>
                  </div>
                  <Progress value={stats.qualityScore} className="w-full" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Salary Issues</span>
                      </div>
                      <Badge variant="destructive">{stats.salaryIssues}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Missing Company</span>
                      </div>
                      <Badge variant="secondary">{stats.missingCompany}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Missing Skills</span>
                      </div>
                      <Badge variant="outline">{stats.missingSkills}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Validation Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Job ID to validate"
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      validateSpecificJob((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <Button 
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter Job ID to validate"]') as HTMLInputElement;
                    if (input?.value) {
                      validateSpecificJob(input.value);
                    }
                  }}
                  disabled={isLoading}
                >
                  Validate Job
                </Button>
              </div>

              {validationResult && selectedJob && (
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                          Score: {validationResult.score}%
                        </Badge>
                        <Badge variant={getSeverityColor(validationResult.severity) as any}>
                          {validationResult.severity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {validationResult.issues.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium">Issues Found:</h4>
                        {validationResult.issues.map((issue, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{issue.type}</span>
                              <Badge variant={getSeverityColor(issue.severity) as any}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{issue.message}</p>
                            <p className="text-sm text-green-600">💡 {issue.suggestion}</p>
                          </div>
                        ))}
                        <Button 
                          onClick={() => fixJob(selectedJob.id)}
                          disabled={isLoading}
                          className="w-full"
                        >
                          <Wrench className="h-4 w-4 mr-2" />
                          Auto-Fix Job
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-green-600">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                        <p className="font-medium">Job validation passed!</p>
                        <p className="text-sm text-muted-foreground">No issues found with this job posting.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-6">
          {cleanupSummary ? (
            <Card>
              <CardHeader>
                <CardTitle>Latest Cleanup Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{cleanupSummary.salary_issues}</div>
                    <div className="text-sm text-muted-foreground">Salary Issues</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{cleanupSummary.company_issues}</div>
                    <div className="text-sm text-muted-foreground">Company Issues</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{cleanupSummary.skill_mismatches}</div>
                    <div className="text-sm text-muted-foreground">Skill Mismatches</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{cleanupSummary.total_flagged}</div>
                    <div className="text-sm text-muted-foreground">Total Flagged</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Cleanup Results Yet</h3>
                <p className="text-muted-foreground mb-4">Run the cleanup tool to see results</p>
                <Button onClick={runCleanupAll} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Cleanup Now
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Data Fixing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced fixing tools and batch operations coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};