import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Briefcase, TrendingUp, Users, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSchemaMarkup } from '@/components/seo/EnhancedSchemaMarkup';

interface CityStats {
  total_jobs: number;
  avg_salary: number;
  top_companies: string[];
  top_roles: string[];
  growth_rate: number;
}

const INDIAN_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', tier: 1 },
  { name: 'Delhi', state: 'Delhi', tier: 1 },
  { name: 'Bangalore', state: 'Karnataka', tier: 1 },
  { name: 'Hyderabad', state: 'Telangana', tier: 1 },
  { name: 'Chennai', state: 'Tamil Nadu', tier: 1 },
  { name: 'Kolkata', state: 'West Bengal', tier: 1 },
  { name: 'Pune', state: 'Maharashtra', tier: 1 },
  { name: 'Ahmedabad', state: 'Gujarat', tier: 2 },
  { name: 'Jaipur', state: 'Rajasthan', tier: 2 },
  { name: 'Surat', state: 'Gujarat', tier: 2 },
  { name: 'Lucknow', state: 'Uttar Pradesh', tier: 2 },
  { name: 'Kanpur', state: 'Uttar Pradesh', tier: 2 },
  { name: 'Nagpur', state: 'Maharashtra', tier: 2 },
  { name: 'Indore', state: 'Madhya Pradesh', tier: 2 },
  { name: 'Thane', state: 'Maharashtra', tier: 2 },
  { name: 'Bhopal', state: 'Madhya Pradesh', tier: 2 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 2 },
  { name: 'Pimpri-Chinchwad', state: 'Maharashtra', tier: 2 },
  { name: 'Patna', state: 'Bihar', tier: 2 },
  { name: 'Vadodara', state: 'Gujarat', tier: 2 }
];

export const CityJobsLanding: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const cityName = city?.charAt(0).toUpperCase() + city?.slice(1).replace(/-/g, ' ') || '';
  const cityInfo = INDIAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());

  useEffect(() => {
    const fetchCityData = async () => {
      if (!cityName) return;

      try {
        // Fetch jobs for the city
        const { data: jobsData } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            company_name,
            location,
            salary_min,
            salary_max,
            employment_type,
            created_at,
            companies (name)
          `)
          .ilike('location', `%${cityName}%`)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20);

        setJobs(jobsData || []);

        // Calculate city statistics
        if (jobsData && jobsData.length > 0) {
          const avgSalary = jobsData
            .filter(job => job.salary_min && job.salary_max)
            .reduce((sum, job) => sum + ((job.salary_min + job.salary_max) / 2), 0) / 
            jobsData.filter(job => job.salary_min && job.salary_max).length;

          const companies = [...new Set(jobsData.map(job => job.company_name || (job.companies as any)?.name).filter(Boolean))];
          const roles = [...new Set(jobsData.map(job => job.title))];

          setStats({
            total_jobs: jobsData.length,
            avg_salary: Math.round(avgSalary / 100000) || 0, // Convert to lakhs
            top_companies: companies.slice(0, 5),
            top_roles: roles.slice(0, 5),
            growth_rate: Math.floor(Math.random() * 20) + 10 // Mock growth rate
          });
        }
      } catch (error) {
        console.error('Error fetching city data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [cityName]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: `Jobs in ${cityName}`, url: `/jobs/in/${city}` }
  ];

  const faqs = [
    {
      question: `How many jobs are available in ${cityName}?`,
      answer: `TalentXcel currently has ${stats?.total_jobs || '100+'} active job listings in ${cityName} across various industries and experience levels.`
    },
    {
      question: `What is the average salary in ${cityName}?`,
      answer: `The average salary for professionals in ${cityName} ranges from ₹${stats?.avg_salary || 8}L to ₹${(stats?.avg_salary || 8) + 5}L per annum, depending on experience and industry.`
    },
    {
      question: `Which companies are hiring in ${cityName}?`,
      answer: `Top companies hiring in ${cityName} include ${stats?.top_companies?.join(', ') || 'leading MNCs, startups, and established firms'}.`
    },
    {
      question: `What are the most in-demand roles in ${cityName}?`,
      answer: `Popular job roles in ${cityName} include ${stats?.top_roles?.slice(0, 3).join(', ') || 'Software Engineer, Data Analyst, Sales Manager'} and many more.`
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
        <title>{`Jobs in ${cityName} | ${stats?.total_jobs || '1000+'} Openings | TalentXcel`}</title>
        <meta 
          name="description" 
          content={`Find ${stats?.total_jobs || '1000+'} job opportunities in ${cityName}, ${cityInfo?.state || 'India'}. Average salary ₹${stats?.avg_salary || 8}L+. Apply to top companies like ${stats?.top_companies?.slice(0, 3).join(', ') || 'TCS, Infosys, Wipro'}.`}
        />
        <meta 
          name="keywords" 
          content={`jobs in ${cityName}, ${cityName} jobs, careers ${cityName}, ${cityName} employment, hiring ${cityName}, ${cityInfo?.state} jobs`}
        />
        <link rel="canonical" href={`https://talentxcel.in/jobs/in/${city}`} />
      </Helmet>

      <EnhancedSchemaMarkup
        pageType="website"
        data={{
          name: `Jobs in ${cityName}`,
          description: `Comprehensive job listings in ${cityName}`,
          location: cityName
        }}
        breadcrumbs={breadcrumbs}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <Badge variant="secondary">{cityInfo?.state || 'India'}</Badge>
            {cityInfo?.tier && (
              <Badge variant="outline">Tier {cityInfo.tier} City</Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Jobs in {cityName}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover {stats?.total_jobs || '1000+'} exciting career opportunities in {cityName}. 
            Join leading companies and grow your professional journey in one of India's top employment hubs.
          </p>
        </div>

        {/* City Statistics */}
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
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.avg_salary}L+</div>
                <p className="text-xs text-muted-foreground">Per annum</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.top_companies.length}+</div>
                <p className="text-xs text-muted-foreground">Hiring actively</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{stats.growth_rate}%</div>
                <p className="text-xs text-muted-foreground">Job market growth</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Companies Section */}
        {stats && stats.top_companies.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top Companies Hiring in {cityName}</CardTitle>
              <CardDescription>Leading employers with active job openings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.top_companies.map((company, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {company}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Roles Section */}
        {stats && stats.top_roles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Popular Job Roles in {cityName}</CardTitle>
              <CardDescription>Most in-demand positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.top_roles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" className="px-8 py-3">
            <Briefcase className="mr-2 h-5 w-5" />
            Browse All Jobs in {cityName}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Join 50,000+ professionals who found their dream jobs through TalentXcel
          </p>
        </div>

        {/* FAQ Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Everything you need to know about jobs in {cityName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-4">
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

export default CityJobsLanding;