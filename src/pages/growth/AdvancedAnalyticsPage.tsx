import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedEmployerAnalytics } from "@/components/analytics/AdvancedEmployerAnalytics";

const AdvancedAnalyticsPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Advanced Employer Analytics</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Deep hiring insights, job performance tracking, and comprehensive competitor analysis
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Hiring Intelligence Dashboard</CardTitle>
            <CardDescription>
              Advanced analytics for job performance, candidate insights, and market intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedEmployerAnalytics />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPage;