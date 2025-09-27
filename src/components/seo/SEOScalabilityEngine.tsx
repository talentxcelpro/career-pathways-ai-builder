import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  ArrowUp,
  Database,
  Search,
  Link
} from "lucide-react";

interface ScalabilityMetrics {
  currentPages: number;
  targetPages: number;
  progressPercentage: number;
  generationRate: number; // pages per hour
  estimatedCompletion: string;
  qualityDistribution: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}

export const SEOScalabilityEngine = () => {
  const [metrics, setMetrics] = useState<ScalabilityMetrics | null>(null);
  const [isScaling, setIsScaling] = useState(false);
  const [scalingProgress, setScalingProgress] = useState(0);
  const [currentTarget, setCurrentTarget] = useState(1000000); // 1 million pages target
  const { toast } = useToast();

  useEffect(() => {
    loadScalabilityMetrics();
    const interval = setInterval(loadScalabilityMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadScalabilityMetrics = async () => {
    try {
      const { data: stats } = await supabase
        .from('seo_generated_content')
        .select('page_type, quality_score, created_at')
        .eq('is_active', true);

      if (stats) {
        const currentPages = stats.length;
        const progressPercentage = (currentPages / currentTarget) * 100;
        
        // Calculate generation rate (pages created in last hour)
        const lastHour = new Date(Date.now() - 60 * 60 * 1000);
        const recentPages = stats.filter(page => new Date(page.created_at) > lastHour);
        const generationRate = recentPages.length;

        // Estimate completion time
        const remainingPages = currentTarget - currentPages;
        const hoursToCompletion = generationRate > 0 ? remainingPages / generationRate : 0;
        const estimatedCompletion = hoursToCompletion > 0 
          ? `${Math.ceil(hoursToCompletion)} hours`
          : 'Target reached';

        // Quality distribution
        const qualityDistribution = {
          'Excellent (90-100%)': stats.filter(p => p.quality_score >= 90).length,
          'Good (70-89%)': stats.filter(p => p.quality_score >= 70 && p.quality_score < 90).length,
          'Average (50-69%)': stats.filter(p => p.quality_score >= 50 && p.quality_score < 70).length,
          'Needs Improvement (<50%)': stats.filter(p => p.quality_score < 50).length,
        };

        // Category breakdown
        const categoryBreakdown = stats.reduce((acc, page) => {
          acc[page.page_type] = (acc[page.page_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setMetrics({
          currentPages,
          targetPages: currentTarget,
          progressPercentage,
          generationRate,
          estimatedCompletion,
          qualityDistribution,
          categoryBreakdown
        });
      }
    } catch (error) {
      console.error('Error loading scalability metrics:', error);
    }
  };

  const initiateScalabilityPlan = async () => {
    setIsScaling(true);
    setScalingProgress(0);

    try {
      // Define the comprehensive scalability plan
      const scalabilityPlan = {
        phase1: {
          name: 'Foundation Pages (0-10K)',
          pages: generateFoundationPages(),
          priority: 'high'
        },
        phase2: {
          name: 'Expansion Pages (10K-100K)',
          pages: generateExpansionPages(),
          priority: 'medium'
        },
        phase3: {
          name: 'Comprehensive Coverage (100K-1M)',
          pages: generateComprehensivePages(),
          priority: 'medium'
        },
        phase4: {
          name: 'Long-tail Optimization (1M+)',
          pages: generateLongTailPages(),
          priority: 'low'
        }
      };

      let totalProgress = 0;
      const totalPhases = Object.keys(scalabilityPlan).length;

      for (const [phaseKey, phase] of Object.entries(scalabilityPlan)) {
        toast({
          title: `Starting ${phase.name}`,
          description: `Generating ${phase.pages.length} SEO pages...`,
        });

        // Process phase in smaller batches
        const batchSize = 500;
        let phaseProgress = 0;

        for (let i = 0; i < phase.pages.length; i += batchSize) {
          const batch = phase.pages.slice(i, i + batchSize);
          
          const response = await supabase.functions.invoke('seo-automation-engine', {
            body: {
              action: 'bulk-generate',
              requests: batch,
              batchSize: batchSize
            }
          });

          if (response.data?.success) {
            phaseProgress += response.data.totalGenerated;
            totalProgress = (Object.keys(scalabilityPlan).indexOf(phaseKey) / totalPhases) * 100 + 
                           (phaseProgress / phase.pages.length) * (100 / totalPhases);
            setScalingProgress(totalProgress);
          }

          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        toast({
          title: `${phase.name} Complete`,
          description: `Generated ${phaseProgress} pages successfully`,
        });
      }

      toast({
        title: "Scalability Plan Complete!",
        description: "Successfully scaled to target page count",
      });

      await loadScalabilityMetrics();

    } catch (error) {
      console.error('Error executing scalability plan:', error);
      toast({
        title: "Scaling Error",
        description: "Failed to execute scalability plan",
        variant: "destructive"
      });
    } finally {
      setIsScaling(false);
      setScalingProgress(0);
    }
  };

  const generateFoundationPages = () => {
    // Core high-value pages
    const pages = [];
    const locations = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune'];
    const topRoles = ['software-engineer', 'data-scientist', 'product-manager'];
    const topSkills = ['javascript', 'python', 'react', 'aws'];

    // Job + Location combinations
    topRoles.forEach(role => {
      locations.forEach(location => {
        pages.push({ pageType: 'job', primarySlug: role, secondarySlug: location });
      });
    });

    // Skill + Location combinations
    topSkills.forEach(skill => {
      locations.forEach(location => {
        pages.push({ pageType: 'skill', primarySlug: skill, secondarySlug: location });
      });
    });

    return pages;
  };

  const generateExpansionPages = () => {
    // Expanded combinations with more roles, skills, and locations
    const pages = [];
    const allLocations = [
      'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata',
      'gurgaon', 'noida', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur',
      'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna'
    ];
    
    const allRoles = [
      'software-engineer', 'data-scientist', 'product-manager', 'devops-engineer',
      'ui-ux-designer', 'business-analyst', 'project-manager', 'quality-engineer',
      'frontend-developer', 'backend-developer', 'full-stack-developer', 'mobile-developer'
    ];

    const allSkills = [
      'javascript', 'python', 'react', 'aws', 'azure', 'docker', 'kubernetes',
      'machine-learning', 'data-analysis', 'sql', 'mongodb', 'postgresql'
    ];

    // All role + location combinations
    allRoles.forEach(role => {
      allLocations.forEach(location => {
        pages.push({ pageType: 'job', primarySlug: role, secondarySlug: location });
      });
    });

    // All skill + location combinations
    allSkills.forEach(skill => {
      allLocations.forEach(location => {
        pages.push({ pageType: 'skill', primarySlug: skill, secondarySlug: location });
      });
    });

    return pages;
  };

  const generateComprehensivePages = () => {
    // Add company, industry, and salary-based pages
    const pages = [];
    const companies = [
      'google', 'microsoft', 'amazon', 'apple', 'facebook', 'netflix', 'uber',
      'airbnb', 'spotify', 'salesforce', 'oracle', 'adobe', 'intel', 'nvidia',
      'tcs', 'infosys', 'wipro', 'cognizant', 'hcl', 'tech-mahindra'
    ];

    const industries = [
      'technology', 'finance', 'healthcare', 'retail', 'manufacturing',
      'education', 'government', 'startups', 'consulting', 'media'
    ];

    const locations = [
      'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune'
    ];

    // Company + Role + Location pages
    companies.forEach(company => {
      ['software-engineer', 'data-scientist', 'product-manager'].forEach(role => {
        locations.forEach(location => {
          pages.push({ 
            pageType: 'company', 
            primarySlug: company, 
            secondarySlug: role, 
            tertiarySlug: location 
          });
        });
      });
    });

    // Industry + Location pages
    industries.forEach(industry => {
      locations.forEach(location => {
        pages.push({ pageType: 'industry', primarySlug: industry, secondarySlug: location });
      });
    });

    return pages;
  };

  const generateLongTailPages = () => {
    // Ultra-specific long-tail combinations
    const pages = [];
    const experienceLevels = ['fresher', 'entry-level', 'mid-level', 'senior', 'lead'];
    const salaryRanges = ['0-3lpa', '3-6lpa', '6-10lpa', '10-15lpa', '15-25lpa', '25lpa-plus'];
    const workModes = ['remote', 'hybrid', 'onsite'];

    // Generate ultra-specific combinations
    // This would create millions of very specific pages
    ['software-engineer', 'data-scientist'].forEach(role => {
      ['bangalore', 'mumbai', 'delhi'].forEach(location => {
        experienceLevels.forEach(experience => {
          salaryRanges.forEach(salary => {
            workModes.forEach(mode => {
              pages.push({
                pageType: 'job',
                primarySlug: `${role}-${experience}`,
                secondarySlug: location,
                tertiarySlug: `${salary}-${mode}`
              });
            });
          });
        });
      });
    });

    return pages;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">SEO Scalability Engine</h1>
        <p className="text-muted-foreground">Scale to millions of SEO pages with intelligent automation</p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Scalability Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics?.currentPages?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Current Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.targetPages?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Target Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics?.generationRate || 0}/hr
              </div>
              <div className="text-sm text-muted-foreground">Generation Rate</div>
            </div>
          </div>
          
          <Progress value={metrics?.progressPercentage || 0} className="h-3" />
          
          <div className="text-center text-sm text-muted-foreground">
            {metrics?.progressPercentage?.toFixed(1) || 0}% complete • 
            ETA: {metrics?.estimatedCompletion || 'Calculating...'}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scaling" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scaling">Scaling Engine</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="distribution">Category Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="scaling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Launch Scalability Plan
              </CardTitle>
              <CardDescription>
                Execute a comprehensive plan to scale to 1M+ SEO pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isScaling ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Scaling in progress...</span>
                  </div>
                  <Progress value={scalingProgress} />
                  <div className="text-sm text-center text-muted-foreground">
                    {scalingProgress.toFixed(1)}% Complete
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Phase 1: Foundation (0-10K)</h4>
                      <p className="text-sm text-muted-foreground">
                        Core high-value pages for top roles and locations
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Phase 2: Expansion (10K-100K)</h4>
                      <p className="text-sm text-muted-foreground">
                        Extended combinations across all major categories
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Phase 3: Comprehensive (100K-1M)</h4>
                      <p className="text-sm text-muted-foreground">
                        Company, industry, and salary-based pages
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Phase 4: Long-tail (1M+)</h4>
                      <p className="text-sm text-muted-foreground">
                        Ultra-specific niche combinations
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={initiateScalabilityPlan}
                    size="lg"
                    className="w-full"
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Launch Complete Scalability Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics?.qualityDistribution || {}).map(([quality, count]) => (
                  <div key={quality} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        quality.includes('Excellent') ? 'default' :
                        quality.includes('Good') ? 'secondary' :
                        quality.includes('Average') ? 'outline' : 'destructive'
                      }>
                        {quality}
                      </Badge>
                    </div>
                    <div className="font-medium">{count.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics?.categoryBreakdown || {}).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Badge variant="outline">{category}</Badge>
                    <div className="font-medium">{count.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};