import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Mail, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export const SEOReporting = () => {
  const reports = [
    { name: 'Monthly SEO Report', lastGenerated: '2024-01-15', status: 'ready', type: 'monthly' },
    { name: 'Keyword Performance', lastGenerated: '2024-01-14', status: 'generating', type: 'weekly' },
    { name: 'Competitor Analysis', lastGenerated: '2024-01-13', status: 'ready', type: 'quarterly' }
  ];

  const handleDownload = (reportName: string) => {
    toast.success(`Downloading ${reportName}...`);
  };

  const handleScheduleReport = () => {
    toast.success('Report scheduled successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            SEO Reports & Analytics
          </CardTitle>
          <CardDescription>Generate comprehensive SEO reports for stakeholders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={handleScheduleReport}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Reports
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">23</div>
            <div className="text-sm text-muted-foreground">Reports Generated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-muted-foreground">Downloads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm text-muted-foreground">Email Sent</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{report.name}</div>
                  <div className="text-sm text-muted-foreground">Last generated: {report.lastGenerated}</div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                  <Badge variant="outline">{report.type}</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report.name)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};