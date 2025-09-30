import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { SecurityDashboard } from '@/components/admin/security/SecurityDashboard';
import { SecurityEventsTable } from '@/components/admin/security/SecurityEventsTable';
import { SecurityAlertsPanel } from '@/components/admin/security/SecurityAlertsPanel';
import { AccountSuspensionPanel } from '@/components/admin/security/AccountSuspensionPanel';
import { IPManagementPanel } from '@/components/admin/security/IPManagementPanel';
import { SessionManagementPanel } from '@/components/admin/security/SessionManagementPanel';
import { SecurityMonitoringDashboard } from '@/components/admin/security/SecurityMonitoringDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Ban, Monitor, Users, Globe, Activity, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SecurityCenter = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  return (
    <UnifiedAdminLayout 
      title="Security Center" 
      description="Comprehensive security management and monitoring"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div />
          <Button 
            onClick={() => navigate('/admin/phase1')}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Rocket className="w-4 h-4" />
            Phase 1 Dashboard
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="ip-management" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              IP Control
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="monitoring">
            <SecurityMonitoringDashboard />
          </TabsContent>

          <TabsContent value="events">
            <SecurityEventsTable />
          </TabsContent>

          <TabsContent value="alerts">
            <SecurityAlertsPanel />
          </TabsContent>

          <TabsContent value="accounts">
            <AccountSuspensionPanel />
          </TabsContent>

          <TabsContent value="ip-management">
            <IPManagementPanel />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionManagementPanel />
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default SecurityCenter;