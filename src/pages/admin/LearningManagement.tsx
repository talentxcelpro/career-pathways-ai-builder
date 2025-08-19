import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { LearningDashboard } from '@/components/admin/learning/LearningDashboard';
import { CoursesManagement } from '@/components/admin/learning/CoursesManagement';
import { LearningPathsManagement } from '@/components/admin/learning/LearningPathsManagement';
import { MultimediaManagement } from '@/components/admin/learning/MultimediaManagement';
import { AssessmentsManagement } from '@/components/admin/learning/AssessmentsManagement';
import { EnrollmentManagement } from '@/components/admin/learning/EnrollmentManagement';
import { CommunityManagement } from '@/components/admin/learning/CommunityManagement';
import { LearningAnalytics } from '@/components/admin/learning/LearningAnalytics';
import { ContentModeration } from '@/components/admin/learning/ContentModeration';
import { LearningSettings } from '@/components/admin/learning/LearningSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Target, 
  Play, 
  FileCheck, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Shield,
  Settings,
  Home
} from 'lucide-react';

const LearningManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, component: LearningDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen, component: CoursesManagement },
    { id: 'paths', label: 'Learning Paths', icon: Target, component: LearningPathsManagement },
    { id: 'multimedia', label: 'Multimedia', icon: Play, component: MultimediaManagement },
    { id: 'assessments', label: 'Assessments', icon: FileCheck, component: AssessmentsManagement },
    { id: 'enrollments', label: 'Enrollments', icon: Users, component: EnrollmentManagement },
    { id: 'community', label: 'Community', icon: MessageSquare, component: CommunityManagement },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: LearningAnalytics },
    { id: 'moderation', label: 'Moderation', icon: Shield, component: ContentModeration },
    { id: 'settings', label: 'Settings', icon: Settings, component: LearningSettings }
  ];

  return (
    <UnifiedAdminLayout 
      title="Learning Hub Management" 
      description="Complete Coursera-style Learning Management System"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 text-xs px-3 py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                <Component />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default LearningManagement;