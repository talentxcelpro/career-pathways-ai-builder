import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Building, TrendingUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useJobStats } from "@/hooks/useJobs";

export const JobsStatsCard = () => {
  const { stats, isLoading } = useJobStats();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-blue-600" />
          Job Market
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Active Jobs</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-600">{stats?.activeJobs || 0}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-xs"
                asChild
              >
                <Link to="/jobs">
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Companies</span>
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3 text-slate-500" />
              <span className="text-sm font-medium text-slate-800">{stats?.companies || 0}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">New this week</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <TrendingUp className="h-2 w-2 mr-1" />
                +{stats?.recentJobs || 0}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};