import React from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from './SEOHead';
import { StructuredDataManager } from './StructuredDataManager';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ComprehensiveSEOGeneratorProps {
  pageType: 'user' | 'job' | 'course' | 'post' | 'company' | 'tool' | 'college' | 'skill' | 'location' | 'category';
  contentId?: string;
  location?: string;
  skill?: string;
  category?: string;
}

export const ComprehensiveSEOGenerator: React.FC<ComprehensiveSEOGeneratorProps> = ({
  pageType,
  contentId,
  location,
  skill,
  category
}) => {
  const params = useParams();
  
  const { data: content, isLoading } = useQuery({
    queryKey: ['seo-content', pageType, contentId, location, skill, category],
    queryFn: async () => {
      switch (pageType) {
        case 'user':
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', contentId)
            .single();
          return userData;
          
        case 'job':
          const { data: jobData } = await supabase
            .from('jobs')
            .select(`
              *,
              companies (
                name,
                logo_url,
                industry
              )
            `)
            .eq('id', contentId)
            .single();
          return jobData;
          
        case 'company':
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', contentId)
            .single();
          return companyData;
          
        case 'post':
          const { data: postData } = await supabase
            .from('posts')
            .select(`
              *,
              profiles (
                full_name,
                title
              )
            `)
            .eq('id', contentId)
            .single();
          return postData;
          
        default:
          return null;
      }
    },
    enabled: !!contentId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const generatePageContent = () => {
    switch (pageType) {
      case 'user':
        return {
          title: `${content?.full_name || 'Professional'} - TalentXcel Profile`,
          description: `Connect with ${content?.full_name || 'this professional'} on TalentXcel. ${content?.title || 'Expert professional'} with expertise in ${content?.skills?.join(', ') || 'various skills'}.`,
          content: (
            <div className="container mx-auto py-12">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    {content?.profile_picture_url && (
                      <img 
                        src={content.profile_picture_url} 
                        alt={content.full_name}
                        className="w-24 h-24 rounded-full mr-6"
                      />
                    )}
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{content?.full_name}</h1>
                      <p className="text-xl text-gray-600 mb-2">{content?.title}</p>
                      <p className="text-gray-500">{content?.location}</p>
                    </div>
                  </div>
                  {content?.about && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-3">About</h2>
                      <p className="text-gray-700">{content.about}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Experience</h3>
                      <p className="text-gray-600">{content?.experience_years || 0} years</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {content?.skills?.map((skill: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        };
        
      case 'job':
        return {
          title: `${content?.title || 'Job Opportunity'} at ${content?.companies?.name || content?.company_name} - TalentXcel`,
          description: `Apply for ${content?.title} position at ${content?.companies?.name || content?.company_name} in ${content?.location}. ${content?.employment_type} role with ${content?.experience_level} experience required.`,
          content: (
            <div className="container mx-auto py-12">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{content?.title}</h1>
                      <p className="text-xl text-gray-600 mb-2">{content?.companies?.name || content?.company_name}</p>
                      <p className="text-gray-500">{content?.location}</p>
                    </div>
                    {content?.companies?.logo_url && (
                      <img 
                        src={content.companies.logo_url} 
                        alt={content.companies.name}
                        className="w-16 h-16 object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold text-sm text-gray-600">Employment Type</h3>
                      <p className="font-medium">{content?.employment_type}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold text-sm text-gray-600">Experience Level</h3>
                      <p className="font-medium">{content?.experience_level}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-semibold text-sm text-gray-600">Salary Range</h3>
                      <p className="font-medium">{content?.salary_range || 'Competitive'}</p>
                    </div>
                  </div>
                  
                  {content?.description && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-3">Job Description</h2>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.description }} />
                    </div>
                  )}
                  
                  {content?.skills_required && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {content.skills_required.map((skill: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        };
        
      case 'company':
        return {
          title: `${content?.name || 'Company'} - Careers & Jobs at TalentXcel`,
          description: `Explore career opportunities at ${content?.name}. ${content?.industry || 'Leading company'} with ${content?.employee_count || 'talented'} professionals. Find jobs and connect with the team.`,
          content: (
            <div className="container mx-auto py-12">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    {content?.logo_url && (
                      <img 
                        src={content.logo_url} 
                        alt={content.name}
                        className="w-24 h-24 object-contain mr-6"
                      />
                    )}
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{content?.name}</h1>
                      <p className="text-xl text-gray-600 mb-2">{content?.industry}</p>
                      <p className="text-gray-500">{content?.location}</p>
                    </div>
                  </div>
                  {content?.description && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-3">About Company</h2>
                      <p className="text-gray-700">{content.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Industry</h3>
                      <p className="text-gray-600">{content?.industry}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Founded</h3>
                      <p className="text-gray-600">{content?.founded_year}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Employees</h3>
                      <p className="text-gray-600">{content?.employee_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        };
        
      default:
        return {
          title: 'TalentXcel - AI-Powered Career Platform',
          description: 'Find your dream job, grow your skills, and advance your career with AI-powered tools.',
          content: (
            <div className="container mx-auto py-12">
              <h1 className="text-3xl font-bold mb-6">TalentXcel - Career Platform</h1>
              <p className="text-gray-600">Discover opportunities and advance your career.</p>
            </div>
          )
        };
    }
  };

  const { title, description, content: pageContent } = generatePageContent();

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        type="website"
        keywords={[pageType, 'careers', 'jobs', 'professionals', 'TalentXcel']}
      />
      <StructuredDataManager
        pageType={pageType as any}
        data={content}
      />
      {pageContent}
    </>
  );
};