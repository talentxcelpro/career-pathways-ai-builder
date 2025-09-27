import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { SEOTemplateEngine } from './SEOTemplateEngine';

interface GenerationConfig {
  batchSize: number;
  maxPages: number;
  includeJobs: boolean;
  includeLocations: boolean;
  includeSkills: boolean;
  includeCompanies: boolean;
  includeSalaries: boolean;
}

interface GenerationProgress {
  isRunning: boolean;
  currentPage: number;
  totalPages: number;
  progress: number;
  generatedCount: number;
  errorCount: number;
  status: string;
  log: string[];
}

export const ClientSideGenerator = () => {
  const [config, setConfig] = useState<GenerationConfig>({
    batchSize: 50,
    maxPages: 10000,
    includeJobs: true,
    includeLocations: true,
    includeSkills: true,
    includeCompanies: false,
    includeSalaries: false
  });

  const [progress, setProgress] = useState<GenerationProgress>({
    isRunning: false,
    currentPage: 0,
    totalPages: 0,
    progress: 0,
    generatedCount: 0,
    errorCount: 0,
    status: 'idle',
    log: []
  });

  const { toast } = useToast();
  const templateEngine = new SEOTemplateEngine();

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setProgress(prev => ({
      ...prev,
      log: [...prev.log.slice(-49), `[${timestamp}] ${message}`]
    }));
  };

  const updateProgress = (current: number, total: number, generated: number, errors: number) => {
    setProgress(prev => ({
      ...prev,
      currentPage: current,
      totalPages: total,
      progress: total > 0 ? (current / total) * 100 : 0,
      generatedCount: generated,
      errorCount: errors
    }));
  };

  const generatePageRequests = async () => {
    const requests: any[] = [];

    try {
      // Get base data from database
      const [jobsRes, companiesRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('title, location, role_category, company_name, skills_required')
          .eq('is_active', true)
          .limit(1000),
        supabase
          .from('companies')
          .select('name, industry, location')
          .limit(200)
      ]);

      const jobs = jobsRes.data || [];
      const companies = companiesRes.data || [];

      // Extract unique values
      const locations = [...new Set([
        'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata',
        'gurgaon', 'noida', 'ahmedabad', 'jaipur', 'remote',
        ...jobs.map(j => j.location?.toLowerCase().replace(/\s+/g, '-')).filter(Boolean)
      ])].slice(0, 50);

      const jobTitles = [...new Set([
        'software-engineer', 'data-scientist', 'product-manager', 'frontend-developer',
        'backend-developer', 'full-stack-developer', 'ui-ux-designer', 'devops-engineer',
        ...jobs.map(j => j.title?.toLowerCase().replace(/\s+/g, '-')).filter(Boolean)
      ])].slice(0, 100);

      const skills = [...new Set([
        'javascript', 'python', 'react', 'node-js', 'java', 'aws', 'docker', 'kubernetes',
        ...jobs.flatMap(j => j.skills_required || []).map(s => s.toLowerCase().replace(/\s+/g, '-'))
      ])].slice(0, 80);

      // Generate page combinations
      if (config.includeJobs) {
        // Job + Location pages
        jobTitles.forEach(job => {
          locations.forEach(location => {
            if (requests.length < config.maxPages) {
              requests.push({
                pageType: 'job-location',
                primarySlug: job,
                secondarySlug: location,
                priority: 'high'
              });
            }
          });
        });
      }

      if (config.includeSkills) {
        // Skill + Location pages
        skills.forEach(skill => {
          locations.slice(0, 25).forEach(location => {
            if (requests.length < config.maxPages) {
              requests.push({
                pageType: 'skill-location',
                primarySlug: skill,
                secondarySlug: location,
                priority: 'medium'
              });
            }
          });
        });
      }

      if (config.includeLocations) {
        // Location-only pages
        locations.forEach(location => {
          if (requests.length < config.maxPages) {
            requests.push({
              pageType: 'location',
              primarySlug: location,
              priority: 'medium'
            });
          }
        });
      }

      if (config.includeCompanies && companies.length > 0) {
        // Company pages
        companies.forEach(company => {
          const companySlug = company.name?.toLowerCase().replace(/\s+/g, '-');
          if (companySlug && requests.length < config.maxPages) {
            requests.push({
              pageType: 'company',
              primarySlug: companySlug,
              priority: 'low'
            });
          }
        });
      }

      if (config.includeSalaries) {
        // Salary pages
        const salaryRanges = ['0-3-lakh', '3-5-lakh', '5-10-lakh', '10-15-lakh', '15-25-lakh', '25-lakh-plus'];
        salaryRanges.forEach(salary => {
          jobTitles.slice(0, 20).forEach(job => {
            if (requests.length < config.maxPages) {
              requests.push({
                pageType: 'salary',
                primarySlug: salary,
                secondarySlug: job,
                priority: 'low'
              });
            }
          });
        });
      }

      return requests.slice(0, config.maxPages);
    } catch (error) {
      console.error('Error generating page requests:', error);
      return [];
    }
  };

  const generateBatch = async (batch: any[]) => {
    const results: any[] = [];

    for (const request of batch) {
      try {
        // Generate SEO content using template engine
        const seoContent = await templateEngine.generateContent(request);
        
        if (seoContent) {
          // Save to database
          const { error } = await supabase
            .from('seo_generated_content')
            .upsert({
              page_type: request.pageType,
              primary_slug: request.primarySlug,
              secondary_slug: request.secondarySlug || null,
              tertiary_slug: request.tertiarySlug || null,
              meta_title: seoContent.metaTitle,
              meta_description: seoContent.metaDescription,
              h1_title: seoContent.h1Title,
              intro_content: seoContent.introContent,
              faqs: seoContent.faqs,
              structured_data: seoContent.structuredData,
              content_blocks: seoContent.contentBlocks,
              keywords: seoContent.keywords,
              quality_score: seoContent.qualityScore,
              last_generated_at: new Date().toISOString(),
              is_active: true
            }, {
              onConflict: 'page_type,primary_slug,secondary_slug,tertiary_slug'
            });

          if (error) {
            console.error('Database save error:', error);
            results.push({ success: false, error: error.message });
          } else {
            results.push({ success: true, content: seoContent });
          }
        } else {
          results.push({ success: false, error: 'Failed to generate content' });
        }
      } catch (error: any) {
        console.error('Generation error:', error);
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  };

  const startGeneration = async () => {
    setProgress(prev => ({ ...prev, isRunning: true, status: 'starting', log: [] }));
    addToLog('🚀 Starting client-side SEO generation...');

    try {
      // Generate page requests
      addToLog('📋 Generating page requests...');
      const requests = await generatePageRequests();
      
      if (requests.length === 0) {
        throw new Error('No page requests generated');
      }

      addToLog(`🎯 Generated ${requests.length} page requests`);
      
      // Process in batches
      const totalBatches = Math.ceil(requests.length / config.batchSize);
      let totalGenerated = 0;
      let totalErrors = 0;

      setProgress(prev => ({ ...prev, totalPages: requests.length, status: 'processing' }));

      for (let i = 0; i < requests.length; i += config.batchSize) {
        const batch = requests.slice(i, i + config.batchSize);
        const batchNum = Math.floor(i / config.batchSize) + 1;

        addToLog(`⚡ Processing batch ${batchNum}/${totalBatches} (${batch.length} pages)`);

        const results = await generateBatch(batch);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        totalGenerated += successful;
        totalErrors += failed;

        updateProgress(i + batch.length, requests.length, totalGenerated, totalErrors);

        if (successful > 0) {
          addToLog(`✅ Batch ${batchNum} completed: ${successful} pages generated`);
        }
        if (failed > 0) {
          addToLog(`⚠️ Batch ${batchNum} errors: ${failed} pages failed`);
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const successRate = ((totalGenerated / requests.length) * 100).toFixed(1);
      addToLog(`🎉 Generation complete!`);
      addToLog(`📊 Total pages: ${totalGenerated.toLocaleString()}`);
      addToLog(`📈 Success rate: ${successRate}%`);

      setProgress(prev => ({ ...prev, status: 'completed' }));

      toast({
        title: "✅ SEO Generation Complete",
        description: `Generated ${totalGenerated.toLocaleString()} pages with ${successRate}% success rate`,
      });

    } catch (error: any) {
      console.error('Generation error:', error);
      addToLog(`❌ Generation failed: ${error.message}`);
      setProgress(prev => ({ ...prev, status: 'error' }));
      
      toast({
        title: "Error",
        description: `Generation failed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const stopGeneration = () => {
    setProgress(prev => ({ ...prev, isRunning: false, status: 'stopped' }));
    addToLog('🛑 Generation stopped by user');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Client-Side SEO Generator
          </CardTitle>
          <CardDescription>
            Generate SEO content using local templates and direct database operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                value={config.batchSize}
                onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 50 }))}
                min="1"
                max="100"
                disabled={progress.isRunning}
              />
            </div>
            <div>
              <Label htmlFor="maxPages">Max Pages</Label>
              <Input
                id="maxPages"
                type="number"
                value={config.maxPages}
                onChange={(e) => setConfig(prev => ({ ...prev, maxPages: parseInt(e.target.value) || 10000 }))}
                min="1"
                max="100000"
                disabled={progress.isRunning}
              />
            </div>
          </div>

          {/* Page Type Selection */}
          <div>
            <Label>Page Types to Generate</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { key: 'includeJobs', label: 'Job + Location Pages', color: 'bg-primary' },
                { key: 'includeSkills', label: 'Skill + Location Pages', color: 'bg-secondary' },
                { key: 'includeLocations', label: 'Location Pages', color: 'bg-accent' },
                { key: 'includeCompanies', label: 'Company Pages', color: 'bg-muted' },
                { key: 'includeSalaries', label: 'Salary Pages', color: 'bg-destructive' }
              ].map(({ key, label, color }) => (
                <Badge
                  key={key}
                  variant={config[key as keyof GenerationConfig] ? "default" : "outline"}
                  className={`cursor-pointer ${config[key as keyof GenerationConfig] ? color : ''}`}
                  onClick={() => !progress.isRunning && setConfig(prev => ({ 
                    ...prev, 
                    [key]: !prev[key as keyof GenerationConfig] 
                  }))}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startGeneration}
              disabled={progress.isRunning}
              className="flex items-center gap-2"
            >
              {progress.isRunning ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Start Generation
                </>
              )}
            </Button>
            {progress.isRunning && (
              <Button
                onClick={stopGeneration}
                variant="outline"
              >
                Stop
              </Button>
            )}
          </div>

          {/* Progress */}
          {(progress.isRunning || progress.totalPages > 0) && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.currentPage}/{progress.totalPages} pages
                  </span>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{progress.generatedCount}</div>
                  <div className="text-sm text-muted-foreground">Generated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">{progress.errorCount}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {progress.totalPages > 0 ? ((progress.generatedCount / progress.totalPages) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2">
                {progress.status === 'processing' && <Clock className="h-4 w-4 animate-spin" />}
                {progress.status === 'completed' && <CheckCircle className="h-4 w-4 text-primary" />}
                {progress.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                <span className="capitalize">{progress.status}</span>
              </div>

              {/* Log */}
              {progress.log.length > 0 && (
                <div className="bg-muted rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="text-sm font-mono space-y-1">
                    {progress.log.slice(-10).map((entry, index) => (
                      <div key={index} className="text-muted-foreground">{entry}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};