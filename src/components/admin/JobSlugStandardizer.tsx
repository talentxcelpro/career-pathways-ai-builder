import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SlugSample {
  id: string;
  title: string;
  company: string;
  location: string;
  currentSlug: string;
  newSlug: string;
  needsUpdate: boolean;
}

interface StandardizationResult {
  success: boolean;
  totalJobs: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
  message: string;
}

export const JobSlugStandardizer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [samples, setSamples] = useState<SlugSample[]>([]);
  const [result, setResult] = useState<StandardizationResult | null>(null);
  const [showSamples, setShowSamples] = useState(false);

  const fetchSamples = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('standardize-job-slugs', {
        body: { action: 'sample' }
      });

      if (error) throw error;
      
      setSamples(data.samples || []);
      setShowSamples(true);
      toast.success('Sample data fetched successfully');
    } catch (error) {
      console.error('Error fetching samples:', error);
      toast.error('Failed to fetch sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const standardizeAllSlugs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('standardize-job-slugs', {
        body: { action: 'standardize' }
      });

      if (error) throw error;
      
      setResult(data);
      toast.success(data.message);
    } catch (error) {
      console.error('Error standardizing slugs:', error);
      toast.error('Failed to standardize job slugs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Job Slug Standardizer
            <Badge variant="outline">SEO Optimization</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Standardize all job URLs to follow the format: <br />
            <code className="bg-muted px-2 py-1 rounded text-xs">
              /jobs/&lt;title&gt;-&lt;code&gt;-&lt;company&gt;-&lt;location&gt;
            </code>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={fetchSamples}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Preview Changes
            </Button>

            <Button 
              onClick={standardizeAllSlugs}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Standardize All Jobs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Preview */}
      {showSamples && samples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview: Current vs New Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {samples.map((sample) => (
                <div key={sample.id} className="border rounded-lg p-3 space-y-2">
                  <div className="font-medium text-sm">{sample.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {sample.company} • {sample.location}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="text-red-600">Current:</span> 
                      <code className="ml-2 bg-red-50 text-red-700 px-2 py-1 rounded">
                        /jobs/{sample.currentSlug}
                      </code>
                    </div>
                    <div className="text-xs">
                      <span className="text-green-600">New:</span> 
                      <code className="ml-2 bg-green-50 text-green-700 px-2 py-1 rounded">
                        /jobs/{sample.newSlug}
                      </code>
                    </div>
                  </div>
                  <Badge variant={sample.needsUpdate ? "destructive" : "default"} className="text-xs">
                    {sample.needsUpdate ? "Needs Update" : "Already Correct"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Standardization Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.totalJobs}</div>
                <div className="text-xs text-muted-foreground">Total Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.updatedCount}</div>
                <div className="text-xs text-muted-foreground">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{result.skippedCount}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.errorCount}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {result.message}
            </div>

            {result.errors.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-red-600 mb-2">Errors:</div>
                <div className="text-xs space-y-1">
                  {result.errors.map((error, index) => (
                    <div key={index} className="bg-red-50 text-red-700 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};