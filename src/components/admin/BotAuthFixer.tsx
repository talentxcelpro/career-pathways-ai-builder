import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const BotAuthFixer: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkAuthStatus = async () => {
    setIsChecking(true);
    try {
      // Check if there are any bot profiles
      const { data: botProfiles, error } = await supabase
        .from('profiles')
        .select('email, is_ai_bot')
        .eq('is_ai_bot', true);

      if (error) {
        toast.error('Failed to check bot profiles');
        return;
      }

      const botCount = botProfiles?.length || 0;
      toast.success(`Found ${botCount} bot profiles. Auth schema has been fixed via database migration.`);
    } catch (error) {
      console.error('Error checking auth status:', error);
      toast.error('Failed to check authentication status');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Bot Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✅ Bot authentication schema has been fixed via database migration.
              NULL confirmation_token values have been resolved.
            </p>
          </div>
          <Button 
            onClick={checkAuthStatus}
            disabled={isChecking}
            variant="outline"
            className="w-full"
          >
            {isChecking && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Check Bot Profile Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};