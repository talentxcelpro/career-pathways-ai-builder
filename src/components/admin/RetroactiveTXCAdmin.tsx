import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRetroactiveTXC } from "@/hooks/useRetroactiveTXC";
import { AlertCircle, Gift } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const RetroactiveTXCAdmin = () => {
  const { awardRetroactiveTXC, isProcessing } = useRetroactiveTXC();

  const handleAwardRetroactive = async () => {
    try {
      await awardRetroactiveTXC();
    } catch (error) {
      console.error('Failed to award retroactive TXC:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Retroactive TXC Rewards
        </CardTitle>
        <CardDescription>
          Award TXC to existing users based on their past activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will award TXC to users based on their existing posts, connections, and profile completion.
            Rewards include: +500 TXC joining bonus, up to 10 posts (+150 each), up to 10 connections (+75 each), and +300 for completed profiles.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={handleAwardRetroactive}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Awarding Retroactive TXC..." : "Award Retroactive TXC"}
        </Button>
      </CardContent>
    </Card>
  );
};