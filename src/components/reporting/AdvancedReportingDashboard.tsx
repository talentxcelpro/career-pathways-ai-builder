import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Target, 
  Clock, DollarSign, Calendar, Download, Filter, RefreshCw
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface ReportMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percentage' | 'currency' | 'time';
}

interface ChartData {
  date: string;
  value: number;
  category?: string;
}

interface Report {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'activity' | 'career' | 'network' | 'financial';
  metrics: ReportMetric[];
  chartData: ChartData[];
  lastGenerated: Date;
  frequency: 'daily' | 'weekly' | 'monthly';
  subscribers: number;
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'progress';
  data: any;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
}

const AdvancedReportingDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReports();
    loadWidgets();
  }, [selectedPeriod]);

  const loadReports = () => {
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Career Progress Report',
        description: 'Comprehensive analysis of career development activities',
        category: 'career',
        metrics: [
          { name: 'Applications Sent', value: 47, change: 12, trend: 'up', format: 'number' },
          { name: 'Response Rate', value: 23, change: -5, trend: 'down', format: 'percentage' },
          { name: 'Interview Success', value: 67, change: 8, trend: 'up', format: 'percentage' },
          { name: 'Avg Time to Response', value: 5.2, change: -1.1, trend: 'up', format: 'time' }
        ],
        chartData: [],
        lastGenerated: new Date(Date.now() - 3600000),
        frequency: 'weekly',
        subscribers: 1
      },
      {
        id: '2',
        name: 'Network Growth Analysis',
        description: 'Track your professional network expansion',
        category: 'network',
        metrics: [
          { name: 'New Connections', value: 28, change: 15, trend: 'up', format: 'number' },
          { name: 'Engagement Rate', value: 34, change: 7, trend: 'up', format: 'percentage' },
          { name: 'Quality Score', value: 85, change: 3, trend: 'up', format: 'number' },
          { name: 'Network Value', value: 12500, change: 2100, trend: 'up', format: 'currency' }
        ],
        chartData: [],
        lastGenerated: new Date(Date.now() - 7200000),
        frequency: 'monthly',
        subscribers: 1
      },
      {
        id: '3',
        name: 'Performance Analytics',
        description: 'Detailed performance metrics and trends',
        category: 'performance',
        metrics: [
          { name: 'Profile Views', value: 156, change: 34, trend: 'up', format: 'number' },
          { name: 'Search Appearances', value: 89, change: -12, trend: 'down', format: 'number' },
          { name: 'Click-through Rate', value: 12.4, change: 2.1, trend: 'up', format: 'percentage' },
          { name: 'Skill Endorsements', value: 23, change: 8, trend: 'up', format: 'number' }
        ],
        chartData: [],
        lastGenerated: new Date(Date.now() - 10800000),
        frequency: 'daily',
        subscribers: 1
      }
    ];
    setReports(mockReports);
  };

  const loadWidgets = () => {
    const mockWidgets: DashboardWidget[] = [
      {
        id: '1',
        title: 'Application Success Rate',
        type: 'metric',
        data: { value: 67, trend: 'up', change: 8 },
        size: 'small',
        position: { x: 0, y: 0 }
      },
      {
        id: '2',
        title: 'Monthly Activity Trend',
        type: 'chart',
        data: { chartType: 'line', values: [45, 52, 48, 61, 67, 74, 69] },
        size: 'large',
        position: { x: 1, y: 0 }
      },
      {
        id: '3',
        title: 'Network Growth',
        type: 'progress',
        data: { current: 156, target: 200, percentage: 78 },
        size: 'medium',
        position: { x: 0, y: 1 }
      },
      {
        id: '4',
        title: 'Recent Applications',
        type: 'table',
        data: {
          headers: ['Company', 'Position', 'Status', 'Date'],
          rows: [
            ['TechCorp', 'Senior Developer', 'Interview', '2024-01-15'],
            ['DataInc', 'Data Scientist', 'Applied', '2024-01-14'],
            ['StartupXYZ', 'Product Manager', 'Rejected', '2024-01-12']
          ]
        },
        size: 'large',
        position: { x: 1, y: 1 }
      }
    ];
    setWidgets(mockWidgets);
  };

  const generateReport = async (reportId: string) => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'time':
        return `${value}d`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career':
        return <Target className="h-4 w-4" />;
      case 'network':
        return <Users className="h-4 w-4" />;
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric':
        return (
          <div className="text-center">
            <p className="text-2xl font-bold">{widget.data.value}%</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getTrendIcon(widget.data.trend)}
              <span className={`text-sm ${getTrendColor(widget.data.trend)}`}>
                {widget.data.change > 0 ? '+' : ''}{widget.data.change}%
              </span>
            </div>
          </div>
        );
      case 'progress':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{widget.data.current}/{widget.data.target}</span>
            </div>
            <Progress value={widget.data.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {widget.data.percentage}% complete
            </p>
          </div>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {widget.data.headers.map((header: string, index: number) => (
                    <th key={index} className="text-left p-2">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {widget.data.rows.map((row: string[], index: number) => (
                  <tr key={index} className="border-b">
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} className="p-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'chart':
        return (
          <div className="h-32 flex items-end justify-between gap-1">
            {widget.data.values.map((value: number, index: number) => (
              <div
                key={index}
                className="bg-primary rounded-t flex-1"
                style={{ height: `${(value / Math.max(...widget.data.values)) * 100}%` }}
              ></div>
            ))}
          </div>
        );
      default:
        return <div>Widget type not supported</div>;
    }
  };

  return (
    <TieredAccessGuard feature="advanced_reporting">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Advanced Reporting Dashboard
            </h2>
            <p className="text-muted-foreground">Comprehensive analytics and insights for your career journey</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={8} label="Report Generations" />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Deep Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applications</p>
                      <p className="font-bold text-xl">47</p>
                      <p className="text-xs text-green-600">+12 this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="font-bold text-xl">67%</p>
                      <p className="text-xs text-green-600">+8% improvement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Network Size</p>
                      <p className="font-bold text-xl">156</p>
                      <p className="text-xs text-green-600">+28 connections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                      <p className="font-bold text-xl">5.2d</p>
                      <p className="text-xs text-green-600">-1.1d faster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgets.map((widget) => (
                <Card key={widget.id} className={`${
                  widget.size === 'large' ? 'lg:col-span-2' : 
                  widget.size === 'medium' ? 'md:col-span-1' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderWidget(widget)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports
                .filter(report => selectedCategory === 'all' || report.category === selectedCategory)
                .map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(report.category)}
                        <div>
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <Badge variant="outline">{report.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{report.frequency}</Badge>
                        <Button size="sm" onClick={() => generateReport(report.id)} disabled={isGenerating}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {report.metrics.map((metric, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-xs text-muted-foreground">{metric.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatValue(metric.value, metric.format)}</span>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(metric.trend)}
                              <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                                {metric.change > 0 ? '+' : ''}{formatValue(metric.change, metric.format)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>Last generated: {report.lastGenerated.toLocaleString()}</span>
                      <span>{report.subscribers} subscriber{report.subscribers !== 1 ? 's' : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deep Analytics Engine</CardTitle>
                <p className="text-muted-foreground">
                  Advanced AI-powered insights and predictive analytics for your career data
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Trend Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Application Success</span>
                        <span className="text-sm text-green-600">↗ 15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Network Growth</span>
                        <span className="text-sm text-green-600">↗ 23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className="text-sm text-red-600">↗ 8%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Predictive Insights</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">High Success Probability</p>
                        <p className="text-xs text-blue-700">Tech industry applications show 85% success rate</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Optimal Timing</p>
                        <p className="text-xs text-green-700">Tuesday applications have 2x higher response rates</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Recommendations</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">Skill Focus</p>
                        <p className="text-xs text-purple-700">Machine Learning skills show highest demand</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm font-medium text-orange-900">Network Strategy</p>
                        <p className="text-xs text-orange-700">Connect with 5 more senior professionals this month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TieredAccessGuard>
  );
};

export default AdvancedReportingDashboard;