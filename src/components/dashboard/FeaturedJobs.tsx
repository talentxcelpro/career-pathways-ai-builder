
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  employment_type: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  companies?: {
    name: string;
    logo_url?: string;
  };
}

interface FeaturedJobsProps {
  jobs: Job[];
}

export const FeaturedJobs = ({ jobs }: FeaturedJobsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Featured Jobs
        </CardTitle>
        <CardDescription>Opportunities matching your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No jobs available at the moment</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <Badge variant="secondary">{job.employment_type}</Badge>
              </div>
              <p className="text-gray-600 mb-1">
                {job.companies?.name} • {job.location || 'Remote'}
              </p>
              {job.salary_min && job.salary_max && (
                <p className="text-green-600 font-medium">
                  ${job.salary_min}k - ${job.salary_max}k
                </p>
              )}
            </div>
          ))
        )}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/jobs')}
        >
          View All Jobs
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
