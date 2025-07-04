import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Users } from "lucide-react";

const JobsByLocation = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: locationData, isLoading } = useQuery({
    queryKey: ['seo-location', slug],
    queryFn: async () => {
      const { data: location } = await supabase
        .from('seo_locations')
        .select('*')
        .eq('slug', slug)
        .single();

      const { data: seoMeta } = await supabase
        .from('seo_meta_tags')
        .select('*')
        .eq('path', `/seo/jobs/location/${slug}`)
        .single();

      return { location, seoMeta };
    },
    enabled: !!slug
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!locationData?.location) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Location Not Found</h1>
      </div>
    </div>;
  }

  const { location, seoMeta } = locationData;

  return (
    <>
      <SEOHead
        title={seoMeta?.title || `Jobs in ${location.name} - TalentXcel`}
        description={seoMeta?.description || `Find jobs in ${location.name}`}
        keywords={seoMeta?.keywords}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-4xl font-bold text-gray-900">Jobs in {location.name}</h1>
            </div>
            <p className="text-xl text-gray-600">
              Discover {location.job_count?.toLocaleString()}+ job opportunities in {location.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Jobs</p>
                    <p className="text-3xl font-bold">{location.job_count?.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Companies</p>
                    <p className="text-3xl font-bold">{location.company_count?.toLocaleString()}</p>
                  </div>
                  <Building className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Location</p>
                    <p className="text-xl font-bold">{location.state}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobsByLocation;