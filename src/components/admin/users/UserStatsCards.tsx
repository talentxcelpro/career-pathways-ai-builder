
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Shield, Mail, MailCheck } from 'lucide-react';

interface UserStatsCardsProps {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    employers: number;
    jobSeekers: number;
    candidates: number;
    admins: number;
  } | undefined;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ userStats }) => {
  return (
    <div className="space-y-6">
      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-primary" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{userStats?.totalUsers?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Active</p>
                <p className="text-xl font-bold text-green-700">{userStats?.activeUsers?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-orange-500" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Inactive</p>
                <p className="text-xl font-bold text-orange-600">{userStats?.inactiveUsers?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MailCheck className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Verified</p>
                <p className="text-xl font-bold text-blue-700">{userStats?.verifiedUsers?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Employers</p>
                <p className="text-xl font-bold text-purple-700">{userStats?.employers?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Job Seekers</p>
                <p className="text-xl font-bold text-orange-700">{userStats?.jobSeekers?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-teal-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Candidates</p>
                <p className="text-xl font-bold text-teal-700">{userStats?.candidates?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-muted-foreground">Admins</p>
                <p className="text-xl font-bold text-red-700">{userStats?.admins?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
