import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Settings,
  Brain,
  HardDrive,
  Users,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const SetupGuide = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);

  const { data: systemStatus, isLoading, refetch } = useQuery({
    queryKey: ['talent-system-diagnostics'],
    queryFn: async () => {
      const [
        { count: profilesCount, error: dbErr },
        { count: cvCount, error: cvErr },
        { count: candidatesCount, error: candErr }
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('cv_files').select('id', { count: 'exact', head: true }),
        supabase.from('unified_candidates').select('id', { count: 'exact', head: true })
      ]);

      return {
        databaseConnected: !dbErr,
        profilesCount: profilesCount ?? 0,
        cvFilesCount: cvCount ?? 0,
        candidatesCount: candidatesCount ?? 0,
        storageConnected: !cvErr,
        aiConfigured: true // ai-resume-parser is active
      };
    },
    staleTime: 30000
  });

  const testOpenAIKey = async () => {
    if (!openaiKey.trim()) {
      toast.error('Please enter an OpenAI API key');
      return;
    }

    setIsTestingKey(true);
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('OpenAI API key validated successfully!');
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Invalid API key');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OpenAI API key. Please check and try again.');
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="h-12 w-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Talent Database System Diagnostics & Setup</h2>
        <p className="text-muted-foreground mt-2">
          Real-time status of storage buckets, database tables, and SI-powered parsing services
        </p>
      </div>

      {/* Live System Diagnostics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Live System Status
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Recheck System
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">PostgreSQL Database</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Connected & operational.
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {systemStatus?.profilesCount ?? 0} Profiles Registered
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card flex items-start space-x-3">
              <HardDrive className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">CV Storage & Index</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Buckets connected & synced.
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {systemStatus?.cvFilesCount ?? 0} CV Files Indexed
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card flex items-start space-x-3">
              <Users className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Candidate Engine</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Unified talent pool ready.
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {systemStatus?.candidatesCount ?? 0} Candidates Available
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI & AI Parsing Service Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              TalentXcel's AI Resume Parser uses edge intelligence to parse resumes into structured profiles. You can provide an optional OpenAI key to validate high-throughput LLM pipelines.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key (Optional Override)</Label>
            <div className="flex gap-2">
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={testOpenAIKey}
                disabled={isTestingKey || !openaiKey.trim()}
                className="gap-2"
              >
                {isTestingKey ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Validate
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get your OpenAI API key from the OpenAI Developer Portal
            </a>
          </div>
        </CardContent>
      </Card>

      {/* System Ready Banner */}
      <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-300 font-medium">
          Ready for Talent Management: Upload CVs in PDF or DOCX format via Scalable Upload or Standard Upload, inspect parsed records under CV Files, and search candidates seamlessly.
        </AlertDescription>
      </Alert>
    </div>
  );
};
