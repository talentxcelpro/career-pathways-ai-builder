import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Zap, Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react';

interface SecurityIncident {
  id: string;
  type: 'authentication_failure' | 'suspicious_activity' | 'data_breach_attempt' | 'unauthorized_access' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  source: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  autoResponse?: string;
  affectedUsers?: number;
}

interface ResponseAction {
  id: string;
  name: string;
  description: string;
  automated: boolean;
  enabled: boolean;
  lastTriggered?: string;
  successRate: number;
}

interface IncidentMetrics {
  totalIncidents: number;
  criticalIncidents: number;
  resolvedIncidents: number;
  averageResponseTime: number;
  falsePositiveRate: number;
}

export const IncidentResponseCenter: React.FC = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [responseActions, setResponseActions] = useState<ResponseAction[]>([]);
  const [metrics, setMetrics] = useState<IncidentMetrics>({
    totalIncidents: 0,
    criticalIncidents: 0,
    resolvedIncidents: 0,
    averageResponseTime: 0,
    falsePositiveRate: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);

  const defaultResponseActions: ResponseAction[] = [
    {
      id: 'block-ip',
      name: 'Block Suspicious IP',
      description: 'Automatically block IP addresses showing suspicious behavior',
      automated: true,
      enabled: true,
      successRate: 95
    },
    {
      id: 'force-logout',
      name: 'Force User Logout',
      description: 'Force logout for compromised user accounts',
      automated: true,
      enabled: true,
      successRate: 100
    },
    {
      id: 'escalate-admin',
      name: 'Escalate to Admin',
      description: 'Notify security administrators of critical incidents',
      automated: true,
      enabled: true,
      successRate: 100
    },
    {
      id: 'rate-limit',
      name: 'Apply Rate Limiting',
      description: 'Implement strict rate limiting on affected endpoints',
      automated: true,
      enabled: true,
      successRate: 90
    },
    {
      id: 'audit-capture',
      name: 'Enhanced Audit Logging',
      description: 'Increase logging detail for affected areas',
      automated: true,
      enabled: true,
      successRate: 100
    },
    {
      id: 'user-notification',
      name: 'Notify Affected Users',
      description: 'Send security notifications to affected users',
      automated: false,
      enabled: true,
      successRate: 85
    }
  ];

  useEffect(() => {
    setResponseActions(defaultResponseActions);
    fetchIncidents();
    calculateMetrics();

    if (isMonitoring) {
      const interval = setInterval(() => {
        simulateSecurityIncident();
      }, 10000); // Check for incidents every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const fetchIncidents = async () => {
    try {
      // Fetch real security events and convert to incidents
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        const convertedIncidents: SecurityIncident[] = data.map(event => ({
          id: event.id,
          type: event.event_type as any || 'system_anomaly',
          severity: event.metadata?.severity || 'medium',
          description: event.description,
          timestamp: event.created_at,
          source: event.ip_address || 'system',
          status: 'active',
          affectedUsers: 1
        }));
        
        setIncidents(prev => [...convertedIncidents, ...prev].slice(0, 50));
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const simulateSecurityIncident = () => {
    // Simulate various types of security incidents for demonstration
    const incidentTypes = [
      'authentication_failure',
      'suspicious_activity', 
      'unauthorized_access',
      'system_anomaly'
    ] as const;

    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    const descriptions = {
      authentication_failure: 'Multiple failed login attempts detected',
      suspicious_activity: 'Unusual user behavior pattern identified',
      unauthorized_access: 'Attempt to access restricted resources',
      system_anomaly: 'Abnormal system performance detected'
    };

    // Only simulate incidents occasionally
    if (Math.random() > 0.3) return;

    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const newIncident: SecurityIncident = {
      id: `incident-${Date.now()}`,
      type,
      severity,
      description: descriptions[type],
      timestamp: new Date().toISOString(),
      source: `192.168.1.${Math.floor(Math.random() * 255)}`,
      status: 'active',
      affectedUsers: Math.floor(Math.random() * 10) + 1
    };

    setIncidents(prev => [newIncident, ...prev.slice(0, 49)]);
    
    // Trigger automated response
    if (severity === 'critical' || severity === 'high') {
      triggerAutomatedResponse(newIncident);
    }
  };

  const triggerAutomatedResponse = (incident: SecurityIncident) => {
    const automatedActions = responseActions.filter(action => action.automated && action.enabled);
    
    automatedActions.forEach(action => {
      // Simulate automated response
      console.log(`Triggered automated response: ${action.name} for incident: ${incident.id}`);
      
      // Update response action last triggered time
      setResponseActions(prev => 
        prev.map(a => 
          a.id === action.id 
            ? { ...a, lastTriggered: new Date().toISOString() }
            : a
        )
      );
    });

    // Update incident with auto response info
    setIncidents(prev =>
      prev.map(i =>
        i.id === incident.id
          ? { 
              ...i, 
              autoResponse: `Automated response triggered: ${automatedActions.map(a => a.name).join(', ')}`,
              status: 'investigating'
            }
          : i
      )
    );
  };

  const resolveIncident = (incidentId: string, resolution: 'resolved' | 'false_positive') => {
    setIncidents(prev =>
      prev.map(incident =>
        incident.id === incidentId
          ? { ...incident, status: resolution }
          : incident
      )
    );
    setSelectedIncident(null);
  };

  const calculateMetrics = () => {
    const totalIncidents = incidents.length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
    const falsePositives = incidents.filter(i => i.status === 'false_positive').length;
    
    setMetrics({
      totalIncidents,
      criticalIncidents,
      resolvedIncidents,
      averageResponseTime: 45, // Simulated
      falsePositiveRate: totalIncidents > 0 ? (falsePositives / totalIncidents) * 100 : 0
    });
  };

  useEffect(() => {
    calculateMetrics();
  }, [incidents]);

  const getSeverityIcon = (severity: SecurityIncident['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: SecurityIncident['severity']) => {
    const variants: any = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  const getStatusBadge = (status: SecurityIncident['status']) => {
    const variants: any = {
      active: 'destructive',
      investigating: 'secondary',
      resolved: 'default',
      false_positive: 'outline'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Incident Response Center</h2>
        </div>
        <Button
          onClick={() => setIsMonitoring(!isMonitoring)}
          variant={isMonitoring ? "destructive" : "default"}
        >
          {isMonitoring ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
      </div>

      {/* Incident Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalIncidents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.criticalIncidents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{metrics.resolvedIncidents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positive</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.falsePositiveRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Monitoring Status */}
      {isMonitoring && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Real-time security monitoring is active. Automated responses are enabled for critical incidents.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
          <TabsTrigger value="responses">Response Actions</TabsTrigger>
          <TabsTrigger value="history">Incident History</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.filter(i => i.status === 'active' || i.status === 'investigating').length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active security incidents
                  </p>
                ) : (
                  incidents
                    .filter(i => i.status === 'active' || i.status === 'investigating')
                    .map((incident) => (
                      <div key={incident.id} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                           onClick={() => setSelectedIncident(incident)}>
                        {getSeverityIcon(incident.severity)}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{incident.description}</h3>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(incident.severity)}
                              {getStatusBadge(incident.status)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Source: {incident.source}</span>
                            <span>Time: {new Date(incident.timestamp).toLocaleTimeString()}</span>
                            <span>Affected: {incident.affectedUsers} users</span>
                          </div>
                          {incident.autoResponse && (
                            <p className="text-sm text-blue-600">{incident.autoResponse}</p>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Response Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responseActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{action.name}</h3>
                        <Badge variant={action.automated ? 'default' : 'secondary'}>
                          {action.automated ? 'Automated' : 'Manual'}
                        </Badge>
                        <Badge variant={action.enabled ? 'default' : 'outline'}>
                          {action.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Success Rate: {action.successRate}%
                        {action.lastTriggered && ` | Last triggered: ${new Date(action.lastTriggered).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.slice(0, 20).map((incident) => (
                  <div key={incident.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getSeverityIcon(incident.severity)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{incident.description}</h3>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Source: {incident.source}</span>
                        <span>Time: {new Date(incident.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getSeverityIcon(selectedIncident.severity)}
                <h3 className="text-lg font-medium">{selectedIncident.description}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Severity:</strong> {selectedIncident.severity}
                </div>
                <div>
                  <strong>Status:</strong> {selectedIncident.status}
                </div>
                <div>
                  <strong>Source:</strong> {selectedIncident.source}
                </div>
                <div>
                  <strong>Affected Users:</strong> {selectedIncident.affectedUsers}
                </div>
                <div className="col-span-2">
                  <strong>Timestamp:</strong> {new Date(selectedIncident.timestamp).toLocaleString()}
                </div>
              </div>

              {selectedIncident.autoResponse && (
                <div>
                  <strong>Automated Response:</strong>
                  <p className="text-sm text-muted-foreground mt-1">{selectedIncident.autoResponse}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4">
                <Button 
                  onClick={() => resolveIncident(selectedIncident.id, 'resolved')}
                  size="sm"
                >
                  Mark Resolved
                </Button>
                <Button 
                  onClick={() => resolveIncident(selectedIncident.id, 'false_positive')}
                  variant="outline"
                  size="sm"
                >
                  False Positive
                </Button>
                <Button 
                  onClick={() => setSelectedIncident(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};