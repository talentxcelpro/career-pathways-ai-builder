import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Users,
  Database,
  Linkedin,
  Clock,
  Target,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { useLinkedInBulkUpload } from '@/hooks/useLinkedInBulkUpload';

const LinkedInBulkUpload = () => {
  const [uploadOptions, setUploadOptions] = useState({
    validateEmails: true,
    checkDuplicates: true,
    autoEnrich: false,
    tokenRewardPerUser: 10
  });

  const {
    uploadStats,
    recentUploads,
    dataQuality,
    uploadProgress,
    isUploading,
    uploadFile,
    isUploadLoading,
    downloadTemplate,
    isStatsLoading,
    isHistoryLoading
  } = useLinkedInBulkUpload();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'failed': return AlertCircle;
      default: return FileText;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile({ file, options: uploadOptions });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LinkedIn Bulk Upload</h1>
        <p className="text-muted-foreground">
          Mass import LinkedIn profiles and professional data with validation and quality checks
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats?.totalUploads?.toLocaleString() || '0'}</div>
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
            <div className="text-2xl font-bold">
              {uploadStats ? ((uploadStats.successfulImports / uploadStats.totalUploads) * 100).toFixed(1) : '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful imports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Uploads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats?.todayUploads || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +{uploadStats?.weeklyGrowth || 0}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats?.avgProcessingTime || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Per batch processing time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">New Upload</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload LinkedIn Data</CardTitle>
                <CardDescription>
                  Import CSV, Excel, or JSON files with LinkedIn profile data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports CSV, XLSX, and JSON formats (max 50MB)
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      Select LinkedIn File
                    </Button>
                  </label>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Upload Options</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={uploadOptions.validateEmails}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, validateEmails: e.target.checked }))}
                      />
                      <span className="text-sm">Validate email addresses</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={uploadOptions.checkDuplicates}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, checkDuplicates: e.target.checked }))}
                      />
                      <span className="text-sm">Check for duplicates</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={uploadOptions.autoEnrich}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, autoEnrich: e.target.checked }))}
                      />
                      <span className="text-sm">Auto-enrich profiles</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Tokens per user:</span>
                      <Input
                        type="number"
                        value={uploadOptions.tokenRewardPerUser}
                        onChange={(e) => setUploadOptions(prev => ({ ...prev, tokenRewardPerUser: parseInt(e.target.value) || 10 }))}
                        className="w-20"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Templates</CardTitle>
                <CardDescription>
                  Download standardized templates for different data types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">LinkedIn Contacts Template</p>
                    <p className="text-sm text-muted-foreground">Standard contact fields</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadTemplate('contacts')}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Job Candidates Template</p>
                    <p className="text-sm text-muted-foreground">Recruitment focused fields</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadTemplate('candidates')}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">Sales Leads Template</p>
                    <p className="text-sm text-muted-foreground">Sales pipeline fields</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadTemplate('leads')}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Upload History</CardTitle>
              <CardDescription>
                Track upload status, progress, and error reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentUploads?.map((upload) => {
                  const StatusIcon = getStatusIcon(upload.status);
                  return (
                    <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 text-${getStatusColor(upload.status)}-500`} />
                        <div>
                          <p className="font-medium">{upload.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded by {upload.uploadedBy} • {new Date(upload.timestamp).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {upload.processed}/{upload.total} processed
                            </span>
                            {upload.errors > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {upload.errors} errors
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={upload.status === 'completed' ? 'default' : 
                                  upload.status === 'processing' ? 'secondary' : 'destructive'}
                        >
                          {upload.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                  {(!recentUploads || recentUploads.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No upload history found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Overview</CardTitle>
                <CardDescription>
                  Overall data completeness and quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Completeness Score</span>
                    <span className="font-bold">{dataQuality?.completenessScore || 0}%</span>
                  </div>
                  <Progress value={dataQuality?.completenessScore || 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Duplicate Rate</span>
                    <span className="font-bold text-yellow-600">{dataQuality?.duplicateRate || 0}%</span>
                  </div>
                  <Progress value={dataQuality?.duplicateRate || 0} className="h-2" />
                </div>
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Quality Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Implement email validation during upload</li>
                    <li>• Add deduplication rules for similar profiles</li>
                    <li>• Require minimum profile completion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation Issues</CardTitle>
                <CardDescription>
                  Common data issues and their frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataQuality?.validationIssues?.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{issue.type}</p>
                        <p className="text-sm text-muted-foreground">{issue.count} instances</p>
                      </div>
                      <Badge 
                        variant={issue.severity === 'high' ? 'destructive' : 
                                issue.severity === 'medium' ? 'default' : 'secondary'}
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Configuration</CardTitle>
              <CardDescription>
                Map LinkedIn fields to your database schema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">LinkedIn Fields</h3>
                  <div className="space-y-2">
                    {[
                      'firstName', 'lastName', 'emailAddress', 'headline',
                      'industry', 'location', 'summary', 'currentPosition',
                      'skills', 'connections', 'profileUrl'
                    ].map((field) => (
                      <div key={field} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-mono">{field}</span>
                        <Badge variant="outline">LinkedIn</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Database Fields</h3>
                  <div className="space-y-2">
                    {[
                      'full_name', 'email', 'title', 'about',
                      'industry', 'location', 'bio', 'current_role',
                      'skills', 'network_size', 'linkedin_url'
                    ].map((field) => (
                      <div key={field} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-mono">{field}</span>
                        <Badge>Database</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button>
                  Save Mapping Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LinkedInBulkUpload;