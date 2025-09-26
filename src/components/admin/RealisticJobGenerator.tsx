import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const RealisticJobGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobCount, setJobCount] = useState(10);
  const [lastGenerated, setLastGenerated] = useState<any[]>([]);

  const generateJobs = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🚀 Starting job generation...');
      
      const { data, error } = await supabase.functions.invoke('generate-realistic-jobs', {
        body: { count: jobCount }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(error.message || 'Failed to generate jobs');
      }

      if (data?.success) {
        setLastGenerated(data.jobs || []);
        toast.success(`✅ Successfully generated ${data.jobs?.length || jobCount} realistic jobs!`);
        console.log('✅ Jobs generated successfully:', data);
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error: any) {
      console.error('❌ Job generation failed:', error);
      toast.error(`Failed to generate jobs: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          Generate Realistic Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobCount" className="text-sm font-medium">
            Number of jobs to generate
          </Label>
          <Input
            id="jobCount"
            type="number"
            min="1"
            max="50"
            value={jobCount}
            onChange={(e) => setJobCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            className="w-full"
          />
        </div>
        
        <Button 
          onClick={generateJobs} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate {jobCount} Jobs
            </>
          )}
        </Button>

        {lastGenerated.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Last Generation Successful
              </span>
            </div>
            <p className="text-xs text-green-700">
              Generated {lastGenerated.length} jobs including roles at companies like{' '}
              {lastGenerated.slice(0, 3).map(job => job.company_name).join(', ')}
              {lastGenerated.length > 3 && ' and more...'}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Creates jobs with realistic Indian companies</p>
          <p>• Includes proper salary ranges and locations</p>
          <p>• SEO-optimized slugs and descriptions</p>
          <p>• Mixed remote and office positions</p>
        </div>
      </CardContent>
    </Card>
  );
};