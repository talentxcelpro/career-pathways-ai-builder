
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { getCompanyLogoWithFallback } from "@/services/companyLogoService";

interface Job {
  id: string;
  title: string;
  description?: string;
  location: string;
  employment_type: string;
  created_at?: string;
  salary_min?: number;
  salary_max?: number;
  skills_required?: string[];
  companies?: {
    name: string;
    logo_url?: string;
  };
}

interface FeaturedJobsProps {
  jobs: Job[];
}

export const FeaturedJobs = ({ jobs }: FeaturedJobsProps) => {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Featured Jobs</CardTitle>
            <CardDescription>
              Recommended opportunities for you
            </CardDescription>
          </div>
          <Link to="/jobs">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No featured jobs available at the moment.</p>
          ) : (
            jobs.slice(0, 3).map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={job.companies?.logo_url || getCompanyLogoWithFallback(job.companies?.name || "Company")} 
                          alt={job.companies?.name || "Company"} 
                        />
                        <AvatarFallback className="text-xs bg-muted">
                          {(job.companies?.name || "Company").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{job.companies?.name || "Company"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location || "Remote"}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeAgo(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{job.employment_type || "Full-time"}</Badge>
                </div>
                
                <div className="mb-3">
                  <span className="font-medium text-green-600">
                    {formatSalaryRange(job.salary_min, job.salary_max, true, (job as any).salary_range)}
                  </span>
                </div>
                
                {job.skills_required && job.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills_required.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button size="sm" asChild>
                    <Link to={`/jobs/${job.id}`}>View Details</Link>
                  </Button>
                  <Button size="sm" variant="outline">Save</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
