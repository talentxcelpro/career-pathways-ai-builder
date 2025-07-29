import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { fixBotAuthIssues } from '@/utils/fixBotAuth';
import { Loader2 } from 'lucide-react';

export const BotAuthFixer: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);

  const handleFixBotAuth = async () => {
    setIsFixing(true);
    try {
      const result = await fixBotAuthIssues();
      if (result.success) {
        toast.success(`Bot auth fixed successfully! ${result.message}`);
      } else {
        toast.error(`Failed to fix bot auth: ${result.error}`);
      }
    } catch (error) {
      console.error('Error fixing bot auth:', error);
      toast.error('Failed to fix bot authentication issues');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Authentication Fixer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Fix authentication schema issues for bot accounts that have null confirmation tokens.
        </p>
        <Button 
          onClick={handleFixBotAuth}
          disabled={isFixing}
          className="w-full"
        >
          {isFixing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Fix Bot Authentication
        </Button>
      </CardContent>
    </Card>
  );
};