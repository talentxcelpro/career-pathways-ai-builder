import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, TrendingUp, DollarSign } from 'lucide-react';

export const EnrollmentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enrollment Management</h2>
          <p className="text-muted-foreground">Manage user enrollments and access control</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Bulk Enroll
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-sm text-muted-foreground">Course completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-sm text-muted-foreground">From enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <UserPlus className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>New This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Recent enrollments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Tools</CardTitle>
          <CardDescription>Manage user access and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col">
              <UserPlus className="h-6 w-6 mb-2" />
              Bulk Enroll Users
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              Payment Management
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Progress Tracking
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent enrollments
          </div>
        </CardContent>
      </Card>
    </div>
  );
};