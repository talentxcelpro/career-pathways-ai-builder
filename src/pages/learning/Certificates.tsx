
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share2, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Certificates = () => {
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['user_certificates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          *,
          courses (
            title,
            category,
            instructor_name,
            duration_hours
          )
        `)
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .not('certificate_url', 'is', null)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleDownloadCertificate = (certificateUrl: string, courseName: string) => {
    const link = document.createElement('a');
    link.href = certificateUrl;
    link.download = `${courseName.replace(/\s+/g, '_')}_Certificate.pdf`;
    link.click();
  };

  const handleShareCertificate = async (certificateUrl: string, courseName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${courseName}`,
          text: `I just completed ${courseName} and earned a certificate!`,
          url: certificateUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(certificateUrl);
      // You could show a toast here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading certificates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">Your earned certificates and achievements</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
                  <p className="text-gray-600">Total Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {certificates.filter(cert => {
                      const completedDate = new Date(cert.completed_at);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return completedDate >= thirtyDaysAgo;
                    }).length}
                  </div>
                  <p className="text-gray-600">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ExternalLink className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(certificates.map(cert => cert.courses.category)).size}
                  </div>
                  <p className="text-gray-600">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
              <p className="text-gray-600 mb-4">Complete courses to earn certificates</p>
              <Link to="/learning">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <Badge variant="secondary">{certificate.courses.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{certificate.courses.title}</CardTitle>
                  <CardDescription>
                    Completed on {new Date(certificate.completed_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p><strong>Instructor:</strong> {certificate.courses.instructor_name}</p>
                      <p><strong>Duration:</strong> {certificate.courses.duration_hours} hours</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownloadCertificate(
                          certificate.certificate_url, 
                          certificate.courses.title
                        )}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleShareCertificate(
                          certificate.certificate_url, 
                          certificate.courses.title
                        )}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>

                    <Link to={`/learning/${certificate.course_id}`} className="block">
                      <Button variant="ghost" size="sm" className="w-full">
                        View Course Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
