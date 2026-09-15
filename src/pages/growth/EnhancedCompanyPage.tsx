import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCompanyProfile } from "@/components/company/EnhancedCompanyProfile";

const EnhancedCompanyPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Company Profiles</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create comprehensive company pages with rich media, updates, and detailed analytics
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Profile Management</CardTitle>
            <CardDescription>
              Build engaging company pages with videos, photos, updates, and performance insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedCompanyProfile />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedCompanyPage;