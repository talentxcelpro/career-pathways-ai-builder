import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { AlertTriangle, CheckCircle, Shield, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500 text-white';
    case 'high':
      return 'bg-orange-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-blue-500 text-white';
    case 'info':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return AlertTriangle;
    case 'medium':
      return Clock;
    case 'low':
    case 'info':
      return Shield;
    default:
      return AlertTriangle;
  }
};

export const SecurityAlertsPanel = () => {
  const { securityAlerts, alertsLoading, acknowledgeAlert } = useSecurityManagement();

  if (alertsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filter unacknowledged alerts
  const unacknowledgedAlerts = securityAlerts?.filter((alert: any) => !alert.is_acknowledged) || [];
  const acknowledgedAlerts = securityAlerts?.filter((alert: any) => alert.is_acknowledged).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Unacknowledged Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Pending Security Alerts ({unacknowledgedAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unacknowledgedAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
              No pending security alerts. System is secure.
            </div>
          ) : (
            <div className="space-y-4">
              {unacknowledgedAlerts.map((alert: any) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                
                return (
                  <div key={alert.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <SeverityIcon className="w-4 h-4" />
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        {typeof alert.profiles === 'object' && alert.profiles && 'full_name' in alert.profiles && (
                          <p className="text-sm">
                            <span className="font-medium">Affected User:</span> {(alert.profiles as any).full_name} {(alert.profiles as any).email && `(${(alert.profiles as any).email})`}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="ml-4"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Acknowledged Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recently Acknowledged Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {acknowledgedAlerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No recently acknowledged alerts.
            </p>
          ) : (
            <div className="space-y-3">
              {acknowledgedAlerts.map((alert: any) => (
                <div key={alert.id} className="border rounded-lg p-3 bg-green-50 dark:bg-green-950 opacity-75">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acknowledged {formatDistanceToNow(new Date(alert.acknowledged_at || alert.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};