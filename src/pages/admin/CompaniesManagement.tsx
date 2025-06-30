
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Building2, 
  Search, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  Globe,
  Users,
  Briefcase
} from 'lucide-react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { ExportButton } from '@/components/admin/ExportButton';

const CompaniesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['admin-companies', searchTerm, verificationFilter, industryFilter],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select(`
          *,
          company_profiles (
            jobs_posted_count,
            total_applications_received,
            active_jobs_count
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (verificationFilter !== 'all') {
        query = query.eq('is_verified', verificationFilter === 'verified');
      }

      if (industryFilter !== 'all') {
        query = query.eq('industry', industryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: companyStats } = useQuery({
    queryKey: ['company-stats'],
    queryFn: async () => {
      const [
        { count: totalCompanies },
        { count: verifiedCompanies },
        { count: activeCompanies },
        { data: industries }
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('companies').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('companies').select('industry').not('industry', 'is', null)
      ]);

      const uniqueIndustries = [...new Set(industries?.map(c => c.industry).filter(Boolean))];

      return {
        totalCompanies: totalCompanies || 0,
        verifiedCompanies: verifiedCompanies || 0,
        activeCompanies: activeCompanies || 0,
        industries: uniqueIndustries
      };
    }
  });

  const toggleVerification = useMutation({
    mutationFn: async ({ companyId, isVerified }: { companyId: string; isVerified: boolean }) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_verified: isVerified })
        .eq('id', companyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Company verification status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update verification status');
    }
  });

  return (
    <UnifiedAdminLayout 
      title="Companies Management" 
      description="Manage company profiles and verification status"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{companyStats?.totalCompanies?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{companyStats?.verifiedCompanies?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">New (30 days)</p>
                  <p className="text-2xl font-bold text-gray-900">{companyStats?.activeCompanies?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Industries</p>
                  <p className="text-2xl font-bold text-gray-900">{companyStats?.industries?.length || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Companies</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Industries</option>
                {companyStats?.industries?.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              <ExportButton 
                data={companies || []} 
                filename="companies-export" 
                format="csv"
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
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
                          onClick={() => toggleVerification.mutate({ 
                            companyId: company.id, 
                            isVerified: !company.is_verified 
                          })}
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
      </div>
    </UnifiedAdminLayout>
  );
};

export default CompaniesManagement;
