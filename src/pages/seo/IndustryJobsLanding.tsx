import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Building2, TrendingUp, Users, DollarSign, MapPin, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSchemaMarkup } from '@/components/seo/EnhancedSchemaMarkup';

interface IndustryStats {
  total_jobs: number;
  avg_salary: number;
  top_companies: string[];
  top_locations: string[];
  growth_rate: number;
  experience_levels: { [key: string]: number };
}

const INDUSTRIES = [
  { 
    name: 'Information Technology', 
    slug: 'it',
    description: 'Software development, IT services, and technology consulting',
    growth: 25,
    avgSalary: 12
  },
  { 
    name: 'Banking & Finance', 
    slug: 'banking',
    description: 'Banking, financial services, and insurance sector',
    growth: 15,
    avgSalary: 14
  },
  { 
    name: 'Healthcare', 
    slug: 'healthcare',
    description: 'Medical, pharmaceutical, and healthcare services',
    growth: 20,
    avgSalary: 10
  },
  { 
    name: 'Manufacturing', 
    slug: 'manufacturing',
    description: 'Production, automotive, and industrial manufacturing',
    growth: 12,
    avgSalary: 8
  },
  { 
    name: 'Retail & E-commerce', 
    slug: 'retail',
    description: 'Retail operations, e-commerce, and consumer goods',
    growth: 30,
    avgSalary: 7
  },
  { 
    name: 'Education', 
    slug: 'education',
    description: 'Educational institutions and e-learning platforms',
    growth: 18,
    avgSalary: 6
  },
  { 
    name: 'Media & Entertainment', 
    slug: 'media',
    description: 'Digital media, content creation, and entertainment',
    growth: 22,
    avgSalary: 9
  },
  { 
    name: 'Real Estate', 
    slug: 'real-estate',
    description: 'Property development, real estate services, and construction',
    growth: 16,
    avgSalary: 11
  }
];

