import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Download, Send, Eye, Users } from 'lucide-react';

export const CertificateGenerator: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [issuing, setIssuing] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-for-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: completedEnrollments } = useQuery({
    queryKey: ['completed-enrollments', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('course_id', selectedCourse)
        .eq('status', 'completed');
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourse
  });

  const { data: existingCertificates } = useQuery({
    queryKey: ['existing-certificates', selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      
      const { data, error } = await supabase
        .from('certificates')
        .select('user_id')
        .eq('course_id', selectedCourse);
      
      if (error) throw error;
      return data?.map(cert => cert.user_id) || [];
    },
    enabled: !!selectedCourse
  });

  const generateCertificateMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      // Generate unique certificate code
      const certificateCode = `TXL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_code: certificateCode,
          verified: true,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['existing-certificates'] });
    }
  });

  const handleBulkIssue = async () => {
    if (!selectedCourse || !completedEnrollments) {
      toast.error('Please select a course with completed enrollments');
      return;
    }

    setIssuing(true);
    let issuedCount = 0;
    const errors: string[] = [];

    try {
      // Filter out users who already have certificates
      const eligibleUsers = completedEnrollments.filter(
        enrollment => !existingCertificates?.includes(enrollment.user_id)
      );

      for (const enrollment of eligibleUsers) {
        try {
          await generateCertificateMutation.mutateAsync({
            userId: enrollment.user_id,
            courseId: selectedCourse
          });
          issuedCount++;
        } catch (error: any) {
          errors.push(`Failed for ${enrollment.profiles?.full_name || 'Unknown'}: ${error.message}`);
        }
      }

      if (issuedCount > 0) {
        toast.success(`Successfully issued ${issuedCount} certificates!`);
      }
      
      if (errors.length > 0) {
        toast.error(`${errors.length} certificates failed to issue`);
        console.error('Certificate generation errors:', errors);
      }

    } catch (error: any) {
      toast.error('Failed to issue certificates');
      console.error('Bulk certificate error:', error);
    } finally {
      setIssuing(false);
    }
  };

  const selectedCourseTitle = courses?.find(c => c.id === selectedCourse)?.title;
  const eligibleCount = completedEnrollments?.filter(
    enrollment => !existingCertificates?.includes(enrollment.user_id)
  ).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="course-select">Select Course</Label>
            <select
              id="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a course...</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {completedEnrollments?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed Students
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Award className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <div className="text-2xl font-bold">
                      {existingCertificates?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Certificates Issued
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <Send className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                      {eligibleCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ready to Issue
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedCourse && eligibleCount > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Ready to Issue Certificates</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {eligibleCount} students who completed "{selectedCourseTitle}" are eligible for certificates.
                </p>
                <Button 
                  onClick={handleBulkIssue}
                  disabled={issuing}
                  className="w-full"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {issuing ? 'Issuing Certificates...' : `Issue ${eligibleCount} Certificates`}
                </Button>
              </div>
            </div>
          )}

          {selectedCourse && eligibleCount === 0 && completedEnrollments && completedEnrollments.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm">
                ✅ All completed students for this course already have certificates!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCourse && completedEnrollments && completedEnrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedEnrollments.map((enrollment) => {
                const hasCertificate = existingCertificates?.includes(enrollment.user_id);
                return (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {enrollment.profiles?.full_name || 'Unknown Student'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {enrollment.profiles?.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed: {new Date(enrollment.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasCertificate ? "default" : "secondary"}>
                        {hasCertificate ? "Certificate Issued" : "Eligible"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};