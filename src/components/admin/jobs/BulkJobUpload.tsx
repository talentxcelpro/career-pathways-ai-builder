import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Users,
  Building
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadResult {
  success: boolean;
  batchId: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  errors?: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
}

export const BulkJobUpload = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [batchName, setBatchName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      // Preview first few rows
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(0, 6); // Show first 5 rows + header
        const preview = lines.map(line => {
          // Simple CSV parsing for preview
          return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        });
        setCsvPreview(preview);
      };
      reader.readAsText(file);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!csvFile || !batchName.trim()) {
      toast.error('Please select a CSV file and enter a batch name');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvData = e.target?.result as string;
          
          // Get the current session first
          const { data: session } = await supabase.auth.getSession();
          console.log('Session check:', { hasSession: !!session.session, hasToken: !!session.session?.access_token });
          
          if (!session.session?.access_token) {
            toast.error('Authentication required. Please sign in again.');
            setIsUploading(false);
            return;
          }
          
          console.log('Calling bulk-job-upload function...');
          console.log('Function name: bulk-job-upload');
          console.log('Request body:', {
            csvData: csvData.substring(0, 100) + '...',
            batchName: batchName.trim()
          });
          
          // Test with minimal payload first
          console.log('=== DEBUGGING EDGE FUNCTION CALL ===');
          console.log('1. About to call bulk-job-upload function');
          console.log('2. CSV Data length:', csvData.length);
          console.log('3. Batch name:', batchName.trim());
          
          // First, test with a tiny payload to see if the function works at all
          const testPayload = {
            csvData: "title,company_name,location,employment_type,description\nTest Job,Test Company,Test Location,Full-time,Test Description",
            batchName: "TEST_BATCH"
          };
          
          console.log('4. Testing with minimal payload first...');
          
          try {
            const { data: testData, error: testError } = await supabase.functions.invoke('bulk-job-upload', {
              body: testPayload
            });
            
            console.log('5. Test call result:', { testData, testError });
            
            if (testError) {
              console.error('Test call failed:', testError);
              toast.error('Function test failed: ' + testError.message);
              setIsUploading(false);
              return;
            }
            
            console.log('6. Test successful! Now trying with real data...');
            
          } catch (testException) {
            console.error('Test call exception:', testException);
            toast.error('Function test exception: ' + testException.message);
            setIsUploading(false);
            return;
          }

          // Now try with the real data
          const { data, error } = await supabase.functions.invoke('bulk-job-upload', {
            body: {
              csvData,
              batchName: batchName.trim()
            }
          });

          console.log('Function response:', { data, error });
          console.log('Error details:', error);

          if (error) {
            console.error('Function error details:', error);
            console.error('Error context:', error.context);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // More detailed error logging
            if (error.context) {
              console.error('Error context details:', JSON.stringify(error.context, null, 2));
            }
            
            // Try to get more error information
            const errorMessage = error.message || error.details || 'Failed to send a request to the Edge Function';
            toast.error('Upload failed: ' + errorMessage);
            setIsUploading(false);
            return;
          }

          setUploadResult(data);
          
          if (data.success) {
            if (data.failedJobs > 0) {
              toast.warning(`Upload completed with ${data.failedJobs} errors out of ${data.totalJobs} jobs`);
            } else {
              toast.success(`Successfully uploaded ${data.successfulJobs} jobs`);
            }
          } else {
            toast.error('Upload failed');
          }
        } catch (innerError) {
          console.error('Inner upload error:', innerError);
          toast.error('Upload failed: ' + (innerError as Error).message);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        console.error('File reading error');
        toast.error('Failed to read CSV file');
        setIsUploading(false);
      };
      
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Outer upload error:', error);
      toast.error('Upload failed: ' + (error as Error).message);
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'job_id,title,company_name,location,location_type,employment_type,industry,job_function,description,education_requirements,experience_level,salary_min,salary_max,salary_currency,is_remote,skills_required,skills_keywords,job_tags,benefits,external_url,application_email,application_method,job_type_detail,priority,job_posted_at,expires_at',
      'TECH001,Senior Frontend Developer,TechCorp India,Mumbai,On-site,Full-time,Information Technology,Software Development,"Build modern web applications using React and TypeScript",Bachelor\'s in Computer Science,3-5 Years,800000,1200000,INR,false,"React,TypeScript,JavaScript","JavaScript,React.js,TypeScript,Redux,Webpack,UI Design,Frontend Development,ES6,HTML5,CSS3","Top MNC,Urgent Hiring","Health Insurance,Remote Work,Flexible Hours",https://techcorp.com/jobs/123,hr@techcorp.com,Apply on Company Site,Permanent,true,2025-01-07,2025-02-07',
      'MKT002,Marketing Manager,Marketing Pro,Bangalore,Hybrid,Full-time,Marketing,Marketing & Communications,"Lead digital marketing campaigns and team management",MBA in Marketing,5-7 Years,600000,900000,INR,true,"Digital Marketing,SEO,Analytics","Digital Marketing,SEO,SEM,Analytics,Content Marketing,Social Media,Campaign Management","Fast Growth,Startup Culture","Health Insurance,Stock Options,Learning Budget",https://marketingpro.com/careers,careers@marketingpro.com,Email Application,Permanent,false,2025-01-07,2025-02-07',
      'DEV003,Junior Software Engineer,StartupTech,Remote,Remote,Full-time,Information Technology,Software Development,"Develop and maintain web applications using modern frameworks",Bachelor\'s in Engineering,0-2 Years,400000,600000,INR,true,"Python,Django,PostgreSQL","Python,Django,PostgreSQL,REST API,Git,Linux,Web Development,Backend Development","Remote First,Entry Level","Health Insurance,Learning Budget,Flexible Hours",https://startuptech.com/apply,jobs@startuptech.com,Apply on Company Site,Permanent,false,2025-01-07,2025-02-07'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced_job_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Job Upload
          </CardTitle>
          <CardDescription>
            Upload multiple job postings via CSV file. Support for 300+ jobs per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Jobs</TabsTrigger>
              <TabsTrigger value="template">Download Template</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              {/* Batch Name Input */}
              <div className="space-y-2">
                <Label htmlFor="batchName">Batch Name</Label>
                <Input
                  id="batchName"
                  placeholder="e.g., Tech Jobs Q1 2025"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              {/* File Upload */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} disabled={isUploading} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p>Drop the CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      {csvFile ? csvFile.name : 'Drag & drop CSV file here'}
                    </p>
                    <p className="text-muted-foreground">
                      or click to select a file
                    </p>
                  </div>
                )}
              </div>

              {/* CSV Preview */}
              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <Label>CSV Preview (first 5 rows)</Label>
                  <div className="border rounded-lg overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {csvPreview[0]?.map((header, i) => (
                            <th key={i} className="p-2 text-left border-r border-border last:border-r-0">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(1).map((row, i) => (
                          <tr key={i} className="border-t border-border">
                            {row.map((cell, j) => (
                              <td key={j} className="p-2 border-r border-border last:border-r-0">
                                {cell.length > 30 ? cell.substring(0, 30) + '...' : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button 
                onClick={handleUpload}
                disabled={!csvFile || !batchName.trim() || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing Upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Jobs
                  </>
                )}
              </Button>

              {/* Upload Results */}
              {uploadResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold">{uploadResult.totalJobs}</p>
                            <p className="text-sm text-muted-foreground">Total Jobs</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold text-green-600">{uploadResult.successfulJobs}</p>
                            <p className="text-sm text-muted-foreground">Successful</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-2xl font-bold text-red-600">{uploadResult.failedJobs}</p>
                            <p className="text-sm text-muted-foreground">Failed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <Label>Upload Errors</Label>
                      <div className="border rounded-lg max-h-60 overflow-auto">
                        {uploadResult.errors.map((error, i) => (
                          <div key={i} className="p-3 border-b border-border last:border-b-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="destructive">Row {error.row}</Badge>
                            </div>
                            <ul className="text-sm text-red-600 list-disc list-inside">
                              {error.errors.map((err, j) => (
                                <li key={j}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="template" className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Download the CSV template to ensure your data is formatted correctly.
                  Required fields: title, company_name, location, employment_type, description.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Enhanced CSV Columns for SEO & Google Schema:</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Required Fields:</h4>
                    <ul className="space-y-1">
                      <li>• title</li>
                      <li>• company_name</li>
                      <li>• location</li>
                      <li>• employment_type</li>
                      <li>• description</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">SEO Enhanced Fields:</h4>
                    <ul className="space-y-1">
                      <li>• job_id (unique identifier)</li>
                      <li>• location_type (On-site/Remote/Hybrid)</li>
                      <li>• job_function (categorization)</li>
                      <li>• education_requirements</li>
                      <li>• experience_level</li>
                      <li>• skills_keywords (SEO optimized)</li>
                      <li>• job_tags (SEO boost)</li>
                      <li>• benefits (employer branding)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-600 mb-2">Optional Fields:</h4>
                    <ul className="space-y-1">
                      <li>• industry</li>
                      <li>• salary_min, salary_max</li>
                      <li>• salary_currency (default: INR)</li>
                      <li>• is_remote (true/false)</li>
                      <li>• external_url</li>
                      <li>• application_email</li>
                      <li>• application_method</li>
                      <li>• job_type_detail</li>
                      <li>• expires_at (YYYY-MM-DD)</li>
                      <li>• job_posted_at (YYYY-MM-DD)</li>
                      <li>• priority (true/false)</li>
                      <li>• skills_required (comma-separated)</li>
                    </ul>
                  </div>
                </div>

                <Button onClick={downloadTemplate} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};