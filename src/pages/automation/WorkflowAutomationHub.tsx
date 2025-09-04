import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Zap, Link, BarChart3, Activity } from 'lucide-react';
import AutomatedWorkflowBuilder from '@/components/automation/AutomatedWorkflowBuilder';
import IntegrationManagementSystem from '@/components/automation/IntegrationManagementSystem';
import AdvancedReportingDashboard from '@/components/reporting/AdvancedReportingDashboard';
import PerformanceMonitoringCenter from '@/components/monitoring/PerformanceMonitoringCenter';
import { updateMetaTags } from '@/utils/metaTags';

const WorkflowAutomationHub: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Workflow Automation Hub - TalentXcel | Enterprise Automation & Integration',
      description: 'Advanced workflow automation, integrations, reporting, and performance monitoring for enterprise-level career management and optimization.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Workflow Automation Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Enterprise-grade automation, integration, and monitoring solutions
              </p>
            </div>
          </div>

          {/* Feature Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Workflow Builder</h3>
                <p className="text-xs text-muted-foreground">Visual automation workflows</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Link className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Integrations</h3>
                <p className="text-xs text-muted-foreground">Connect all your career tools</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Advanced Reports</h3>
                <p className="text-xs text-muted-foreground">Deep analytics and insights</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Performance</h3>
                <p className="text-xs text-muted-foreground">Real-time monitoring</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Automation Tools Tabs */}
        <Tabs defaultValue="workflows" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden md:inline">Workflows</span>
              <span className="md:hidden">Flow</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden md:inline">Integrations</span>
              <span className="md:hidden">Connect</span>
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Reports</span>
              <span className="md:hidden">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden md:inline">Monitoring</span>
              <span className="md:hidden">Monitor</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflows" className="mt-6">
            <AutomatedWorkflowBuilder />
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-6">
            <IntegrationManagementSystem />
          </TabsContent>
          
          <TabsContent value="reporting" className="mt-6">
            <AdvancedReportingDashboard />
          </TabsContent>
          
          <TabsContent value="monitoring" className="mt-6">
            <PerformanceMonitoringCenter />
          </TabsContent>
        </Tabs>

        {/* Enterprise Features Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Enterprise Automation Suite
                </h3>
                <p className="text-muted-foreground">
                  Unlock advanced workflow automation, enterprise integrations, custom reporting, and dedicated performance monitoring.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowAutomationHub;