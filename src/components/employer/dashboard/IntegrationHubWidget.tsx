
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cloud, Zap, AlertCircle, CheckCircle, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Integration {
  id: string;
  name: string;
  type: 'ats' | 'calendar' | 'communication' | 'analytics' | 'background_check';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  description: string;
  lastSync: string;
  isEnabled: boolean;
  connectionHealth: number;
}

export const IntegrationHubWidget = () => {
  const navigate = useNavigate();
  
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Google Calendar',
      type: 'calendar',
      status: 'connected',
      description: 'Sync interview schedules automatically',
      lastSync: '2 mins ago',
      isEnabled: true,
      connectionHealth: 98
    },
    {
      id: '2',
      name: 'Slack Workspace',
      type: 'communication',
      status: 'connected',
      description: 'Team notifications and updates',
      lastSync: '5 mins ago',
      isEnabled: true,
      connectionHealth: 95
    },
    {
      id: '3',
      name: 'LinkedIn Recruiter',
      type: 'ats',
      status: 'syncing',
      description: 'Import candidate profiles',
      lastSync: 'Syncing now',
      isEnabled: true,
      connectionHealth: 87
    },
    {
      id: '4',
      name: 'Background Check API',
      type: 'background_check',
      status: 'error',
      description: 'Automated background verification',
      lastSync: '2 hours ago',
      isEnabled: false,
      connectionHealth: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700 border-green-200';
      case 'syncing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'disconnected': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'syncing': return <Zap className="h-3 w-3 text-blue-600" />;
      case 'error': return <AlertCircle className="h-3 w-3 text-red-600" />;
      default: return <Cloud className="h-3 w-3 text-gray-600" />;
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const avgHealth = Math.round(integrations.reduce((acc, i) => acc + i.connectionHealth, 0) / integrations.length);

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Integration Hub</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                {connectedCount} connected • {avgHealth}% avg. health
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/integrations')}
          >
            Manage
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {integrations.map((integration) => (
          <div 
            key={integration.id}
            className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors"
          >
            <div className="p-1.5 bg-indigo-100 rounded-md">
              {getStatusIcon(integration.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{integration.name}</h4>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </Badge>
                  <Switch 
                    checked={integration.isEnabled} 
                    disabled={integration.status === 'error'}
                  />
                </div>
              </div>
              
              <p className="text-xs text-slate-600 mb-1">{integration.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Last sync: {integration.lastSync}</span>
                {integration.connectionHealth > 0 && (
                  <span className="text-xs text-slate-500">Health: {integration.connectionHealth}%</span>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/integrations')}
          >
            <span className="text-sm font-semibold text-indigo-700">Browse Integrations</span>
            <Settings className="h-3 w-3 text-indigo-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
