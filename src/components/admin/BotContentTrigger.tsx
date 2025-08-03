import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, Users, Calendar, Zap, CheckCircle, AlertCircle, 
  Bot, Sparkles, Clock, Target 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TriggerResult {
  bot_name: string;
  bot_role: string;
  content_generated: boolean;
  content_preview?: string;
  generation_method?: string;
  error?: string;
}

interface GenerationSummary {
  total_bots_processed: number;
  successful_generations: number;
  failed_generations: number;
  generation_timestamp: string;
  next_suggested_run: string;
}

const BotContentTrigger: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResults, setLastResults] = useState<TriggerResult[]>([]);
  const [lastSummary, setLastSummary] = useState<GenerationSummary | null>(null);

  const triggerContentGeneration = async (triggerType: 'single' | 'daily' | 'weekly' | 'all', botId?: string) => {
    setIsGenerating(true);
    
    try {
      console.log(`🚀 Triggering ${triggerType} content generation...`);
      
      const { data, error } = await supabase.functions.invoke('generate-bot-content', {
        body: {
          trigger_type: triggerType,
          bot_id: botId
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Generation response:', data);
      
      if (data.success) {
        setLastResults(data.results || []);
        setLastSummary(data.summary || null);
        
        toast.success(
          `🎉 Content Generated!`, 
          {
            description: `${data.summary?.successful_generations || 0} bots created fresh content`
          }
        );
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('❌ Content generation failed:', error);
      toast.error('Content generation failed', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Bot Content Generation Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => triggerContentGeneration('all')}
              disabled={isGenerating}
              className="h-auto p-4 flex flex-col items-center gap-2"
              variant="default"
            >
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">All Bots</div>
                <div className="text-xs opacity-80">Generate for everyone</div>
              </div>
            </Button>

            <Button
              onClick={() => triggerContentGeneration('daily')}
              disabled={isGenerating}
              className="h-auto p-4 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Calendar className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Daily Bots</div>
                <div className="text-xs opacity-80">Daily frequency only</div>
              </div>
            </Button>

            <Button
              onClick={() => triggerContentGeneration('weekly')}
              disabled={isGenerating}
              className="h-auto p-4 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Clock className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Weekly Bots</div>
                <div className="text-xs opacity-80">Weekly frequency only</div>
              </div>
            </Button>

            <Button
              onClick={() => triggerContentGeneration('single', 'Ishaan')}
              disabled={isGenerating}
              className="h-auto p-4 flex flex-col items-center gap-2"
              variant="secondary"
            >
              <Target className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Test Ishaan</div>
                <div className="text-xs opacity-80">Career Coach test</div>
              </div>
            </Button>
          </div>

          {isGenerating && (
            <Alert className="mt-4">
              <Zap className="h-4 w-4 animate-pulse" />
              <AlertDescription>
                🤖 Bots are generating content... This may take up to 2 minutes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {lastSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Latest Generation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{lastSummary.total_bots_processed}</div>
                <div className="text-sm text-blue-700">Bots Processed</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{lastSummary.successful_generations}</div>
                <div className="text-sm text-green-700">Content Created</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{lastSummary.failed_generations}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round((lastSummary.successful_generations / lastSummary.total_bots_processed) * 100)}%
                </div>
                <div className="text-sm text-purple-700">Success Rate</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Generated:</strong> {new Date(lastSummary.generation_timestamp).toLocaleString()}</p>
              <p><strong>Next Suggested:</strong> {new Date(lastSummary.next_suggested_run).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {lastResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.content_generated)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.bot_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.bot_role}
                      </Badge>
                      {result.generation_method && (
                        <Badge variant="secondary" className="text-xs">
                          {result.generation_method}
                        </Badge>
                      )}
                    </div>
                    
                    {result.content_generated ? (
                      result.content_preview && (
                        <p className="text-sm text-gray-600 italic">
                          "{result.content_preview}"
                        </p>
                      )
                    ) : (
                      <p className="text-sm text-red-600">
                        Error: {result.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Generated content appears in the Content Queue and requires approval before publishing. 
          Check the Bot Content Dashboard to review and approve posts.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BotContentTrigger;