
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, Globe, Briefcase, Calendar } from "lucide-react";
import { JobExpirationBadge } from "@/components/jobs/JobExpirationBadge";

const CompanyPublicProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: company, isLoading } = useQuery({
    queryKey: ['public-company', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          jobs!inner(
            id,
            title,
            location,
            employment_type,
            created_at,
            expires_at,
            is_active,
            salary_min,
            salary_max,
            salary_currency,
            description,
            skills_required,
            applications_count,
            views_count
          )
        `)
        .eq('id', id)
        .eq('is_verified', true)
        .eq('jobs.is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl text-gray-600 mb-4">Company Not Found</h2>
            <p className="text-gray-500">The company profile you're looking for doesn't exist or is not publicly available.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatSalary = (min?: number, max?: number, currency = 'INR') => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `${currency} ${min?.toLocaleString()} - ${max?.toLocaleString()}`;
    if (min) return `${currency} ${min?.toLocaleString()}+`;
    return `Up to ${currency} ${max?.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Company Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={`${company.name} logo`}
                  className="h-20 w-20 object-contain rounded-lg border"
                />
              ) : (
                <div className="h-20 w-20 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex items-center space-x-4 mt-2 text-gray-600">
                  {company.industry && (
                    <span className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.location}
                    </span>
                  )}
                  {company.employee_count_range && (
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {company.employee_count_range} employees
                    </span>
                  )}
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
            {company.description && (
              <p className="mt-6 text-gray-700">{company.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Current Job Openings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Current Job Openings ({company.jobs?.length || 0})
            </CardTitle>
            <CardDescription>
              Join our team and make an impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            {company.jobs && company.jobs.length > 0 ? (
              <div className="space-y-4">
                {company.jobs.map((job: any) => (
                  <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location || 'Remote'}
                          </span>
                          <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="font-medium text-green-600">
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <JobExpirationBadge 
                          createdAt={job.created_at} 
                          expiresAt={job.expires_at}
                        />
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span>{job.views_count || 0} views</span>
                          <span>{job.applications_count || 0} applications</span>
                        </div>
                      </div>
                    </div>
                    
                    {job.description && (
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job.description.substring(0, 200)}...
                      </p>
                    )}
                    
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills_required.slice(0, 5).map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills_required.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Button className="w-full md:w-auto">
                      Apply Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No current job openings</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Benefits & Culture */}
        {(company.benefits || company.culture_description) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {company.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {company.culture_description && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Culture</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{company.culture_description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tech Stack */}
        {company.tech_stack && company.tech_stack.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tech Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {company.tech_stack.map((tech: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyPublicProfile;
