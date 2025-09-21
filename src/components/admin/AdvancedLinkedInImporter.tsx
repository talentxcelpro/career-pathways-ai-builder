import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Linkedin,
  Database,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LinkedInProfile {
  name: string;
  email: string;
  linkedinUrl: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  connections: number;
}

interface ImportJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  createdAt: Date;
}

export const AdvancedLinkedInImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState('');
  const [urlList, setUrlList] = useState('');
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        processFile(acceptedFiles[0]);
      }
    }
  });

  const processFile = async (file: File) => {
    const text = await file.text();
    setCsvData(text);
    
    // Parse CSV and validate
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    
    // Check for required columns
    const requiredColumns = ['name', 'email', 'linkedin_url'];
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(header => header.toLowerCase().includes(col))
    );
    
    if (missingColumns.length > 0) {
      toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
      return;
    }
    
    toast.success(`File processed: ${lines.length - 1} profiles found`);
  };

  const startBulkImport = async () => {
    if (!csvData && !urlList) {
      toast.error('Please provide CSV data or LinkedIn URLs');
      return;
    }

    setImporting(true);
    
    try {
      const jobId = crypto.randomUUID();
      const profiles = csvData ? parseCSVData(csvData) : parseURLList(urlList);
      
      const newJob: ImportJob = {
        id: jobId,
        name: `Import ${new Date().toLocaleString()}`,
        status: 'processing',
        progress: 0,
        total: profiles.length,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        createdAt: new Date()
      };
      
      setImportJobs(prev => [newJob, ...prev]);
      setActiveJob(newJob);
      
      // Create batch record
      const { data: batch, error: batchError } = await supabase
        .from('linkedin_import_batches')
        .insert({
          batch_name: newJob.name,
          total_records: profiles.length,
          status: 'processing'
        })
        .select()
        .single();
      
      if (batchError) throw batchError;
      
      // Process profiles
      await processProfiles(profiles, newJob, batch.id);
      
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const processProfiles = async (profiles: LinkedInProfile[], job: ImportJob, batchId: string) => {
    const batchSize = 10;
    let processed = 0;
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (profile) => {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', profile.email)
            .single();

          if (existingUser) {
            // Update existing profile with LinkedIn data
            await supabase
              .from('profiles')
              .update({
                linkedin_url: profile.linkedinUrl,
                job_title: profile.title,
                company: profile.company,
                location: profile.location,
                skills: profile.skills.join(', '),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingUser.id);
          } else {
            // Create new profile
            await supabase
              .from('profiles')
              .insert({
                full_name: profile.name,
                email: profile.email,
                linkedin_url: profile.linkedinUrl,
                job_title: profile.title,
                company: profile.company,
                location: profile.location,
                skills: profile.skills.join(', '),
                about: `LinkedIn import: ${profile.experience}`,
                education: profile.education,
                created_at: new Date().toISOString()
              });
          }
          
          successful++;
        } catch (error) {
          failed++;
          errors.push(`${profile.email}: ${error.message}`);
        }
        
        processed++;
        
        // Update job progress
        const updatedJob: ImportJob = {
          ...job,
          processed,
          successful,
          failed,
          errors,
          progress: (processed / job.total) * 100,
          status: (processed >= job.total ? 'completed' : 'processing') as ImportJob['status']
        };
        
        setImportJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
        setActiveJob(updatedJob);
      }));
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update batch record
    await supabase
      .from('linkedin_import_batches')
      .update({
        processed_records: processed,
        failed_records: failed,
        status: 'completed',
        error_log: errors.length > 0 ? errors.join('\n') : null
      })
      .eq('id', batchId);

    toast.success(`Import completed: ${successful} successful, ${failed} failed`);
  };

  const parseCSVData = (csvText: string): LinkedInProfile[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const profile: any = {};
      
      headers.forEach((header, index) => {
        profile[header] = values[index] || '';
      });
      
      return {
        name: profile.name || profile.full_name || '',
        email: profile.email || '',
        linkedinUrl: profile.linkedin_url || profile.linkedinurl || '',
        title: profile.title || profile.job_title || '',
        company: profile.company || '',
        location: profile.location || '',
        skills: (profile.skills || '').split(';').filter(Boolean),
        experience: profile.experience || '',
        education: profile.education || '',
        connections: parseInt(profile.connections) || 0
      };
    }).filter(profile => profile.email && profile.linkedinUrl);
  };

  const parseURLList = (urls: string): LinkedInProfile[] => {
    return urls.split('\n')
      .filter(url => url.trim())
      .map(url => ({
        name: '',
        email: '',
        linkedinUrl: url.trim(),
        title: '',
        company: '',
        location: '',
        skills: [],
        experience: '',
        education: '',
        connections: 0
      }));
  };

  const pauseJob = (jobId: string) => {
    setImportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'paused' as ImportJob['status'] } : job
    ));
  };

  const resumeJob = (jobId: string) => {
    setImportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'processing' as ImportJob['status'] } : job
    ));
  };

  const downloadTemplate = () => {
    const template = `name,email,linkedin_url,title,company,location,skills,experience,education,connections
John Doe,john@example.com,https://linkedin.com/in/johndoe,Software Engineer,TechCorp,San Francisco,"JavaScript;React;Node.js","5 years in software development",MIT Computer Science,500+
Jane Smith,jane@example.com,https://linkedin.com/in/janesmith,Product Manager,StartupCo,New York,"Product Management;Analytics;Strategy","3 years in product management",Stanford MBA,750+`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced LinkedIn Importer</h2>
          <p className="text-muted-foreground">
            Import LinkedIn profiles and data with advanced processing capabilities
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="urls">URL List</TabsTrigger>
          <TabsTrigger value="jobs">Import Jobs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload LinkedIn Data</CardTitle>
              <CardDescription>
                Upload a CSV file with LinkedIn profile data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {selectedFile ? (
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Drop your CSV file here</p>
                    <p className="text-muted-foreground">
                      or click to select a file
                    </p>
                  </div>
                )}
              </div>

              {csvData && (
                <div className="space-y-2">
                  <Label>CSV Preview</Label>
                  <Textarea
                    value={csvData.split('\n').slice(0, 5).join('\n')}
                    readOnly
                    className="h-32"
                  />
                  <p className="text-sm text-muted-foreground">
                    Showing first 5 lines. Total: {csvData.split('\n').length - 1} profiles
                  </p>
                </div>
              )}

              <Button 
                onClick={startBulkImport} 
                disabled={importing || !csvData}
                className="w-full"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Import
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn URLs</CardTitle>
              <CardDescription>
                Enter LinkedIn profile URLs to import (one per line)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="https://linkedin.com/in/username1
https://linkedin.com/in/username2
https://linkedin.com/in/username3"
                value={urlList}
                onChange={(e) => setUrlList(e.target.value)}
                className="h-48"
              />
              
              <Button 
                onClick={startBulkImport} 
                disabled={importing || !urlList.trim()}
                className="w-full"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing URLs...
                  </>
                ) : (
                  <>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Import from URLs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Jobs</CardTitle>
              <CardDescription>
                Monitor and manage LinkedIn import jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {importJobs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-2" />
                      <p>No import jobs yet</p>
                    </div>
                  ) : (
                    importJobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              job.status === 'completed' ? 'bg-green-500' :
                              job.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                              job.status === 'failed' ? 'bg-red-500' :
                              job.status === 'paused' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`} />
                            <div>
                              <h4 className="font-medium">{job.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {job.createdAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              job.status === 'completed' ? 'default' :
                              job.status === 'processing' ? 'secondary' :
                              job.status === 'failed' ? 'destructive' :
                              'outline'
                            }>
                              {job.status}
                            </Badge>
                            {job.status === 'processing' && (
                              <Button size="sm" variant="outline" onClick={() => pauseJob(job.id)}>
                                <Pause className="h-3 w-3" />
                              </Button>
                            )}
                            {job.status === 'paused' && (
                              <Button size="sm" variant="outline" onClick={() => resumeJob(job.id)}>
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{job.processed}/{job.total} ({Math.round(job.progress)}%)</span>
                          </div>
                          <Progress value={job.progress} className="w-full" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-600" />
                            <p className="font-medium">{job.successful}</p>
                            <p className="text-muted-foreground">Successful</p>
                          </div>
                          <div className="text-center">
                            <XCircle className="h-4 w-4 mx-auto mb-1 text-red-600" />
                            <p className="font-medium">{job.failed}</p>
                            <p className="text-muted-foreground">Failed</p>
                          </div>
                          <div className="text-center">
                            <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                            <p className="font-medium">{job.total - job.processed}</p>
                            <p className="text-muted-foreground">Remaining</p>
                          </div>
                        </div>
                        
                        {job.errors.length > 0 && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {job.errors.length} error(s) occurred. 
                              <Button variant="link" className="h-auto p-0 ml-1">
                                View details
                              </Button>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>
                Configure LinkedIn import behavior and options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Batch Size</Label>
                  <Input type="number" defaultValue="10" min="1" max="50" />
                  <p className="text-xs text-muted-foreground">Profiles per batch</p>
                </div>
                <div>
                  <Label>Delay (ms)</Label>
                  <Input type="number" defaultValue="100" min="0" max="5000" />
                  <p className="text-xs text-muted-foreground">Delay between batches</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Data Validation</Label>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Validate email addresses</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span>Validate LinkedIn URLs</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span>Skip duplicates</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};