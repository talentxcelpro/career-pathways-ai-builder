import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, TrendingUp, DollarSign, Search } from 'lucide-react';
import { useEnhancedLearningManagement } from '@/hooks/useEnhancedLearningManagement';
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BulkEnrollmentDialog } from './BulkEnrollmentDialog';

export const EnrollmentManagement: React.FC = () => {
  const { learningStats, isLoading } = useEnhancedLearningManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);

  // Fetch enrollment data
  const { data: enrollments } = useQuery({
    queryKey: ['course-enrollments', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(title, price),
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enrollment Management</h2>
          <p className="text-muted-foreground">Manage user enrollments and access control</p>
        </div>
        <Button onClick={() => setShowBulkDialog(true)}>
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
            <div className="text-2xl font-bold">{learningStats?.totalEnrollments || 0}</div>
            <p className="text-sm text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats?.completionRate || 0}%</div>
            <p className="text-sm text-muted-foreground">Course completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{learningStats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-sm text-muted-foreground">From enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <UserPlus className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>New This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStats?.weeklyEnrollments || 0}</div>
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
          <CardTitle>Enrollment Search</CardTitle>
          <CardDescription>Find and manage user enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments?.map((enrollment: any) => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{enrollment.profiles?.full_name || 'Unknown User'}</div>
                  <div className="text-sm text-muted-foreground">{enrollment.profiles?.email}</div>
                  <div className="text-sm font-medium mt-1">{enrollment.courses?.title}</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {enrollment.courses?.price ? `₹${enrollment.courses.price}` : 'Free'}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(enrollment.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                No enrollments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <BulkEnrollmentDialog 
        open={showBulkDialog} 
        onOpenChange={setShowBulkDialog} 
      />
    </div>
  );
};