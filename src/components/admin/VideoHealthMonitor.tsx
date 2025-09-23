import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import { scanCourseVideos } from '@/utils/videoValidation';
import { toast } from 'sonner';

export const VideoHealthMonitor: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{
    totalVideos: number;
    brokenVideos: Array<{ id: string; title: string; video_url: string; reason: string }>;
    validVideos: number;
  } | null>(null);

  const runHealthCheck = async () => {
    setIsScanning(true);
    try {
      const results = await scanCourseVideos();
      setScanResults(results);
      
      if (results.brokenVideos.length > 0) {
        toast.warning(`Found ${results.brokenVideos.length} broken videos out of ${results.totalVideos} total`);
      } else {
        toast.success(`All ${results.totalVideos} videos are working properly!`);
      }
    } catch (error) {
      toast.error('Failed to scan video health');
      console.error('Health check failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const healthPercentage = scanResults 
    ? Math.round((scanResults.validVideos / scanResults.totalVideos) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-500" />
          Video Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Monitor and track video availability across all courses
          </p>
          <Button 
            onClick={runHealthCheck} 
            disabled={isScanning}
            size="sm"
            variant="outline"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Health Check
              </>
            )}
          </Button>
        </div>

        {scanResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{scanResults.totalVideos}</div>
                <div className="text-sm text-muted-foreground">Total Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{scanResults.validVideos}</div>
                <div className="text-sm text-muted-foreground">Working</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{scanResults.brokenVideos.length}</div>
                <div className="text-sm text-muted-foreground">Broken</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
              <Badge variant={healthPercentage >= 90 ? 'default' : healthPercentage >= 70 ? 'secondary' : 'destructive'}>
                {healthPercentage}% Healthy
              </Badge>
            </div>

            {scanResults.brokenVideos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Broken Videos Found
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {scanResults.brokenVideos.slice(0, 5).map((video) => (
                    <div key={video.id} className="text-xs p-2 bg-muted rounded border-l-2 border-red-500">
                      <div className="font-medium truncate">{video.title}</div>
                      <div className="text-muted-foreground">{video.reason}</div>
                    </div>
                  ))}
                  {scanResults.brokenVideos.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{scanResults.brokenVideos.length - 5} more broken videos
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};