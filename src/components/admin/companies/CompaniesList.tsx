
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  Globe,
  Briefcase
} from 'lucide-react';

interface CompaniesListProps {
  companies: any[];
  isLoading: boolean;
  onToggleVerification: (companyId: string, isVerified: boolean) => void;
}

export const CompaniesList: React.FC<CompaniesListProps> = ({ 
  companies, 
  isLoading, 
  onToggleVerification 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies ({companies?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {companies?.map((company) => (
              <div key={company.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {company.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <Badge className={company.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {company.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                        {company.industry && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {company.industry}
                          </div>
                        )}
                        {company.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {company.location}
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {new Date(company.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {company.description || 'No description available'}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Jobs Posted: {company.company_profiles?.[0]?.jobs_posted_count || 0}</span>
                        <span>Active Jobs: {company.company_profiles?.[0]?.active_jobs_count || 0}</span>
                        <span>Applications: {company.company_profiles?.[0]?.total_applications_received || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onToggleVerification(company.id, !company.is_verified)}
                    >
                      {company.is_verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
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
