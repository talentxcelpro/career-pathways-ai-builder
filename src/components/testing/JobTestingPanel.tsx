import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Database, CheckCircle, AlertCircle } from 'lucide-react';

export const JobTestingPanel = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState(0);
  const [seedingResults, setSeedingResults] = useState(null);

  const handleSeedJobs = async () => {
    setIsSeeding(true);
    setSeedingProgress(0);
    setSeedingResults(null);

    try {
      // First clear all existing jobs
      setSeedingProgress(10);
      const { error: clearError } = await supabase
        .from('jobs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (clearError) {
        throw new Error(`Failed to clear jobs: ${clearError.message}`);
      }

      setSeedingProgress(20);

      // Check if we have scraped jobs data
      const { data: scrapedJobs, error: scrapedError } = await supabase
        .from('scraped_jobs')
        .select('*')
        .order('quality_score', { ascending: false })
        .limit(15);

      if (scrapedError) {
        console.warn('No scraped jobs found, using sample data:', scrapedError.message);
      }

      setSeedingProgress(30);

      // If no scraped jobs, create realistic sample jobs
      const jobsToCreate = scrapedJobs && scrapedJobs.length > 0 
        ? scrapedJobs.slice(0, 10)
        : createSampleJobs();

      setSeedingProgress(40);

      const createdJobs = [];
      for (let i = 0; i < Math.min(jobsToCreate.length, 10); i++) {
        const jobData = scrapedJobs && scrapedJobs.length > 0 
          ? createJobFromScraped(jobsToCreate[i] as any)
          : (jobsToCreate[i] as any);

        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .insert(jobData)
          .select('id, title')
          .single();

        if (jobError) {
          console.error(`Failed to create job ${i + 1}:`, jobError);
          continue;
        }

        createdJobs.push({
          id: job.id,
          title: job.title,
          company: (jobData as any).company_name,
          location: (jobData as any).location
        });

        setSeedingProgress(40 + (i + 1) * 5);
      }

      setSeedingProgress(100);
      setSeedingResults({
        jobsCreated: createdJobs.length,
        processedJobs: createdJobs,
        dataSource: scrapedJobs && scrapedJobs.length > 0 ? 'scraped' : 'sample'
      });

      toast.success(`✅ Successfully created ${createdJobs.length} fresh test jobs!`);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Job seeding failed:', error);
      toast.error(`❌ Job seeding failed: ${error.message}`);
      setSeedingProgress(0);
    } finally {
      setIsSeeding(false);
    }
  };

  const createSampleJobs = () => {
    return [
      {
        title: "Senior React Developer",
        description: "Join our innovative team to build next-generation web applications using React, TypeScript, and modern frameworks. We're looking for experienced developers who are passionate about creating exceptional user experiences.",
        company_name: "TechnoVision Solutions",
        location: "Bangalore, India",
        employment_type: "full-time",
        experience_level: "senior",
        external_url: "https://technovision.com/careers/senior-react-developer",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Data Science Manager",
        description: "Lead our data science team in developing machine learning models and analytics solutions. Ideal candidate has experience with Python, SQL, and cloud platforms like AWS or Azure.",
        company_name: "DataFlow Analytics",
        location: "Mumbai, India",
        employment_type: "full-time",
        experience_level: "senior",
        external_url: "https://dataflow.com/jobs/data-science-manager",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Product Designer",
        description: "Design beautiful and intuitive user interfaces for our mobile and web applications. Looking for creative professionals with experience in Figma, user research, and design systems.",
        company_name: "Creative Labs India",
        location: "Remote",
        employment_type: "full-time",
        experience_level: "mid",
        external_url: "https://creativelabs.in/careers/product-designer",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "DevOps Engineer",
        description: "Manage and optimize our cloud infrastructure using Kubernetes, Docker, and CI/CD pipelines. Perfect opportunity for engineers passionate about automation and scalability.",
        company_name: "CloudTech Solutions",
        location: "Hyderabad, India",
        employment_type: "full-time",
        experience_level: "mid",
        external_url: "https://cloudtech.io/jobs/devops-engineer",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Full Stack Developer",
        description: "Work on exciting projects using Node.js, React, and MongoDB. We're a fast-growing startup looking for versatile developers who can work across the entire technology stack.",
        company_name: "InnovateTech Startup",
        location: "Pune, India",
        employment_type: "full-time",
        experience_level: "mid",
        external_url: "https://innovatetech.com/careers/fullstack-developer",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "AI/ML Engineer",
        description: "Develop cutting-edge artificial intelligence solutions using TensorFlow, PyTorch, and advanced machine learning algorithms. Join our research team working on computer vision and NLP projects.",
        company_name: "AI Innovations Ltd",
        location: "Bangalore, India",
        employment_type: "full-time",
        experience_level: "senior",
        external_url: "https://aiinnovations.com/jobs/ml-engineer",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Marketing Manager",
        description: "Lead our digital marketing initiatives including SEO, content marketing, and social media campaigns. Looking for creative marketers with proven track record in B2B technology marketing.",
        company_name: "Growth Marketing Co",
        location: "Delhi, India",
        employment_type: "full-time",
        experience_level: "senior",
        external_url: "https://growthmarketing.in/careers/marketing-manager",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "QA Automation Engineer",
        description: "Build and maintain automated testing frameworks using Selenium, Jest, and Cypress. Ensure product quality through comprehensive testing strategies and continuous integration.",
        company_name: "QualityFirst Technologies",
        location: "Chennai, India",
        employment_type: "full-time",
        experience_level: "mid",
        external_url: "https://qualityfirst.tech/jobs/qa-automation",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Business Analyst",
        description: "Bridge the gap between business requirements and technical solutions. Analyze business processes, gather requirements, and work closely with development teams to deliver value.",
        company_name: "BusinessLogic Consulting",
        location: "Remote",
        employment_type: "contract",
        experience_level: "mid",
        external_url: "https://businesslogic.co.in/careers/business-analyst",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Content Writer",
        description: "Create engaging content for our tech blog, marketing materials, and documentation. Perfect for writers passionate about technology, startups, and digital transformation trends.",
        company_name: "ContentCraft Media",
        location: "Remote",
        employment_type: "part-time",
        experience_level: "entry",
        external_url: "https://contentcraft.media/jobs/content-writer",
        is_active: true,
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  };

  const createJobFromScraped = (scrapedJob: any) => {
    return {
      title: scrapedJob.job_title,
      description: scrapedJob.job_description || 'Exciting opportunity to join our team and contribute to innovative projects.',
      company_name: scrapedJob.company,
      location: scrapedJob.location || 'India',
      employment_type: determineEmploymentType(scrapedJob.job_description || ''),
      experience_level: determineExperienceLevel(scrapedJob.job_description || ''),
      external_url: scrapedJob.source_url,
      is_active: true,
      posted_at: scrapedJob.posted_at || new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  };

  const determineEmploymentType = (description: string): string => {
    const text = description.toLowerCase();
    if (text.includes('part-time') || text.includes('part time')) return 'part-time';
    if (text.includes('contract') || text.includes('freelance')) return 'contract';
    if (text.includes('internship') || text.includes('intern')) return 'internship';
    return 'full-time';
  };

  const determineExperienceLevel = (description: string): string => {
    const text = description.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('fresher')) return 'entry';
    return 'mid';
  };

  const handleClearJobs = async () => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        throw new Error(error.message);
      }

      toast.success('All jobs cleared successfully');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Failed to clear jobs:', error);
      toast.error('Failed to clear jobs');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Job Testing Panel</h1>
        <p className="text-muted-foreground">Replace old jobs with fresh, realistic test data for final testing</p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Fresh Jobs
            </CardTitle>
            <CardDescription>
              Replace all current jobs with 10 high-quality, realistic job postings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSeeding && (
              <div className="space-y-2">
                <Progress value={seedingProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {seedingProgress < 20 ? 'Clearing old jobs...' : 
                   seedingProgress < 40 ? 'Checking for scraped data...' : 
                   seedingProgress < 90 ? 'Creating fresh jobs...' : 
                   'Finalizing...'}
                </p>
              </div>
            )}

            {seedingResults && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Seeding Complete!</span>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Created {seedingResults.jobsCreated} fresh jobs from {seedingResults.dataSource === 'scraped' ? 'scraped data' : 'realistic samples'}
                </p>
                <div className="space-y-1">
                  {seedingResults.processedJobs?.slice(0, 3).map((job, index) => (
                    <div key={index} className="text-xs text-green-600">
                      ✓ {job.title} at {job.company} - {job.location}
                    </div>
                  ))}
                  {seedingResults.processedJobs?.length > 3 && (
                    <div className="text-xs text-green-600">
                      + {seedingResults.processedJobs.length - 3} more jobs...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSeedJobs}
                disabled={isSeeding}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSeeding ? 'animate-spin' : ''}`} />
                {isSeeding ? 'Seeding...' : 'Seed Fresh Jobs'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleClearJobs}
                disabled={isSeeding}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                <span className="text-sm">Clear old mock jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                <span className="text-sm">Seed 10 real jobs with proper data</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                <span className="text-sm">Verify job listings display correctly</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">4</Badge>
                <span className="text-sm">Test job application flow</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">5</Badge>
                <span className="text-sm">Check SEO and performance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Ready for Testing!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This improved seeding system will create realistic, diverse job postings with proper company names, 
              locations, and descriptions. No more "Naukri Software Engineer" mock jobs - you'll get professional 
              job listings ready for final testing and launch!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};