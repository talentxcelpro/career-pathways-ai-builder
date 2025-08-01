import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, AlertTriangle, Globe, MapPin, Trash2, RefreshCw } from 'lucide-react';

export const QualityJobsManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobCount, setJobCount] = useState(50);
  const [internationalRatio, setInternationalRatio] = useState(0.3);

  const generateQualityJobs = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('job-scraper-quality', {
        body: {
          limit: jobCount,
          international_ratio: internationalRatio
        }
      });

      if (response.error) {
        throw response.error;
      }

      const data = response.data;
      toast.success(`Successfully generated ${data.stats.successfully_inserted} quality jobs!`);
      
    } catch (error) {
      console.error('Error generating jobs:', error);
      toast.error('Failed to generate quality jobs');
    } finally {
      setIsGenerating(false);
    }
  };

  const cleanupLowQualityJobs = async () => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .or('external_url.is.null,salary_min.is.null,expires_at.lt.now()');

      if (error) throw error;
      
      toast.success('Cleaned up low-quality jobs');
    } catch (error) {
      console.error('Error cleaning jobs:', error);
      toast.error('Failed to cleanup jobs');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Quality Job Generation System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quality Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Verified URLs</h3>
              </div>
              <p className="text-sm text-green-700">All job URLs tested & working from trusted sources</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Real Salaries</h3>
              </div>
              <p className="text-sm text-blue-700">Market-accurate compensation based on role & location</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Curated Locations</h3>
              </div>
              <p className="text-sm text-purple-700">Top 20 India cities + 50 international locations</p>
            </div>
          </div>

          {/* Generation Controls */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="jobCount">Number of Jobs to Generate</Label>
                <Input
                  id="jobCount"
                  type="number"
                  value={jobCount}
                  onChange={(e) => setJobCount(parseInt(e.target.value))}
                  min="10"
                  max="200"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 50-100 jobs per batch</p>
              </div>
              
              <div>
                <Label htmlFor="intlRatio">International Jobs Ratio</Label>
                <Input
                  id="intlRatio"
                  type="number"
                  step="0.1"
                  value={internationalRatio}
                  onChange={(e) => setInternationalRatio(parseFloat(e.target.value))}
                  min="0"
                  max="1"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">0.3 = 30% international, 70% India</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={generateQualityJobs}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Generate Quality Jobs
                  </>
                )}
              </Button>
              
              <Button 
                onClick={cleanupLowQualityJobs}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup Low Quality Jobs
              </Button>
            </div>
          </div>

          {/* Quality Standards */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Quality Standards Applied</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Valid working external URLs from trusted domains',
                'Complete salary information (min/max/range)',
                'Fresh postings (within last 30 days)',
                'Verified company names and details',
                'Location mapped to approved taxonomy',
                'Role-specific skill requirements',
                'Professional job descriptions',
                'Industry categorization'
              ].map((standard, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{standard}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Trusted Sources</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'LinkedIn Jobs (95%)',
                'Indeed (90%)',
                'Glassdoor (88%)',
                'Naukri.com (85%)',
                'Stack Overflow (92%)',
                'GitHub Jobs (90%)',
                'AngelList (88%)'
              ].map((source) => (
                <Badge key={source} variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};