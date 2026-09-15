import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, UserPlus, Mail, Copy, Share, Shield, CheckCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const TeamAccessInstructions = () => {
  const navigate = useNavigate();
  
  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/employer/request-access`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard! Share this with your colleagues.');
  };

  const rolePermissions = [
    {
      role: 'Owner',
      permissions: ['Full access to all features', 'Manage team members', 'Company settings', 'Billing & payments'],
      color: 'text-purple-700 bg-purple-100'
    },
    {
      role: 'Admin',
      permissions: ['Manage team members', 'Post & edit jobs', 'View all applications', 'Analytics access'],
      color: 'text-red-700 bg-red-100'
    },
    {
      role: 'Recruiter',
      permissions: ['Post jobs', 'Manage applications', 'Interview scheduling', 'Candidate communication'],
      color: 'text-blue-700 bg-blue-100'
    },
    {
      role: 'Hiring Manager',
      permissions: ['View applications', 'Interview candidates', 'Make hiring decisions', 'Team collaboration'],
      color: 'text-green-700 bg-green-100'
    },
    {
      role: 'Viewer',
      permissions: ['View job postings', 'View applications', 'Basic reporting', 'Read-only access'],
      color: 'text-gray-700 bg-gray-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Instructions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            Give Colleagues Access to Employer Dashboard
          </CardTitle>
          <CardDescription>
            There are two ways to give your team members access to the employer dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method 1: Direct Invite */}
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Method 1: Direct Team Invitation</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Invite colleagues who are already on TalentXcel platform
                </p>
                <Button 
                  onClick={() => navigate('/employer/team')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Team & Send Invites
                </Button>
              </div>
            </div>
          </div>

          {/* Method 2: Share Link */}
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-2">Method 2: Share Access Request Link</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Share this link with colleagues who need to request access to your company
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={copyInviteLink}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Access Link
                  </Button>
                  <Button 
                    onClick={() => navigate('/employer/request-access')}
                    variant="outline"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    View Access Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Team Role Permissions
          </CardTitle>
          <CardDescription>
            Understanding what each role can do in your employer dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rolePermissions.map((role, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${role.color}`}>
                  {role.role}
                </div>
                <ul className="space-y-2">
                  {role.permissions.map((permission, permIndex) => (
                    <li key={permIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{permission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Start by inviting key team members as Admins or Recruiters. 
          You can always adjust their permissions later from the Team Management page.
        </AlertDescription>
      </Alert>
    </div>
  );
};