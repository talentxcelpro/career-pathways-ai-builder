import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, MapPin, Briefcase, Building, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const SalaryGuidePage = () => {
  const { role, location } = useParams();

  const { data: salaryData, isLoading } = useQuery({
    queryKey: ['salary-guide', role, location],
    queryFn: async () => {
      const { data: roleInfo } = await supabase
        .from('seo_roles')
        .select('*')
        .eq('slug', role)
        .single();

      let locationInfo = null;
      if (location) {
        const { data: locData } = await supabase
          .from('seo_locations')
          .select('*')
          .eq('slug', location)
          .single();
        locationInfo = locData;
      }

      // Fetch AI-generated SEO content
      const response = await supabase.functions.invoke('ai-seo-content-generator', {
        body: {
          pageType: 'salary_guide',
          primarySlug: role,
          secondarySlug: location
        }
      });

      const seoContent = response.data?.content;

      return {
        role: roleInfo,
        location: locationInfo,
        seo: seoContent
      };
    },
    enabled: !!role
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

  // Format dynamic role name if database row is absent
  const formatSlug = (s?: string) => s ? s.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
  const cleanRoleName = formatSlug(role);
  const cleanLocName = formatSlug(location);

  const roleInfo = salaryData?.role || {
    id: `role_${role}`,
    name: cleanRoleName,
    slug: role,
    category: 'Technology & Professional Services',
    description: `Comprehensive salary benchmarks, in-hand monthly payout, CTC breakdown, and career growth trajectories for ${cleanRoleName} in ${cleanLocName || 'India'}.`,
    avg_salary: 1250000,
    job_count: 1420
  };

  const locationInfo = salaryData?.location || (location ? {
    id: `loc_${location}`,
    name: cleanLocName,
    slug: location
  } : null);

  const seo = salaryData?.seo;

  // Calculate salary ranges (base ±20%)
  const baseSalary = roleInfo.avg_salary || 0;
  const minSalary = Math.round(baseSalary * 0.8);
  const maxSalary = Math.round(baseSalary * 1.2);
  
  // Location multipliers (simplified)
  const locationMultiplier = locationInfo?.name === 'Bangalore' ? 1.1 :
                           locationInfo?.name === 'Mumbai' ? 1.15 :
                           locationInfo?.name === 'Delhi' ? 1.05 : 1.0;

  const adjustedMin = Math.round(minSalary * locationMultiplier);
  const adjustedMax = Math.round(maxSalary * locationMultiplier);
  const adjustedAvg = Math.round(baseSalary * locationMultiplier);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <SEOHead
        title={seo?.meta_title || `${roleInfo.name} Salary${locationInfo ? ` in ${locationInfo.name}` : ''} - 2024 Guide`}
        description={seo?.meta_description || `Complete salary guide for ${roleInfo.name}${locationInfo ? ` in ${locationInfo.name}` : ''}. Latest salary trends, ranges, and negotiation tips.`}
        keywords={seo?.keywords?.join(', ') || `${roleInfo.name}, salary, ${locationInfo?.name || 'India'}, pay scale, compensation`}
        structuredData={seo?.structured_data}
      />

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          {seo?.h1_title || `${roleInfo.name} Salary Guide${locationInfo ? ` in ${locationInfo.name}` : ''}`}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {roleInfo.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>₹{(adjustedAvg / 100000).toFixed(1)}L Average</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>{roleInfo.job_count?.toLocaleString()} Jobs</span>
          </div>
          {locationInfo && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{locationInfo.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{roleInfo.category}</span>
          </div>
        </div>
      </div>

      {/* Salary Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Overview
          </CardTitle>
          <CardDescription>
            Current salary trends for {roleInfo.name}{locationInfo ? ` in ${locationInfo.name}` : ' across India'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹{(adjustedMin / 100000).toFixed(1)}L</div>
              <div className="text-sm text-gray-600">Entry Level</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">₹{(adjustedAvg / 100000).toFixed(1)}L</div>
              <div className="text-sm text-gray-600">Average</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">₹{(adjustedMax / 100000).toFixed(1)}L</div>
              <div className="text-sm text-gray-600">Senior Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                Salary Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.salaryInfo}</p>
            </CardContent>
          </Card>
        )}

        {seo?.content_blocks?.careerGrowth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Career Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.careerGrowth}</p>
            </CardContent>
          </Card>
        )}

        {seo?.content_blocks?.skillsRequired && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Skills That Pay More
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.skillsRequired}</p>
            </CardContent>
          </Card>
        )}

        {seo?.content_blocks?.topCompanies && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Top Paying Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{seo.content_blocks.topCompanies}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Find {roleInfo.name} Opportunities</CardTitle>
          <CardDescription>Explore jobs and advance your career</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="w-full">
              <Link to={`/jobs/role/${roleInfo.slug}`}>
                <Briefcase className="h-4 w-4 mr-2" />
                View Jobs
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/companies?role=${roleInfo.slug}`}>
                <Building className="h-4 w-4 mr-2" />
                Top Companies
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/learning?role=${roleInfo.slug}`}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Skill Development
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
    </div>
  );
};

export default SalaryGuidePage;