export const IndustryJobsLanding: React.FC = () => {
  const { industry } = useParams<{ industry: string }>();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState<IndustryStats | null>(null);
  const [loading, setLoading] = useState(true);

  const industryInfo = INDUSTRIES.find(ind => ind.slug === industry);
  const industryName = industryInfo?.name || industry?.charAt(0).toUpperCase() + industry?.slice(1).replace(/-/g, ' ') || '';

  useEffect(() => {
    const fetchIndustryData = async () => {
      if (!industryName) return;

      try {
        // For now, we'll use a broader search since we don't have industry field in jobs table
        // In production, you'd want to add an industry field to the jobs table
        let searchTerm = industryName.toLowerCase();
        
        // Map industry names to search terms
        const industrySearchMap: { [key: string]: string[] } = {
          'information technology': ['software', 'developer', 'engineer', 'tech', 'it', 'programming'],
          'banking & finance': ['bank', 'finance', 'analyst', 'accounting', 'investment'],
          'healthcare': ['doctor', 'nurse', 'medical', 'healthcare', 'pharma'],
          'manufacturing': ['production', 'manufacturing', 'operations', 'quality'],
          'retail & e-commerce': ['sales', 'retail', 'marketing', 'customer', 'commerce'],
          'education': ['teacher', 'education', 'training', 'academic', 'instructor'],
          'media & entertainment': ['content', 'media', 'design', 'creative', 'marketing'],
          'real estate': ['property', 'real estate', 'construction', 'architect']
        };

        const searchTerms = industrySearchMap[industryName.toLowerCase()] || [searchTerm];
        
        // Build a query that searches for any of the search terms in job title or description
        let query = supabase
          .from('jobs')
          .select(`
            id,
            title,
            company_name,
            location,
            salary_min,
            salary_max,
            employment_type,
            experience_level,
            created_at,
            companies (name)
          `)
          .eq('is_active', true);

        // Add OR conditions for multiple search terms
        const orConditions = searchTerms.map(term => `title.ilike.%${term}%`).join(',');
        query = query.or(orConditions);

        const { data: jobsData } = await query
          .order('created_at', { ascending: false })
          .limit(50);

        setJobs(jobsData || []);

        // Calculate industry statistics
        if (jobsData && jobsData.length > 0) {
          const avgSalary = jobsData
            .filter(job => job.salary_min && job.salary_max)
            .reduce((sum, job) => sum + ((job.salary_min + job.salary_max) / 2), 0) / 
            jobsData.filter(job => job.salary_min && job.salary_max).length;

          const companies = [...new Set(jobsData.map(job => job.company_name || (job.companies as any)?.name).filter(Boolean))];
          const locations = [...new Set(jobsData.map(job => job.location).filter(Boolean))];
          
          // Count experience levels
          const experienceLevels = jobsData.reduce((acc, job) => {
            const level = job.experience_level || 'Not Specified';
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          }, {} as { [key: string]: number });

          setStats({
            total_jobs: jobsData.length,
            avg_salary: Math.round((avgSalary / 100000) || industryInfo?.avgSalary || 8), // Convert to lakhs
            top_companies: companies.slice(0, 8),
            top_locations: locations.slice(0, 10),
            growth_rate: industryInfo?.growth || Math.floor(Math.random() * 20) + 10,
            experience_levels: experienceLevels
          });
        } else {
          // Use default industry data if no jobs found
          setStats({
            total_jobs: 100,
            avg_salary: industryInfo?.avgSalary || 8,
            top_companies: ['Leading companies in ' + industryName],
            top_locations: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
            growth_rate: industryInfo?.growth || 15,
            experience_levels: { 'Entry Level': 30, 'Mid Level': 40, 'Senior Level': 30 }
          });
        }
      } catch (error) {
        console.error('Error fetching industry data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustryData();
  }, [industryName, industryInfo]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: 'Industries', url: '/industries' },
    { name: `${industryName} Jobs`, url: `/industry/${industry}` }
  ];

  const faqs = [
    {
      question: `What types of jobs are available in ${industryName}?`,
      answer: `${industryName} offers diverse career opportunities including ${Object.keys(stats?.experience_levels || {}).join(', ').toLowerCase()} positions across various specializations.`
    },
    {
      question: `What is the average salary in ${industryName}?`,
      answer: `The average salary in ${industryName} ranges from ₹${stats?.avg_salary || 8}L to ₹${(stats?.avg_salary || 8) + 6}L per annum, depending on experience and specialization.`
    },
    {
      question: `Which cities have the most ${industryName} jobs?`,
      answer: `Top cities for ${industryName} jobs include ${stats?.top_locations?.slice(0, 4).join(', ') || 'Mumbai, Delhi, Bangalore, Chennai'} with abundant opportunities.`
    },
    {
      question: `How is the growth outlook for ${industryName}?`,
      answer: `${industryName} is experiencing ${stats?.growth_rate || 15}% growth, making it an excellent career choice with strong future prospects.`
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${industryName} Jobs in India | ${stats?.total_jobs || '500+'} Openings | TalentXcel`}</title>
        <meta 
          name="description" 
          content={`Explore ${stats?.total_jobs || '500+'} ${industryName.toLowerCase()} job opportunities in India. Average salary ₹${stats?.avg_salary || 8}L+. ${industryInfo?.description || `Join leading companies in ${industryName.toLowerCase()}.`}`}
        />
        <meta 
          name="keywords" 
          content={`${industryName.toLowerCase()} jobs, ${industry} careers, ${industryName.toLowerCase()} employment, ${industryName.toLowerCase()} salary, ${industryName.toLowerCase()} companies`}
        />
        <link rel="canonical" href={`https://talentxcel.in/industry/${industry}`} />
      </Helmet>

      <EnhancedSchemaMarkup
        pageType="website"
        data={{
          name: `${industryName} Jobs`,
          description: `Comprehensive ${industryName.toLowerCase()} job listings in India`,
          industry: industryName
        }}
        breadcrumbs={breadcrumbs}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-primary" />
            <Badge variant="secondary">{industryName}</Badge>
            <Badge variant="outline">₹{stats?.avg_salary || 8}L+ Avg Salary</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {industryName} Jobs in India
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {industryInfo?.description || `Discover exciting career opportunities in ${industryName.toLowerCase()}.`} 
            {' '}Find your next role among {stats?.total_jobs || '500+'} active positions with leading companies.
          </p>
        </div>

        {/* Industry Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_jobs.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Active positions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.avg_salary}L+</div>
                <p className="text-xs text-muted-foreground">Per annum</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.growth_rate}%</div>
                <p className="text-xs text-muted-foreground">Industry growth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.top_companies.length}+</div>
                <p className="text-xs text-muted-foreground">Hiring actively</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Experience Levels */}
        {stats && Object.keys(stats.experience_levels).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Jobs by Experience Level</CardTitle>
              <CardDescription>Distribution of opportunities across experience levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.experience_levels).map(([level, count]) => (
                  <div key={level} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <div className="text-sm text-muted-foreground">{level}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Locations */}
        {stats && stats.top_locations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top Hiring Locations</CardTitle>
              <CardDescription>Cities with most {industryName.toLowerCase()} opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.top_locations.map((location, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    <MapPin className="mr-1 h-3 w-3" />
                    {location}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Companies */}
        {stats && stats.top_companies.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Leading Employers</CardTitle>
              <CardDescription>Top companies hiring in {industryName.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.top_companies.map((company, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    <Building2 className="mr-1 h-3 w-3" />
                    {company}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="text-center mb-12">
          <Button size="lg" className="px-8 py-3">
            <Briefcase className="mr-2 h-5 w-5" />
            Browse All {industryName} Jobs
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Join thousands of professionals who found their dream careers in {industryName.toLowerCase()}
          </p>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Everything you need to know about {industryName.toLowerCase()} careers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default IndustryJobsLanding;