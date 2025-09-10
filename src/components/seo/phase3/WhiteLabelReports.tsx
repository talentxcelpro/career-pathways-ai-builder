import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar, 
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Star
} from 'lucide-react';

interface ReportData {
  reportId: string;
  reportType: string;
  clientName: string;
  generatedAt: string;
  summary: {
    totalKeywords: number;
    averageRank: number;
    trafficGrowth: string;
    technicalScore: number;
    contentScore: number;
  };
  sections: any[];
  chartData: any;
  branding: any;
  metadata: any;
}

export const WhiteLabelReports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [formData, setFormData] = useState({
    reportType: 'comprehensive',
    clientName: '',
    clientUrl: '',
    timeframe: '30d',
    companyName: 'TalentXcel SEO',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b'
  });

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive SEO Report', icon: FileText },
    { value: 'technical', label: 'Technical SEO Audit', icon: Settings },
    { value: 'content', label: 'Content Performance Report', icon: BarChart3 },
    { value: 'competitor', label: 'Competitor Analysis', icon: TrendingUp },
    { value: 'local_seo', label: 'Local SEO Report', icon: Globe }
  ];

  const handleGenerateReport = async () => {
    if (!formData.clientName || !formData.clientUrl) {
      toast.error('Please enter client name and URL');
      return;
    }

    setIsGenerating(true);
    
    try {
      const requestData = {
        ...formData,
        brandingConfig: {
          companyName: formData.companyName,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        },
        analysisData: {
          keywords: generateSampleKeywords(),
          rankings: generateSampleRankings(),
          technicalIssues: generateSampleTechnicalIssues(),
          trafficData: generateSampleTrafficData()
        }
      };

      const { data, error } = await supabase.functions.invoke('white-label-reports', {
        body: requestData
      });

      if (error) throw error;

      if (data.success) {
        setReportData(data.report);
        toast.success('White-label report generated successfully!');
      } else {
        throw new Error(data.error || 'Report generation failed');
      }
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast.error(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const reportContent = generateReportContent(reportData);
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.clientName}-seo-report-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSampleKeywords = () => [
    { keyword: 'digital marketing', rank: 5, volume: 12000, difficulty: 75 },
    { keyword: 'seo services', rank: 8, volume: 8500, difficulty: 82 },
    { keyword: 'content strategy', rank: 12, volume: 5200, difficulty: 68 }
  ];

  const generateSampleRankings = () => [
    { date: '2024-01-01', averageRank: 15.2 },
    { date: '2024-01-15', averageRank: 13.8 },
    { date: '2024-02-01', averageRank: 11.5 }
  ];

  const generateSampleTechnicalIssues = () => [
    { type: 'Page Speed', severity: 'medium', count: 3 },
    { type: 'Mobile Issues', severity: 'low', count: 1 },
    { type: 'SSL Issues', severity: 'high', count: 0 }
  ];

  const generateSampleTrafficData = () => [
    { month: 'Jan', organic: 12500, paid: 3200 },
    { month: 'Feb', organic: 15200, paid: 3800 },
    { month: 'Mar', organic: 18900, paid: 4200 }
  ];

  const generateReportContent = (report: ReportData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>SEO Report - ${report.clientName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { background: ${formData.primaryColor}; color: white; padding: 20px; text-align: center; }
        .content { max-width: 800px; margin: 0 auto; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: ${formData.primaryColor}; }
        .metric-label { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SEO Performance Report</h1>
        <h2>${report.clientName}</h2>
        <p>Generated by ${formData.companyName}</p>
    </div>
    <div class="content">
        <div class="section">
            <h3>Executive Summary</h3>
            <div class="metric">
                <div class="metric-value">${report.summary.totalKeywords}</div>
                <div class="metric-label">Total Keywords</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.averageRank}</div>
                <div class="metric-label">Average Rank</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.trafficGrowth}</div>
                <div class="metric-label">Traffic Growth</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.technicalScore}%</div>
                <div class="metric-label">Technical Score</div>
            </div>
        </div>
        ${report.sections.map(section => `
            <div class="section">
                <h3>${section.title}</h3>
                ${section.insights.map((insight: string) => `<p>• ${insight}</p>`).join('')}
                ${section.recommendations.map((rec: string) => `<p><strong>→</strong> ${rec}</p>`).join('')}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            White-Label Reports
          </CardTitle>
          <CardDescription>
            Generate professional, branded SEO reports for clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Acme Corporation"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Website URL</Label>
              <Input
                value={formData.clientUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, clientUrl: e.target.value }))}
                placeholder="https://client-website.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select
                value={formData.timeframe}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Branding Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold">Branding Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Your Agency Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <Input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-pulse" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate White-Label Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <div className="space-y-6">
          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Preview
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadReport} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold">{reportData.clientName} - SEO Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Report ID: {reportData.reportId} | Generated: {new Date(reportData.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{reportData.reportType}</Badge>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalKeywords}</div>
                    <div className="text-xs text-muted-foreground">Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{reportData.summary.averageRank}</div>
                    <div className="text-xs text-muted-foreground">Avg Rank</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{reportData.summary.trafficGrowth}</div>
                    <div className="text-xs text-muted-foreground">Traffic Growth</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{reportData.summary.technicalScore}%</div>
                    <div className="text-xs text-muted-foreground">Technical Score</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{reportData.summary.contentScore}%</div>
                    <div className="text-xs text-muted-foreground">Content Score</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sections">Report Sections</TabsTrigger>
              <TabsTrigger value="charts">Charts & Data</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Report Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.sections.map((section, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{section.title}</h4>
                        <div className="space-y-2">
                          {section.insights && section.insights.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-blue-600">Key Insights:</h5>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {section.insights.map((insight: string, i: number) => (
                                  <li key={i}>{insight}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {section.recommendations && section.recommendations.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-green-600">Recommendations:</h5>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {section.recommendations.map((rec: string, i: number) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Data Visualizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Ranking Trends</h4>
                      <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Chart: Ranking improvements over time</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Traffic Growth</h4>
                      <div className="h-32 bg-gradient-to-r from-green-100 to-green-200 rounded flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Chart: Organic traffic growth</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Keyword Performance</h4>
                      <div className="h-32 bg-gradient-to-r from-purple-100 to-purple-200 rounded flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Chart: Top keyword rankings</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Technical Scores</h4>
                      <div className="h-32 bg-gradient-to-r from-orange-100 to-orange-200 rounded flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Chart: Technical SEO metrics</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Report Branding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        Logo
                      </div>
                      <div>
                        <h4 className="font-semibold">{reportData.branding.companyName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Primary: {formData.primaryColor} | Secondary: {formData.secondaryColor}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">Report Metadata</h5>
                        <div className="text-sm space-y-1">
                          <div>Version: {reportData.metadata.reportVersion}</div>
                          <div>Confidentiality: {reportData.metadata.confidentialityLevel}</div>
                          <div>Valid Until: {new Date(reportData.metadata.validUntil).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-2">Generated By</h5>
                        <div className="text-sm">
                          <div>{reportData.metadata.generatedBy}</div>
                          <div className="text-muted-foreground">Professional SEO Platform</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};