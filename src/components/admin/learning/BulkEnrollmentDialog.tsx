import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEnhancedLearningManagement } from '@/hooks/useEnhancedLearningManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkEnrollmentDialog: React.FC<BulkEnrollmentDialogProps> = ({ open, onOpenChange }) => {
  const { courses } = useEnhancedLearningManagement();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [userEmails, setUserEmails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkEnroll = async () => {
    if (!selectedCourse || !userEmails.trim()) {
      toast.error('Please select a course and enter user emails');
      return;
    }

    setIsProcessing(true);

    try {
      const emails = userEmails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      if (emails.length === 0) {
        toast.error('No valid email addresses found');
        return;
      }

      // Get user IDs from emails
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('email', emails);

      if (usersError) throw usersError;

      const userIds = users?.map(user => user.id) || [];
      const foundEmails = users?.map(user => user.email) || [];
      const notFoundEmails = emails.filter(email => !foundEmails.includes(email));

      if (userIds.length === 0) {
        toast.error('No registered users found with the provided emails');
        return;
      }

      // Create enrollments
      const enrollments = userIds.map(userId => ({
        course_id: selectedCourse,
        user_id: userId,
        enrolled_at: new Date().toISOString(),
        status: 'active'
      }));

      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert(enrollments);

      if (enrollError) throw enrollError;

      toast.success(`Successfully enrolled ${userIds.length} users`);
      
      if (notFoundEmails.length > 0) {
        toast.warning(`${notFoundEmails.length} emails not found: ${notFoundEmails.join(', ')}`);
      }

      onOpenChange(false);
      setSelectedCourse('');
      setUserEmails('');

    } catch (error: any) {
      toast.error(error.message || 'Failed to process bulk enrollment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Enrollment</DialogTitle>
          <DialogDescription>
            Enroll multiple users into a course by providing their email addresses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="course">Select Course</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="emails">User Email Addresses</Label>
            <Textarea
              id="emails"
              value={userEmails}
              onChange={(e) => setUserEmails(e.target.value)}
              placeholder="Enter email addresses, one per line&#10;user1@example.com&#10;user2@example.com"
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter one email address per line. Only registered users will be enrolled.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleBulkEnroll} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Enroll Users'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};