import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const RealisticJobGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobCount, setJobCount] = useState(10);
  const [lastGenerated, setLastGenerated] = useState<any[]>([]);

  const generateJobs = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🚀 Starting job generation...');
      
      // Try edge function first
      const { data, error } = await supabase.functions.invoke('generate-realistic-jobs', {
        body: { count: jobCount }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Fallback: Insert jobs directly to database
        console.log('🔄 Using fallback method...');
        const fallbackJobs = generateFallbackJobs(jobCount);
        
        const { data: insertedJobs, error: insertError } = await supabase
          .from('jobs')
          .insert(fallbackJobs)
          .select('id, title, company_name');

        if (insertError) {
          throw new Error(insertError.message || 'Failed to insert jobs');
        }

        setLastGenerated(insertedJobs || []);
        toast.success(`✅ Successfully generated ${insertedJobs?.length || jobCount} realistic jobs!`);
        console.log('✅ Jobs generated via fallback:', insertedJobs);
        return;
      }

      if (data?.success) {
        setLastGenerated(data.jobs || []);
        toast.success(`✅ Successfully generated ${data.jobs?.length || jobCount} realistic jobs!`);
        console.log('✅ Jobs generated successfully:', data);
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error: any) {
      console.error('❌ Job generation failed:', error);
      toast.error(`Failed to generate jobs: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Generate Realistic Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobCount" className="text-sm font-medium">
            Number of jobs to generate
          </Label>
          <Input
            id="jobCount"
            type="number"
            min="1"
            max="50"
            value={jobCount}
            onChange={(e) => setJobCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            className="w-full"
          />
        </div>
        
        <Button 
          onClick={generateJobs} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate {jobCount} Jobs
            </>
          )}
        </Button>

        {lastGenerated.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Last Generation Successful
              </span>
            </div>
            <p className="text-xs text-green-700">
              Generated {lastGenerated.length} jobs including roles at companies like{' '}
              {lastGenerated.slice(0, 3).map(job => job.company_name).join(', ')}
              {lastGenerated.length > 3 && ' and more...'}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Creates jobs with realistic Indian companies</p>
          <p>• Includes proper salary ranges and locations</p>
          <p>• SEO-optimized slugs and descriptions</p>
          <p>• Mixed remote and office positions</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Fallback job generation when edge function is not available
const generateFallbackJobs = (count: number) => {
  const companies = [
    { name: "Tata Consultancy Services", domain: "jobs.tcs.com" },
    { name: "Infosys", domain: "naukri.com" },
    { name: "Wipro", domain: "indeed.com" },
    { name: "HCL Technologies", domain: "linkedin.com" },
    { name: "Tech Mahindra", domain: "glassdoor.com" },
    { name: "Microsoft India", domain: "careers.microsoft.com" },
    { name: "Google India", domain: "careers.google.com" },
    { name: "IBM India", domain: "jobs.ibm.com" },
    { name: "Accenture", domain: "careers.accenture.com" },
    { name: "Cognizant", domain: "careers.cognizant.com" }
  ];
  
  const jobTitles = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Scientist",
    "Product Manager", "UI/UX Designer", "DevOps Engineer", "Software Engineer",
    "Senior Developer", "Technical Lead", "Business Analyst", "QA Engineer"
  ];
  
  const locations = [
    "Bangalore, Karnataka", "Mumbai, Maharashtra", "Delhi, Delhi", "Hyderabad, Telangana",
    "Pune, Maharashtra", "Chennai, Tamil Nadu", "Kolkata, West Bengal", "Ahmedabad, Gujarat"
  ];
  
  const skills = [
    ["React", "JavaScript", "TypeScript", "Node.js"],
    ["Python", "Django", "Flask", "PostgreSQL"],
    ["Java", "Spring", "Microservices", "AWS"],
    ["React Native", "Flutter", "Mobile Development", "iOS"],
    ["Machine Learning", "Python", "TensorFlow", "Data Analysis"]
  ];

  const jobs = [];
  
  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const skillSet = skills[Math.floor(Math.random() * skills.length)];
    const salaryMin = 400000 + Math.floor(Math.random() * 800000);
    const salaryMax = salaryMin + Math.floor(Math.random() * 800000);
    
    jobs.push({
      title,
      description: `We are looking for a talented ${title} to join our dynamic team. You will work on exciting projects using modern technologies and contribute to innovative solutions.`,
      company_name: company.name,
      location,
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_range: `₹${(salaryMin/100000).toFixed(0)}-${(salaryMax/100000).toFixed(0)} LPA`,
      employment_type: "Full-time",
      experience_level: ["entry-level", "mid-level", "senior-level"][Math.floor(Math.random() * 3)],
      skills_required: skillSet,
      is_remote: Math.random() > 0.7,
      is_featured: Math.random() > 0.9,
      job_status: 'open',
      is_active: true,
      posted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      seo_slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${company.name.toLowerCase().replace(/\s+/g, '-')}-${location.toLowerCase().replace(/\s+/g, '-')}`.substring(0, 100),
      views_count: Math.floor(Math.random() * 100),
      applications_count: Math.floor(Math.random() * 20),
      industry: "Technology",
      department: "engineering",
      job_type: 'external',
      external_url: `https://${company.domain}/jobs/${Math.random().toString(36).substring(7)}`,
      posted_by: '00000000-0000-0000-0000-000000000000'
    });
  }
  
  return jobs;
};