
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
  IndianRupee,
  Star,
  Tag
} from 'lucide-react';
import { formatSalaryRange } from '@/utils/currencyUtils';
import { CleanJobCard } from '@/components/jobs/CleanJobCard';

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
              <div key={job.id} className="relative">
                <CleanJobCard
                  job={{
                    ...job,
                    posted_at: job.date_posted || job.created_at,
                    company_name: job.companies?.name || job.company_name,
                    companies: job.companies || { 
                      id: '', 
                      name: job.company_name || 'Unknown Company',
                      logo_url: job.companies?.logo_url
                    }
                  }}
                 />
                 <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-sm border">
                   <Badge className={getJobStatusColor(job)}>
                     {getJobStatusText(job)}
                   </Badge>
                   {job.is_featured && (
                     <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                       <Star className="h-3 w-3 mr-1" />
                       Featured
                     </Badge>
                   )}
                   {job.priority && (
                     <Badge variant="outline" className="bg-blue-50 text-blue-700">
                       <Tag className="h-3 w-3 mr-1" />
                       Priority
                     </Badge>
                   )}
                   {job.source_type === 'bulk_upload' && (
                     <Badge variant="outline" className="bg-green-50 text-green-700">
                       Bulk Upload
                     </Badge>
                   )}
                   <Button variant="outline" size="sm">
                     <Eye className="h-4 w-4 mr-1" />
                     View
                   </Button>
                   <Button variant="outline" size="sm">
                     <Edit className="h-4 w-4 mr-1" />
                     Edit
                   </Button>
                   <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                     <Trash2 className="h-4 w-4 mr-1" />
                     Delete
                   </Button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
