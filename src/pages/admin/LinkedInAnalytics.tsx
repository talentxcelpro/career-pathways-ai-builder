import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart3, 
  Users,
  Database,
  CheckCircle,
  AlertCircle,
  Linkedin,
  Target,
  Clock,
  Filter,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useLinkedInAnalytics } from '@/hooks/useLinkedInAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const LinkedInAnalytics = () => {
  const { data: analyticsData, isLoading } = useLinkedInAnalytics();

  const importStats = analyticsData ? {
    totalImports: analyticsData.totalImports,
    successfulImports: analyticsData.successfulImports,
    failedImports: analyticsData.failedImports,
    successRate: analyticsData.successRate,
    avgImportTime: analyticsData.avgImportTime,
    weeklyGrowth: analyticsData.weeklyGrowth
  } : null;

  const dataQualityMetrics = analyticsData?.dataQualityMetrics;
  const importTrends = analyticsData?.importTrends || [];

  const sourceTracking = [
    { source: 'Bulk LinkedIn Import', count: Math.floor((importStats?.totalImports || 0) * 0.45), percentage: 45 },
    { source: 'Individual Profile Import', count: Math.floor((importStats?.totalImports || 0) * 0.28), percentage: 28 },
    { source: 'CSV Upload', count: Math.floor((importStats?.totalImports || 0) * 0.15), percentage: 15 },
    { source: 'API Integration', count: Math.floor((importStats?.totalImports || 0) * 0.08), percentage: 8 },
    { source: 'Manual Entry', count: Math.floor((importStats?.totalImports || 0) * 0.04), percentage: 4 }
  ];

  const integrationPerformance = {
    apiResponseTime: '1.2s',
    dataProcessingTime: '0.8s',
    totalProcessingTime: '2.1s',
    throughput: '485 profiles/hour',
    errorRate: 4.5,
    retrySuccessRate: 78.2
  };

  const profileCompletion = [
    { field: 'Basic Info', completion: Math.round(dataQualityMetrics?.profileCompleteness || 98), critical: true },
    { field: 'Contact Details', completion: Math.round(dataQualityMetrics?.emailValidation || 94), critical: true },
    { field: 'Professional Summary', completion: 76, critical: false },
    { field: 'Work Experience', completion: Math.round(dataQualityMetrics?.experienceCompleteness || 89), critical: true },
    { field: 'Education', completion: 82, critical: false },
    { field: 'Skills', completion: Math.round(dataQualityMetrics?.skillsCompleteness || 71), critical: false },
    { field: 'Certifications', completion: 45, critical: false },
    { field: 'Languages', completion: 38, critical: false }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LinkedIn Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into LinkedIn import performance, data quality, and integration metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importStats?.totalImports?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              LinkedIn profiles imported
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{importStats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Successful imports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dataQualityMetrics?.profileCompleteness || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Average profile completeness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{importStats?.weeklyGrowth || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Import volume increase
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Import Overview</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="sources">Source Tracking</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Import Trends (Last 7 Days)</CardTitle>
                <CardDescription>
                  Daily LinkedIn import volume and success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={importTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="imports" stroke="#8884d8" strokeWidth={2} name="Total Imports" />
                    <Line type="monotone" dataKey="success" stroke="#82ca9d" strokeWidth={2} name="Successful" />
                    <Line type="monotone" dataKey="failed" stroke="#ff7300" strokeWidth={2} name="Failed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Source Distribution</CardTitle>
                <CardDescription>
                  Where LinkedIn data is being imported from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceTracking}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sourceTracking?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Import Summary</CardTitle>
              <CardDescription>
                Key metrics from recent LinkedIn import operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {importStats?.successfulImports?.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Successful Imports</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {importStats?.failedImports?.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed Imports</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {importStats?.avgImportTime || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Import Time</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {integrationPerformance?.throughput || '0'}
                  </div>
                  <p className="text-sm text-muted-foreground">Processing Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Validation Metrics</CardTitle>
                <CardDescription>
                  Quality scores for different types of LinkedIn data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Email Validation</span>
                      <span className="font-bold">{dataQualityMetrics?.emailValidation || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${dataQualityMetrics?.emailValidation || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Phone Validation</span>
                      <span className="font-bold">{dataQualityMetrics?.phoneValidation || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-yellow-500 rounded-full" 
                        style={{ width: `${dataQualityMetrics?.phoneValidation || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>LinkedIn URL Validation</span>
                      <span className="font-bold">{dataQualityMetrics?.linkedinUrlValidation || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${dataQualityMetrics?.linkedinUrlValidation || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Skills Completeness</span>
                      <span className="font-bold">{dataQualityMetrics?.skillsCompleteness || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${dataQualityMetrics?.skillsCompleteness || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Experience Completeness</span>
                      <span className="font-bold">{dataQualityMetrics?.experienceCompleteness || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-purple-500 rounded-full" 
                        style={{ width: `${dataQualityMetrics?.experienceCompleteness || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Completion Analysis</CardTitle>
                <CardDescription>
                  Completeness rates for different profile sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileCompletion?.map((field, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{field.field}</span>
                        {field.critical && (
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{field.completion}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              field.completion >= 90 ? 'bg-green-500' :
                              field.completion >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${field.completion}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Source Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of LinkedIn data sources and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourceTracking?.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium">{source.source}</h3>
                        <p className="text-sm text-muted-foreground">
                          {source.count.toLocaleString()} imports
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{source.percentage}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {integrationPerformance?.apiResponseTime || '0s'}
                </div>
                <p className="text-sm text-muted-foreground">Average LinkedIn API response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {integrationPerformance?.dataProcessingTime || '0s'}
                </div>
                <p className="text-sm text-muted-foreground">Data processing per profile</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {integrationPerformance?.totalProcessingTime || '0s'}
                </div>
                <p className="text-sm text-muted-foreground">End-to-end processing time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {integrationPerformance?.throughput || '0'}
                </div>
                <p className="text-sm text-muted-foreground">Processing capacity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {integrationPerformance?.errorRate || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Failed import attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Retry Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {integrationPerformance?.retrySuccessRate || 0}%
                </div>
                <p className="text-sm text-muted-foreground">Successful retries</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve LinkedIn import performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Optimize API Rate Limits</p>
                    <p className="text-sm text-blue-700">
                      Current throughput can be improved by adjusting request timing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Improve Data Validation</p>
                    <p className="text-sm text-yellow-700">
                      Phone number validation needs improvement to reduce data quality issues
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Excellent Success Rate</p>
                    <p className="text-sm text-green-700">
                      Your import success rate of 95.5% is well above industry average
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinkedInAnalytics;