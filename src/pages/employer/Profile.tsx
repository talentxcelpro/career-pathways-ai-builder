
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Settings, Globe, Code2, Sparkles, CheckCircle2 } from "lucide-react";
import { EmployerHiringBadgeGenerator } from "@/components/employer/EmployerHiringBadgeGenerator";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const EmployerProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'widget'>('profile');

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

  const companyData = Array.isArray(company) ? company[0] : company;
  const companyName = companyData?.name || 'TalentXcel Partner';
  const companySlug = companyData?.slug || (companyName ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'talentxcel');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">Manage your company information, public profile, and embeddable hiring widgets</p>
        </div>
        <Button onClick={() => navigate('/employer/profile/edit')} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl border border-slate-200">
          <TabsTrigger value="profile" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs">
            <Building2 className="w-3.5 h-3.5 mr-1.5" /> Company Overview
          </TabsTrigger>
          <TabsTrigger value="widget" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs">
            <Code2 className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Hiring Widget
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={() => navigate('/employer/team')}>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Users className="h-4 w-4 text-blue-600" />
              Team Management
            </CardTitle>
            <CardDescription className="text-[11px] mt-1">Invite recruiters and hiring managers</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={() => navigate('/employer/applications')}>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Building2 className="h-4 w-4 text-purple-600" />
              Job Applications
            </CardTitle>
            <CardDescription className="text-[11px] mt-1">Review candidates across your positions</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={handleViewPublicProfile}>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Globe className="h-4 w-4 text-emerald-600" />
              Public Page
            </CardTitle>
            <CardDescription className="text-[11px] mt-1">View how applicants see your organization</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-200" onClick={() => setActiveTab('widget')}>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Code2 className="h-4 w-4 text-blue-600" />
              Hiring Widget
            </CardTitle>
            <CardDescription className="text-[11px] mt-1">Embed live badge on careers site &amp; GitHub</CardDescription>
          </CardHeader>
        </Card>
      </div>
        </TabsContent>

        {/* TAB: HIRING WIDGET GENERATOR */}
        <TabsContent value="widget" className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <span>Employer Hiring Widget Studio</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Add an official TalentXcel hiring badge to your company website, documentation, or engineering GitHub repo. Candidates who click the badge are seamlessly routed directly to your verified jobs hub on TalentXcel.
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('profile')}
              variant="outline"
              size="sm"
              className="bg-white text-xs font-semibold self-start sm:self-auto"
            >
              Back to Overview
            </Button>
          </div>

          <EmployerHiringBadgeGenerator
            companyName={companyName}
            companySlug={companySlug}
            openRolesCount={profileStats?.jobsCount || 1}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerProfile;
