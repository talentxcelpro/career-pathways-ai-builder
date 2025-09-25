import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Upload, UserPlus, AlertCircle, CheckCircle, X } from 'lucide-react';

interface BulkEnrollmentResult {
  successful: number;
  failed: number;
  errors: string[];
  duplicates: number;
}

export const BulkEnrollmentTool: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [emailList, setEmailList] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkEnrollmentResult | null>(null);
  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ['admin-courses-for-enrollment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, enrolled_count')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const enrollUsersMutation = useMutation({
    mutationFn: async ({ emails, courseId }: { emails: string[]; courseId: string }) => {
      const results: BulkEnrollmentResult = {
        successful: 0,
        failed: 0,
        errors: [],
        duplicates: 0
      };

      const totalEmails = emails.length;
      let processed = 0;

      for (const email of emails) {
        try {
          // Find user by email
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('email', email.trim())
            .single();

          if (profileError || !profile) {
            results.errors.push(`User not found: ${email}`);
            results.failed++;
            processed++;
            setProgress((processed / totalEmails) * 100);
            continue;
          }

          // Check if already enrolled
          const { data: existingEnrollment } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', profile.id)
            .eq('course_id', courseId)
            .single();

          if (existingEnrollment) {
            results.duplicates++;
            processed++;
            setProgress((processed / totalEmails) * 100);
            continue;
          }

          // Create enrollment
          const { error: enrollError } = await supabase
            .from('course_enrollments')
            .insert({
              user_id: profile.id,
              course_id: courseId,
              status: 'enrolled',
              enrolled_at: new Date().toISOString()
            });

          if (enrollError) {
            results.errors.push(`Failed to enroll ${email}: ${enrollError.message}`);
            results.failed++;
          } else {
            results.successful++;
          }

        } catch (error: any) {
          results.errors.push(`Error processing ${email}: ${error.message}`);
          results.failed++;
        }

        processed++;
        setProgress((processed / totalEmails) * 100);
      }

      return results;
    },
    onSuccess: (results) => {
      setResults(results);
      queryClient.invalidateQueries({ queryKey: ['admin-courses-for-enrollment'] });
      
      if (results.successful > 0) {
        toast.success(`Successfully enrolled ${results.successful} students!`);
      }
      if (results.failed > 0) {
        toast.error(`${results.failed} enrollments failed`);
      }
      if (results.duplicates > 0) {
        toast.info(`${results.duplicates} students were already enrolled`);
      }
    },
    onError: (error: any) => {
      toast.error('Bulk enrollment failed');
      console.error('Bulk enrollment error:', error);
    }
  });

  const handleBulkEnroll = async () => {
    if (!selectedCourse || !emailList.trim()) {
      toast.error('Please select a course and provide email addresses');
      return;
    }

    // Parse email list
    const emails = emailList
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      toast.error('No valid email addresses found');
      return;
    }

    setEnrolling(true);
    setProgress(0);
    setResults(null);

    try {
      await enrollUsersMutation.mutateAsync({
        emails,
        courseId: selectedCourse
      });
    } finally {
      setEnrolling(false);
      setProgress(0);
    }
  };

  const selectedCourseData = courses?.find(c => c.id === selectedCourse);
  const emailCount = emailList
    .split(/[\n,;]/)
    .map(email => email.trim())
    .filter(email => email && email.includes('@')).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Enrollment Tool
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
              disabled={enrolling}
            >
              <option value="">Select a course...</option>
              {courses?.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.enrolled_count || 0} enrolled)
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="email-list">Student Email Addresses</Label>
            <Textarea
              id="email-list"
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              placeholder="Enter email addresses separated by commas, semicolons, or new lines:&#10;student1@example.com&#10;student2@example.com&#10;student3@example.com"
              rows={8}
              disabled={enrolling}
            />
            {emailCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Found {emailCount} valid email addresses
              </p>
            )}
          </div>

          {enrolling && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing enrollments...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={handleBulkEnroll}
            disabled={!selectedCourse || !emailList.trim() || enrolling}
            className="w-full"
            size="lg"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {enrolling ? 'Enrolling Students...' : `Enroll ${emailCount} Students`}
          </Button>
        </CardContent>
      </Card>

      {selectedCourse && selectedCourseData && (
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Course:</span>
                <span>{selectedCourseData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Currently Enrolled:</span>
                <Badge variant="outline">{selectedCourseData.enrolled_count || 0} students</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">To be Added:</span>
                <Badge variant="secondary">{emailCount} students</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Enrollment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.successful}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {results.duplicates}
                </div>
                <div className="text-sm text-muted-foreground">Already Enrolled</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Enrollment Errors
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setResults(null);
                setEmailList('');
              }}
              variant="outline"
              className="w-full mt-4"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};