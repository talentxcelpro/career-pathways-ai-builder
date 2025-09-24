import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Video, PlayCircle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface IntegrationResult {
  lessonId: string;
  lessonTitle: string;
  success: boolean;
  muxPlaybackId?: string;
  error?: string;
}

interface IntegrationStats {
  lessons_processed: number;
  mux_videos_created: number;
  total_lessons: number;
}

export const VideoIntegrationPanel: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<IntegrationResult[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);

  const handleReplaceAllVideos = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setStats(null);

    try {
      toast.info('🚀 Starting video integration process...');

      const { data, error } = await supabase.functions.invoke('mux-video-integration', {
        body: { action: 'replace_all' }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setStats(data.stats);
        setResults(data.details || []);
        setProgress(100);
        
        toast.success(
          `✅ Successfully integrated ${data.stats.mux_videos_created} videos with Mux!`
        );
      } else {
        throw new Error(data.error || 'Integration failed');
      }

    } catch (error: any) {
      console.error('Video integration error:', error);
      toast.error(`❌ Integration failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const successfulVideos = results.filter(r => r.success);
  const failedVideos = results.filter(r => !r.success);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Mux Video Integration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Replace YouTube URLs with proper Mux playback IDs for better video delivery and course-specific content.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Button */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleReplaceAllVideos}
            disabled={isProcessing}
            size="lg"
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Videos...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                🎬 Replace All Videos with Mux
              </>
            )}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Creating course-specific video content...
              </p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total_lessons}</div>
                <div className="text-sm text-muted-foreground">Total Lessons</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.mux_videos_created}</div>
                <div className="text-sm text-muted-foreground">Videos Created</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.lessons_processed}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Integration Results</h3>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {successfulVideos.length} Success
                </Badge>
                {failedVideos.length > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {failedVideos.length} Failed
                  </Badge>
                )}
              </div>
            </div>

            {/* Successful Videos */}
            {successfulVideos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">✅ Successfully Integrated</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {successfulVideos.map((result) => (
                    <div
                      key={result.lessonId}
                      className="flex items-center justify-between p-2 bg-green-50 rounded-lg text-sm"
                    >
                      <span className="truncate flex-1">{result.lessonTitle}</span>
                      {result.muxPlaybackId && (
                        <Badge variant="outline" className="text-xs">
                          {result.muxPlaybackId.substring(0, 8)}...
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Videos */}
            {failedVideos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">❌ Failed to Integrate</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {failedVideos.map((result) => (
                    <div
                      key={result.lessonId}
                      className="flex items-center justify-between p-2 bg-red-50 rounded-lg text-sm"
                    >
                      <span className="truncate flex-1">{result.lessonTitle}</span>
                      <span className="text-xs text-red-600 max-w-32 truncate">
                        {result.error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What this does:</p>
              <ul className="space-y-1 text-xs">
                <li>• Replaces YouTube URLs with Mux playback IDs</li>
                <li>• Creates course-specific video content</li>
                <li>• Improves video delivery performance</li>
                <li>• Enables better video analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};