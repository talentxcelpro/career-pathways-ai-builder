import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const JobGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<any>(null);

  const generateJobs = async () => {
    setIsGenerating(true);
    setProgress(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-realistic-jobs');
      
      if (error) {
        throw error;
      }
      
      setProgress(data);
      toast.success(`Successfully generated ${data.breakdown?.total_inserted || 0} realistic job listings!`);
      
    } catch (error) {
      console.error('Job generation failed:', error);
      toast.error(`Job generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Realistic Job Generator
        </CardTitle>
        <CardDescription>
          Generate 500 realistic job listings across 16 industries, 5 experience levels, 
          and salary ranges from ₹1.8 LPA to ₹70 LPA for immediate Google Jobs SEO impact.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {progress && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Generation Complete!</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Generated:</span>
                <span className="ml-2">{progress.breakdown?.total_generated || 0}</span>
              </div>
              <div>
                <span className="font-medium">Successfully Inserted:</span>
                <span className="ml-2">{progress.breakdown?.total_inserted || 0}</span>
              </div>
              <div>
                <span className="font-medium">Industries Covered:</span>
                <span className="ml-2">{progress.breakdown?.industries_covered || 0}</span>
              </div>
              <div>
                <span className="font-medium">Experience Levels:</span>
                <span className="ml-2">{progress.breakdown?.experience_levels || 0}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">What will be generated:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground ml-4">
            <li>• 16 industries: IT/Software, Banking, Healthcare, Education, etc.</li>
            <li>• 5 experience levels: Fresher (0-2y) → Leadership (15-20y)</li>
            <li>• Realistic salaries: ₹1.8 LPA → ₹70 LPA based on experience</li>
            <li>• 18 Indian cities with proper distribution</li>
            <li>• Google Jobs compliant structured data</li>
            <li>• Proper SEO slugs and meta information</li>
          </ul>
        </div>

        <Button 
          onClick={generateJobs} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Jobs... (This may take 5-10 minutes)
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Generate 500 Realistic Jobs
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Generation in progress...</p>
              <p className="text-xs mt-1">
                AI is creating realistic job descriptions for each industry and experience level. 
                This process uses OpenAI to ensure high-quality, diverse job listings.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};