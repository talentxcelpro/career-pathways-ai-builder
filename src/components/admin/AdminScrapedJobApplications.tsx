import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Download, User, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export const AdminScrapedJobApplications: React.FC = () => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['scraped-job-applications'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_scraped_job_applications');
      if (error) throw error;
      return data;
    },
  });

  const handleDownloadResume = (resumeUrl: string, candidateName: string) => {
    if (resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Scraped Job Applications & CVs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!(applications as any)?.length ? (
          <p className="text-gray-500 text-center py-8">No scraped job applications found.</p>
        ) : (
          <div className="space-y-4">
            {(applications as any).map((app: any) => (
              <div key={app.application_id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{app.full_name}</h3>
                      <Badge variant="outline" className="text-xs">External Job</Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Job:</strong> {app.job_title}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Company:</strong> {app.company_name}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Email:</strong> {app.email}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Applied: {format(new Date(app.applied_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {app.resume_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadResume(app.resume_url, app.full_name)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CV
                      </Button>
                    )}
                    
                    {app.external_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(app.external_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Original
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};