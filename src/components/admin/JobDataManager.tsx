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
  Wrench
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const activeJobs = jobs.filter(j => j.status === 'active').length;
      const flaggedJobs = jobs.filter(j => j.status === 'flagged').length;
      const rejectedJobs = jobs.filter(j => j.status === 'rejected').length;
      
      // Analyze data quality issues
      const salaryIssues = jobs.filter(j => j.salary_max && j.salary_max > 15000000).length;
      const missingCompany = jobs.filter(j => !j.company_name || j.company_name.trim() === '').length;
      const missingSkills = jobs.filter(j => !j.skills_required || j.skills_required.length === 0).length;

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
      const { data, error } = await supabase.functions.invoke('job-quality-checker', {
        body: { action: 'cleanup_all_jobs' }
      });

      if (error) throw error;

      setCleanupSummary(data.cleanup_summary);
      await fetchJobStats(); // Refresh stats
      toast.success(`Cleanup completed! ${data.cleanup_summary.total_flagged} jobs flagged.`);
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to run cleanup');
    } finally {
      setIsLoading(false);
    }
  };

  const validateSpecificJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      // First get the job data
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
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
        <Button 
          onClick={runCleanupAll} 
          disabled={isLoading}
          variant="default"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Running Cleanup...' : 'Run Full Cleanup'}
        </Button>
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