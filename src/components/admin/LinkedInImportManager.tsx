import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { 
  Upload, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  AlertTriangle,
  Coins
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImportStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  tokensAwarded: number;
}

interface ImportJob {
  id: string;
  batch_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  failed_records: number;
  created_at: string;
  error_log?: string;
}

export const LinkedInImportManager = () => {
  const [importing, setImporting] = useState(false);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [currentStats, setCurrentStats] = useState<ImportStats>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    tokensAwarded: 0
  });
  const [tokenRewardPerUser, setTokenRewardPerUser] = useState(10);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (!csvFile) return;

    if (!csvFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      setImporting(true);
      
      // Read CSV content
      const csvContent = await csvFile.text();
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file appears to be empty or invalid');
        return;
      }

      // Create import job in existing linkedin_import_batches table
      const { data: importJob, error: jobError } = await supabase
        .from('linkedin_import_batches')
        .insert({
          batch_name: csvFile.name,
          status: 'processing',
          total_records: lines.length - 1, // Subtract header row
          processed_records: 0,
          failed_records: 0
        })
        .select()
        .single();

      if (jobError) {
        console.error('Error creating import job:', jobError);
        toast.error('Failed to start import process');
        return;
      }

      // Process CSV data
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= headers.length) {
          const record: any = {};
          headers.forEach((header, index) => {
            record[header] = values[index] || '';
          });
          
          // Map to expected fields
          const firstName = record['First Name'] || record['firstName'] || '';
          const lastName = record['Last Name'] || record['lastName'] || '';
          const email = record['Email'] || record['email'] || '';
          const linkedInUrl = record['LinkedIn URL'] || record['linkedInUrl'] || '';
          const jobTitle = record['Job Title'] || record['jobTitle'] || '';
          const company = record['Company'] || record['company'] || '';
          const location = record['Location'] || record['location'] || '';
          const skills = record['Skills'] || record['skills'] || '';

          if (email && firstName && lastName) {
            // Check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .single();

            if (!existingProfile) {
              // Create profile
              const fullName = `${firstName} ${lastName}`.trim();
              const skillsArray = skills ? skills.split(';').map((s: string) => s.trim()).filter((s: string) => s) : [];
              
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  full_name: fullName,
                  email: email,
                  title: jobTitle,
                  location: location,
                  linkedin_url: linkedInUrl,
                  about: `Imported from LinkedIn. Job Title: ${jobTitle} at ${company}`
                });

              if (!profileError) {
                successCount++;
              } else {
                failCount++;
              }
            } else {
              failCount++; // Already exists
            }
          } else {
            failCount++;
          }
        }
      }

      // Update job status
      await supabase
        .from('linkedin_import_batches')
        .update({
          status: 'completed',
          processed_records: successCount + failCount,
          failed_records: failCount
        })
        .eq('id', importJob.id);

      // Award tokens for successful imports
      const tokensAwarded = successCount * tokenRewardPerUser;
      if (tokensAwarded > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Add tokens to user's balance
          const { data: existingBalance } = await supabase
            .from('token_balances')
            .select('balance')
            .eq('user_id', user.id)
            .eq('token_type', 'TXC')
            .single();

          const newBalance = (existingBalance?.balance || 0) + tokensAwarded;

          await supabase
            .from('token_balances')
            .upsert({
              user_id: user.id,
              balance: newBalance,
              token_type: 'TXC'
            });

          // Create transaction record
          await supabase
            .from('token_transactions')
            .insert({
              to_user_id: user.id,
              transaction_type: 'reward', // Use 'reward' instead of 'earned'
              amount: tokensAwarded,
              description: `LinkedIn import reward: ${successCount} users imported`,
              token_type: 'TXC',
              status: 'completed'
            });
        }
      }

      toast.success(`Import completed! ${successCount} users imported, ${tokensAwarded} TXC tokens earned`);
      fetchImportJobs();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to process import');
    } finally {
      setImporting(false);
    }
  }, [tokenRewardPerUser]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    disabled: importing
  });

  const fetchImportJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_import_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setImportJobs(data || []);

      // Calculate current stats
      const stats = (data || []).reduce((acc, job) => ({
        total: acc.total + job.total_records,
        processed: acc.processed + job.processed_records,
        successful: acc.successful + (job.processed_records - job.failed_records),
        failed: acc.failed + job.failed_records,
        tokensAwarded: acc.tokensAwarded + ((job.processed_records - job.failed_records) * tokenRewardPerUser)
      }), { total: 0, processed: 0, successful: 0, failed: 0, tokensAwarded: 0 });

      setCurrentStats(stats);
    } catch (error) {
      console.error('Error fetching import jobs:', error);
    }
  };

  React.useEffect(() => {
    fetchImportJobs();
  }, []);

  const downloadTemplate = () => {
    const csvContent = `First Name,Last Name,Email,LinkedIn URL,Job Title,Company,Location,Skills
John,Doe,john.doe@example.com,https://linkedin.com/in/johndoe,Software Engineer,TechCorp,San Francisco,"JavaScript;React;Node.js"
Jane,Smith,jane.smith@example.com,https://linkedin.com/in/janesmith,Product Manager,InnovateCo,New York,"Product Strategy;Agile;Analytics"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentStats.successful.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentStats.failed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Earned</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{currentStats.tokensAwarded.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Import Configuration</CardTitle>
              <CardDescription>
                Configure token rewards and import settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tokenReward">Token Reward per User</Label>
                  <Input
                    id="tokenReward"
                    type="number"
                    min="1"
                    max="100"
                    value={tokenRewardPerUser}
                    onChange={(e) => setTokenRewardPerUser(Number(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    TXC tokens awarded per successfully imported user
                  </p>
                </div>
                <div className="flex items-end">
                  <Button onClick={downloadTemplate} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload LinkedIn Data</CardTitle>
              <CardDescription>
                Upload a CSV file with LinkedIn user data to import into the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                } ${importing ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Or click to browse files. Only CSV files are accepted.
                  </p>
                  {importing && (
                    <p className="text-sm text-blue-600 font-medium">
                      Processing import...
                    </p>
                  )}
                </div>
              </div>

              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Ensure your CSV includes columns for First Name, Last Name, 
                  Email, LinkedIn URL, Job Title, Company, and Location. Invalid data will be skipped.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View all previous LinkedIn data imports and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importJobs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No import jobs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {importJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={getStatusColor(job.status)}>
                            {getStatusIcon(job.status)}
                          </span>
                          <span className="font-medium">{job.batch_name}</span>
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'failed' ? 'destructive' :
                            job.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {job.status === 'processing' && (
                        <Progress 
                          value={job.total_records > 0 ? (job.processed_records / job.total_records) * 100 : 0} 
                          className="mb-2" 
                        />
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Total</p>
                          <p className="text-muted-foreground">{job.total_records}</p>
                        </div>
                        <div>
                          <p className="font-medium">Processed</p>
                          <p className="text-muted-foreground">{job.processed_records}</p>
                        </div>
                        <div>
                          <p className="font-medium">Successful</p>
                          <p className="text-green-600">{job.processed_records - job.failed_records}</p>
                        </div>
                        <div>
                          <p className="font-medium">Failed</p>
                          <p className="text-red-600">{job.failed_records}</p>
                        </div>
                      </div>
                      
                      {job.error_log && (
                        <Alert className="mt-2" variant="destructive">
                          <AlertDescription>{job.error_log}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};