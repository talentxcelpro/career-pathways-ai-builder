import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, TrendingUp, Building, Users, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const IndustryJobs = () => {
  const { industry } = useParams();

  const { data: industryData, isLoading } = useQuery({
    queryKey: ['seo-industry', industry],
    queryFn: async () => {
      // Create a mock industry data for now since types aren't updated
      const industryInfo = {
        name: industry === 'information-technology' ? 'Information Technology' :
              industry === 'financial-services' ? 'Financial Services' :
              industry === 'healthcare' ? 'Healthcare' :
              industry === 'e-commerce' ? 'E-commerce' :
              'Technology',
        slug: industry,
        description: `Explore career opportunities in ${industry?.replace('-', ' ')} sector`,
        job_count: 15000,
        company_count: 2500,
        growth_rate: 12.5,
        avg_salary: 900000
      };

      // Fetch AI-generated SEO content
      const response = await supabase.functions.invoke('seo-content-generator', {
        body: {
          pageType: 'industry',
          primarySlug: industry
        }
      });

      const seoContent = response.data?.content;

      return {
        industry: industryInfo,
        seo: seoContent
      };
    },
    enabled: !!industry
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!industryData?.industry) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Industry Not Found</h1>
        <p className="text-gray-600">The requested industry could not be found.</p>
      </div>
    );
  }

  const { industry: industryInfo, seo } = industryData;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <SEOHead
        title={seo?.meta_title || `${industryInfo.name} Jobs - Career Opportunities`}
        description={seo?.meta_description || `Explore career opportunities in ${industryInfo.name}. Find jobs, salary guides, and industry insights.`}
        keywords={seo?.keywords?.join(', ') || `${industryInfo.name}, jobs, careers, salary, opportunities`}
        structuredData={seo?.structured_data}
      />

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          {seo?.h1_title || `${industryInfo.name} Jobs & Careers`}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {industryInfo.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>{industryInfo.job_count?.toLocaleString()} Jobs</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>{industryInfo.company_count?.toLocaleString()} Companies</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{industryInfo.growth_rate}% Growth</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>₹{(industryInfo.avg_salary / 100000).toFixed(1)}L Average</span>
          </div>
        </div>
      </div>

      {/* Intro Content */}
      {seo?.intro_content && (
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: seo.intro_content }} />
        </div>
      )}

      {/* Content Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {seo?.content_blocks?.salaryInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.salaryInfo}</p>
            </CardContent>
          </Card>
        )}

        {seo?.content_blocks?.topCompanies && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Top Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.topCompanies}</p>
            </CardContent>
          </Card>
        )}

        {seo?.content_blocks?.skillsRequired && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Skills in Demand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.skillsRequired}</p>
            </CardContent>
          </Card>
        )}

        {seo?.content_blocks?.careerGrowth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Career Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.careerGrowth}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Explore {industryInfo.name} Opportunities</CardTitle>
          <CardDescription>Find your next career move in {industryInfo.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="w-full">
              <Link to={`/jobs?industry=${industryInfo.slug}`}>
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/companies?industry=${industryInfo.slug}`}>
                <Building className="h-4 w-4 mr-2" />
                View Companies
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/salary/${industryInfo.slug}`}>
                <DollarSign className="h-4 w-4 mr-2" />
                Salary Guide
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      {seo?.faqs && seo.faqs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {seo.faqs.map((faq: any, index: number) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Related Links */}
      <Card>
        <CardHeader>
          <CardTitle>Related Career Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/jobs/location/bangalore" className="text-blue-600 hover:underline">
              Jobs in Bangalore
            </Link>
            <Link to="/jobs/location/mumbai" className="text-blue-600 hover:underline">
              Jobs in Mumbai
            </Link>
            <Link to="/jobs/location/delhi" className="text-blue-600 hover:underline">
              Jobs in Delhi
            </Link>
            <Link to="/jobs/location/hyderabad" className="text-blue-600 hover:underline">
              Jobs in Hyderabad
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustryJobs;