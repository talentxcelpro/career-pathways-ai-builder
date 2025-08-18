
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
  const { data: company } = useQuery({
    queryKey: ['employer-company', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First check if user owns a company (get the most recent one)
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('company_id, companies(*)')
        .eq('owner_id', user.id)
        .order('companies(created_at)', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (companyProfile) {
        return companyProfile.companies;
      }

      // If not owner, check if user is a team member
      const { data: teamMember } = await supabase
        .from('company_team_members')
        .select('company_id, companies(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      return teamMember?.companies || null;
    },
    enabled: !!user?.id
  });

  const handleViewPublicProfile = () => {
    const companyData = Array.isArray(company) ? company[0] : company;
    if (companyData?.id) {
      navigate(`/companies/${companyData.id}`);
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
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Your company's public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company ? (
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              {(company as any)?.logo_url ? (
                <img 
                  src={(company as any)?.logo_url} 
                  alt={`${(company as any)?.name} logo`}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              )}
               <div className="flex-1">
                <h3 className="text-xl font-semibold">{(company as any)?.name}</h3>
                <p className="text-gray-600">{(company as any)?.industry}</p>
                <p className="text-sm text-gray-500">{(company as any)?.location}</p>
               </div>
              <Button onClick={handleViewPublicProfile}>
                <Globe className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Complete Your Company Profile</h3>
              <p className="mb-4">Add your company information to attract better candidates</p>
              <Button onClick={() => navigate('/employer/profile/edit')}>
                Set Up Company Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/team')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Team Management
            </CardTitle>
            <CardDescription>Manage team members and roles</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/employer/settings')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Account Settings
            </CardTitle>
            <CardDescription>Configure notifications and preferences</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewPublicProfile}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Public Profile
            </CardTitle>
            <CardDescription>View your public company page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default EmployerProfile;
