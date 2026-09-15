import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phase2LaunchOptimizer } from './Phase2LaunchOptimizer';
import { ProductionMonitoringDashboard } from '@/components/monitoring/ProductionMonitoringDashboard';
import { FinalLaunchChecklist } from '@/components/deployment/FinalLaunchChecklist';
import { 
  Rocket, 
  Activity, 
  CheckSquare, 
  TrendingUp,
  Globe,
  Users
} from 'lucide-react';

export const ComprehensiveLaunchCenter: React.FC = () => {
  const [activePhase, setActivePhase] = useState<'optimizer' | 'monitoring' | 'checklist'>('optimizer');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            TalentXcel Launch Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Complete Phase 2 optimization, monitor production health, and run final launch verification.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant={activePhase === 'optimizer' ? 'default' : 'outline'}
              onClick={() => setActivePhase('optimizer')}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <div>
                <div className="font-semibold">Phase 2 Optimizer</div>
                <div className="text-xs opacity-80">Performance & optimization</div>
              </div>
            </Button>
            
            <Button
              variant={activePhase === 'monitoring' ? 'default' : 'outline'}
              onClick={() => setActivePhase('monitoring')}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <Activity className="w-6 h-6" />
              <div>
                <div className="font-semibold">System Monitoring</div>
                <div className="text-xs opacity-80">Health & performance metrics</div>
              </div>
            </Button>
            
            <Button
              variant={activePhase === 'checklist' ? 'default' : 'outline'}
              onClick={() => setActivePhase('checklist')}
              className="h-auto p-4 flex flex-col gap-2"
            >
              <CheckSquare className="w-6 h-6" />
              <div>
                <div className="font-semibold">Launch Checklist</div>
                <div className="text-xs opacity-80">Final verification</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="min-h-[600px]">
        {activePhase === 'optimizer' && <Phase2LaunchOptimizer />}
        {activePhase === 'monitoring' && <ProductionMonitoringDashboard />}
        {activePhase === 'checklist' && <FinalLaunchChecklist />}
      </div>

      {/* Quick Stats Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-sm text-muted-foreground">System Health</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">1.8s</div>
              <p className="text-sm text-muted-foreground">Load Time</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">850KB</div>
              <p className="text-sm text-muted-foreground">Bundle Size</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">0.1%</div>
              <p className="text-sm text-muted-foreground">Error Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};