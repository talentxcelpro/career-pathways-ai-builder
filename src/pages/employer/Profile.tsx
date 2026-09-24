
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Settings, Globe } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const EmployerProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get the company associated with the current user
  // Get the company associated with the current user
  const { data: company, isLoading } = useQuery({
    queryKey: ['employer-company', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // 1. First check if user owns a company (get the most recent one)
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('company_id, companies(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (companyProfile?.companies) {
        return companyProfile.companies;
      }

      // 2. If not owner, check if user is an active team member
      const { data: teamMember } = await supabase
        .from('company_team_members')
        .select('company_id, companies(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (teamMember?.companies) {
        return teamMember.companies;
      }

      // 3. Fallback: check if user posted jobs with a company name
      const { data: jobWithCompany } = await supabase
        .from('jobs')
        .select('company_name, company_id')
        .eq('posted_by', user.id)
        .not('company_name', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (jobWithCompany?.company_name) {
        return {
          id: jobWithCompany.company_id || undefined,
          name: jobWithCompany.company_name,
          industry: 'Registered Employer',
          location: 'Global / Remote',
          is_provisional: !jobWithCompany.company_id
        };
      }

      return null;
    },
    enabled: !!user?.id
  });

  // Query live stats for this company/employer
  const { data: profileStats } = useQuery({
    queryKey: ['employer-profile-stats', user?.id, (company as any)?.id],
    queryFn: async () => {
      if (!user?.id) return { jobsCount: 0, applicantsCount: 0 };
      const companyId = (company as any)?.id;
      let query = supabase.from('jobs').select('id, views_count, applications_count');
      if (companyId && companyId !== 'unclaimed') {
        query = query.or(`posted_by.eq.${user.id},company_id.eq.${companyId}`);
      } else {
        query = query.eq('posted_by', user.id);
      }
      const { data: jobs } = await query;
      const totalJobs = jobs?.length || 0;
      const totalApps = jobs?.reduce((sum, j) => sum + (j.applications_count || 0), 0) || 0;
      return { jobsCount: totalJobs, applicantsCount: totalApps };
    },
    enabled: !!user?.id
  });

  const handleViewPublicProfile = () => {
    const companyData = Array.isArray(company) ? company[0] : company;
    if (companyData?.id && companyData?.id !== 'unclaimed') {
      navigate(`/companies/${companyData.id}`);
    } else {
      navigate('/employer/profile/edit');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">Manage your company information and public profile</p>
        </div>
        <Button onClick={() => navigate('/employer/profile/edit')} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Company Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Company Information
          </CardTitle>
          <CardDescription>Your organization's identity and candidate-facing profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border rounded-xl bg-slate-50/50">
                <div className="flex items-center space-x-4">
                  {(company as any)?.logo_url ? (
                    <img 
                      src={(company as any)?.logo_url} 
                      alt={`${(company as any)?.name} logo`}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{(company as any)?.name}</h3>
                      {(company as any)?.is_provisional ? (
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Unclaimed Profile
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Verified Employer
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{(company as any)?.industry || 'Organization'}</p>
                    <p className="text-xs text-slate-500">{(company as any)?.location || 'Global'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => navigate('/employer/profile/edit')} variant="outline" size="sm" className="bg-white">
                    <Settings className="h-4 w-4 mr-1.5" />
                    Edit Info
                  </Button>
                  <Button onClick={handleViewPublicProfile} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <Globe className="h-4 w-4 mr-1.5" />
                    Public Page
                  </Button>
                </div>
              </div>

              {/* Live Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-xs text-slate-500 font-medium">Total Openings</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{profileStats?.jobsCount ?? 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-xs text-slate-500 font-medium">Total Applicants</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{profileStats?.applicantsCount ?? 0}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-xs text-slate-500 font-medium">Team Members</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">Active</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <p className="text-xs text-slate-500 font-medium">Talent Brand</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">Live</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Set Up Your Company Profile</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
                Add your company details, logo, and careers page information to build credibility and attract top candidates.
              </p>
              <Button onClick={() => navigate('/employer/profile/edit')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Set Up Company Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={() => navigate('/employer/team')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Users className="h-5 w-5 text-blue-600" />
              Team Management
            </CardTitle>
            <CardDescription className="text-xs">Invite recruiters and hiring managers</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={() => navigate('/employer/applications')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Building2 className="h-5 w-5 text-purple-600" />
              Job Applications
            </CardTitle>
            <CardDescription className="text-xs">Review candidates across all your positions</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={handleViewPublicProfile}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Globe className="h-5 w-5 text-emerald-600" />
              Public Careers Page
            </CardTitle>
            <CardDescription className="text-xs">View how applicants see your organization</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default EmployerProfile;
