
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle } from 'lucide-react';

interface UserStatsCardsProps {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    employers: number;
    candidates: number;
  } | undefined;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ userStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.totalUsers?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.activeUsers?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Employers</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.employers?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Job Seekers</p>
              <p className="text-2xl font-bold text-gray-900">{userStats?.candidates?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
