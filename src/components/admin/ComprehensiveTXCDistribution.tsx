import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useComprehensiveTXC } from "@/hooks/useComprehensiveTXC";
import { AlertCircle, Gift, Users, Activity, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const ComprehensiveTXCDistribution = () => {
  const { executeDistribution, isProcessing, lastResults } = useComprehensiveTXC();

  const handleDistribution = async () => {
    try {
      await executeDistribution();
    } catch (error) {
      console.error('Failed to execute TXC distribution:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Comprehensive TXC Distribution
        </CardTitle>
        <CardDescription>
          Execute platform-wide TXC distribution with welcome bonus, active user bonus, and retroactive rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold">This will execute a 3-phase TXC distribution:</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span><strong>Phase 1:</strong> 500 TXC welcome bonus to ALL users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  <span><strong>Phase 2:</strong> 150 TXC bonus to active users (last 30 days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span><strong>Phase 3:</strong> Retroactive rewards from 01-09-2025 (posts, connections, profile completion, job applications)</span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {lastResults && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="font-semibold">Last Distribution Results:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{lastResults.summary.phase1_users}</div>
                <div className="text-sm text-muted-foreground">Welcome Bonus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{lastResults.summary.phase2_users}</div>
                <div className="text-sm text-muted-foreground">Active Bonus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{lastResults.summary.phase3_users}</div>
                <div className="text-sm text-muted-foreground">Retroactive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{lastResults.total_awarded.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total TXC</div>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">
              Distribution completed: {new Date(lastResults.summary.distribution_date).toLocaleString()}
            </Badge>
          </div>
        )}
        
        <Button 
          onClick={handleDistribution}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Executing Distribution..." : "Execute Comprehensive TXC Distribution"}
        </Button>
      </CardContent>
    </Card>
  );
};