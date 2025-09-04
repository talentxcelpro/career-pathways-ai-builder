import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAcquisitionHub } from "@/components/growth/UserAcquisitionHub";

const UserAcquisitionPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Acquisition Hub</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Supercharge your growth with advanced referral systems, gamification, and comprehensive analytics
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Growth & Acquisition Tools</CardTitle>
            <CardDescription>
              Advanced referral system with leaderboards, rewards, and detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserAcquisitionHub />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAcquisitionPage;