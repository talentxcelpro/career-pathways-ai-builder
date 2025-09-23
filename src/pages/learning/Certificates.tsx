
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateMetaTags } from '@/utils/metaTags';
import { useCertificates } from '@/hooks/useCertificates';
import { CertificateCard } from '@/components/learning/CertificateCard';
import { supabase } from '@/integrations/supabase/client';
import { Award, BookOpen } from 'lucide-react';

const Certificates = () => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    updateMetaTags({
      title: 'My Certificates | TalentXcel Learning',
      description: 'View and download your course completion certificates and achievements.'
    });
    
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const { data: certificates = [], isLoading } = useCertificates(user?.id);

  const handleDownloadCertificate = (certificate: any) => {
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = '#'; // Would be actual certificate URL from database
    link.download = `${certificate.certificate_data.course_title}_Certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareCertificate = async (certificate: any) => {
    const shareData = {
      title: `${certificate.certificate_data.course_title} Certificate`,
      text: `I've completed the ${certificate.certificate_data.course_title} course and earned my certificate!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const certificateStats = {
    total: certificates.length,
    thisMonth: certificates.filter(cert => {
      const issuedDate = new Date(cert.issued_at);
      const now = new Date();
      return issuedDate.getMonth() === now.getMonth() && 
             issuedDate.getFullYear() === now.getFullYear();
    }).length,
    categories: [...new Set(certificates.map(cert => cert.certificate_data.course_title))].length
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Award className="h-8 w-8 text-yellow-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
            <p className="text-gray-600">
              Your earned certificates and achievements
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{certificateStats.total}</div>
              <div className="text-sm text-gray-600">Total Certificates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{certificateStats.thisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{certificateStats.categories}</div>
              <div className="text-sm text-gray-600">Course Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600 mb-6">
                Complete courses to earn certificates and showcase your achievements.
              </p>
              <Button asChild>
                <a href="/learning/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Courses
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onDownload={handleDownloadCertificate}
                onShare={handleShareCertificate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
