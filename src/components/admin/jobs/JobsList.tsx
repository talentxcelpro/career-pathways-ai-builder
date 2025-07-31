
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Building2,
  Users,
  IndianRupee
} from 'lucide-react';
import { formatSalaryRange } from '@/utils/currencyUtils';

interface JobsListProps {
  jobs: any[];
  isLoading: boolean;
}

export const JobsList: React.FC<JobsListProps> = ({ jobs, isLoading }) => {
  const getJobStatusColor = (job: any) => {
    if (!job.is_active) return 'bg-red-100 text-red-800';
    if (job.expires_at && new Date(job.expires_at) < new Date()) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getJobStatusText = (job: any) => {
    if (!job.is_active) return 'Inactive';
    if (job.expires_at && new Date(job.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs ({jobs.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      {job.companies?.logo_url ? (
                        <img src={job.companies.logo_url} alt="Company" className="w-8 h-8 rounded" />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <Badge className={getJobStatusColor(job)}>
                          {getJobStatusText(job)}
                        </Badge>
                        {job.is_featured && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.companies?.name || job.company_name || 'Unknown Company'}
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Posted {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : new Date(job.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applications_count || 0} applications
                        </div>
                        {(job.salary_min || job.salary_max) && (
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />
                            {formatSalaryRange(job.salary_min, job.salary_max)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
