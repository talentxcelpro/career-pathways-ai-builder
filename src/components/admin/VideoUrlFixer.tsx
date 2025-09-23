import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const VideoUrlFixer: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);

  const fixVideoUrls = async () => {
    setIsFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-video-urls');
      
      if (error) throw error;
      
      toast.success(`Successfully updated ${data.updated_count} video URLs!`);
    } catch (error) {
      console.error('Error fixing video URLs:', error);
      toast.error('Failed to fix video URLs');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video URL Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Fix Rick Astley placeholder videos with appropriate educational content based on course topics.
        </p>
        <Button 
          onClick={fixVideoUrls} 
          disabled={isFixing}
          className="w-full"
        >
          {isFixing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Fixing Video URLs...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Fix Video URLs
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};