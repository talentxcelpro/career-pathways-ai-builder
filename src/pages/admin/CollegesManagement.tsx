import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { CollegesDashboard } from '@/components/admin/colleges/CollegesDashboard';
import { CollegesDirectory } from '@/components/admin/colleges/CollegesDirectory';
import { VerificationManagement } from '@/components/admin/colleges/VerificationManagement';
import { CollegeAnalytics } from '@/components/admin/colleges/CollegeAnalytics';
import { StudentInquiries } from '@/components/admin/colleges/StudentInquiries';
import { CollegeEvents } from '@/components/admin/colleges/CollegeEvents';
import { MonetizationSettings } from '@/components/admin/colleges/MonetizationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  School, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  Settings,
  Home
} from 'lucide-react';

const CollegesManagement = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, component: CollegesDashboard },
    { id: 'directory', label: 'Directory', icon: School, component: CollegesDirectory },
    { id: 'verification', label: 'Verification', icon: Shield, component: VerificationManagement },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: CollegeAnalytics },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare, component: StudentInquiries },
    { id: 'events', label: 'Events', icon: Calendar, component: CollegeEvents },
    { id: 'monetization', label: 'Monetization', icon: Settings, component: MonetizationSettings }
  ];

  return (
    <UnifiedAdminLayout 
      title="Colleges Management Hub" 
      description="India's Most Trusted Interactive College Directory & Analytics Platform"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">🎓 Premium Colleges Hub</h2>
              <p className="text-muted-foreground">
                Complete college directory with verification, analytics, student engagement, and monetization features
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Powered by</div>
              <div className="text-lg font-bold text-primary">TalentXcel Pro</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1">
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

export default CollegesManagement;