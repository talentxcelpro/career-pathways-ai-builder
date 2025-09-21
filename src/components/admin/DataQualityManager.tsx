import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  Database,
  Sparkles,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QualityReport {
  total_profiles: number;
  high_quality: number;
  medium_quality: number;
  low_quality: number;
  common_issues: Record<string, number>;
  recommendations: Array<{
    issue: string;
    affected_profiles: number;
    priority: string;
  }>;
}

export const DataQualityManager = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState('validate');

  const runQualityScan = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-data-validator', {
        body: {
          action: 'quality-scan',
          payload: {
            scan_type: 'full',
            limit: 1000
          }
        }
      });

      if (error) throw error;

      setQualityReport(data.quality_report);
      toast({
        title: "Quality Scan Complete",
        description: `Analyzed ${data.quality_report.total_profiles} profiles`,
      });
    } catch (error) {
      console.error('Error running quality scan:', error);
      toast({
        title: "Error",
        description: "Failed to run quality scan",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const fixDataIssues = async () => {
    setIsFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-data-validator', {
        body: {
          action: 'fix-data-issues',
          payload: {
            issue_types: ['format', 'completeness'],
            auto_fix: true
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Issues Fixed",
        description: data.message,
      });

      // Refresh quality report
      await runQualityScan();
    } catch (error) {
      console.error('Error fixing data issues:', error);
      toast({
        title: "Error",
        description: "Failed to fix data issues",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  const validateProfiles = async () => {
    try {
      // Get recent profiles for validation
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .limit(10);

      if (!profiles) return;

      const { data, error } = await supabase.functions.invoke('linkedin-data-validator', {
        body: {
          action: 'validate-batch',
          payload: {
            profile_ids: profiles.map(p => p.id),
            fix_issues: false
          }
        }
      });

      if (error) throw error;

      setValidationResults(data.results);
      toast({
        title: "Validation Complete",
        description: `Validated ${profiles.length} profiles`,
      });
    } catch (error) {
      console.error('Error validating profiles:', error);
    }
  };

  const getQualityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (status: string) => {
    switch (status) {
      case 'high': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    runQualityScan();
  }, []);

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityReport?.total_profiles || 0}</div>
            <p className="text-xs text-muted-foreground">Analyzed profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Quality</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{qualityReport?.high_quality || 0}</div>
            <p className="text-xs text-muted-foreground">
              {qualityReport ? Math.round((qualityReport.high_quality / qualityReport.total_profiles) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Quality</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{qualityReport?.medium_quality || 0}</div>
            <p className="text-xs text-muted-foreground">
              {qualityReport ? Math.round((qualityReport.medium_quality / qualityReport.total_profiles) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Quality</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{qualityReport?.low_quality || 0}</div>
            <p className="text-xs text-muted-foreground">
              {qualityReport ? Math.round((qualityReport.low_quality / qualityReport.total_profiles) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Management</CardTitle>
          <CardDescription>Analyze and improve the quality of your LinkedIn data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={runQualityScan} disabled={isScanning}>
              {isScanning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {isScanning ? 'Scanning...' : 'Run Quality Scan'}
            </Button>

            <Button onClick={fixDataIssues} disabled={isFixing} variant="outline">
              {isFixing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isFixing ? 'Fixing...' : 'Auto-Fix Issues'}
            </Button>

            <Button onClick={validateProfiles} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate Profiles
            </Button>
          </div>

          {qualityReport && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-3">Quality Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>High Quality</span>
                    <span className="text-green-600">{qualityReport.high_quality}</span>
                  </div>
                  <Progress 
                    value={(qualityReport.high_quality / qualityReport.total_profiles) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between">
                    <span>Medium Quality</span>
                    <span className="text-yellow-600">{qualityReport.medium_quality}</span>
                  </div>
                  <Progress 
                    value={(qualityReport.medium_quality / qualityReport.total_profiles) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between">
                    <span>Low Quality</span>
                    <span className="text-red-600">{qualityReport.low_quality}</span>
                  </div>
                  <Progress 
                    value={(qualityReport.low_quality / qualityReport.total_profiles) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Top Recommendations</h3>
                <div className="space-y-2">
                  {qualityReport.recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="text-sm font-medium">{rec.issue}</span>
                        <p className="text-xs text-muted-foreground">
                          {rec.affected_profiles} profiles affected
                        </p>
                      </div>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'outline'}>
                        {rec.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Common Issues</TabsTrigger>
          <TabsTrigger value="validation">Validation Results</TabsTrigger>
          <TabsTrigger value="enrichment">Data Enrichment</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicate Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Data Issues</CardTitle>
              <CardDescription>Most frequent problems found in profile data</CardDescription>
            </CardHeader>
            <CardContent>
              {qualityReport && Object.keys(qualityReport.common_issues).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(qualityReport.common_issues)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([issue, count]) => (
                      <div key={issue} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">
                            {issue.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            Affects {count} profiles
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((count / qualityReport.total_profiles) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No quality issues found or scan not completed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Validation Results</CardTitle>
              <CardDescription>Recent validation results for profile data</CardDescription>
            </CardHeader>
            <CardContent>
              {validationResults.length > 0 ? (
                <div className="space-y-3">
                  {validationResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getQualityIcon(result.validation?.status)}
                        <div>
                          <span className="font-medium">Profile {result.profile_id.slice(0, 8)}</span>
                          <p className="text-sm text-muted-foreground">
                            Score: {result.validation?.score || 0}/100
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          result.validation?.status === 'high' ? 'secondary' :
                          result.validation?.status === 'medium' ? 'outline' : 'destructive'
                        }>
                          {result.validation?.status || 'unknown'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.validation?.issues?.length || 0} issues
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No validation results available</p>
                  <Button onClick={validateProfiles} className="mt-4">
                    Run Validation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrichment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Enrichment</CardTitle>
              <CardDescription>Enhance profile data with additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">Enrich profiles with missing information</p>
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Enrichment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Detection</CardTitle>
              <CardDescription>Find and manage duplicate profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">Detect and resolve duplicate profiles</p>
                  <Button>
                    <Shield className="h-4 w-4 mr-2" />
                    Detect Duplicates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};