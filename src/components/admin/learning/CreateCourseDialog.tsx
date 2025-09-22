import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedCourseBuilder } from './EnhancedCourseBuilder';
import { CourseTemplates } from './CourseTemplates';
import { useEnhancedLearningManagement } from '@/hooks/useEnhancedLearningManagement';
import { Rocket, Wand2 } from 'lucide-react';

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createCourse } = useEnhancedLearningManagement();
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setActiveTab('builder');
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      await createCourse.mutateAsync(courseData);
      onOpenChange(false);
      setSelectedTemplate(null);
      setActiveTab('templates');
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Create New Course
          </DialogTitle>
          <DialogDescription>
            Choose a template or start from scratch to create your course
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Course Builder
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
            <TabsContent value="templates" className="mt-6">
              <CourseTemplates onSelectTemplate={handleSelectTemplate} />
            </TabsContent>

            <TabsContent value="builder" className="mt-6">
              <EnhancedCourseBuilder
                onSave={handleSaveCourse}
                isLoading={createCourse.isPending}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};