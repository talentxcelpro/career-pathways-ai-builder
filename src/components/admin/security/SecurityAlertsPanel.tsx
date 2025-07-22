import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SecurityAlertsPanel = () => {
  const { 
    securityAlerts, 
    alertsLoading, 
    acknowledgeAlert, 
    acknowledgingAlert,
    selectedAlert,
    setSelectedAlert
  } = useSecurityManagement();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white border-red-500';
      case 'high': return 'bg-orange-500 text-white border-orange-500';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-500';
      case 'low': return 'bg-blue-500 text-white border-blue-500';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return Eye;
      default: return AlertTriangle;
    }
  };

  if (alertsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unacknowledgedAlerts = securityAlerts?.filter(alert => !alert.is_acknowledged) || [];
  const acknowledgedAlerts = securityAlerts?.filter(alert => alert.is_acknowledged) || [];

  return (
    <div className="space-y-6">
      {/* Unacknowledged Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Pending Alerts ({unacknowledgedAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {unacknowledgedAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                No pending security alerts. All clear!
              </div>
            ) : (
              unacknowledgedAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                return (
                  <div 
                    key={alert.id} 
                    className={`border rounded-lg p-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <SeverityIcon className="w-5 h-5 text-red-500" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.description}
                          </p>
                          {alert.affected_user?.full_name && (
                            <p className="text-sm">
                              <span className="font-medium">Affected User:</span> {alert.affected_user.full_name} ({alert.affected_user.email})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </span>
                        <Button 
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          disabled={acknowledgingAlert}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                    
                    {alert.alert_data && Object.keys(alert.alert_data as object).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <details>
                          <summary className="text-sm font-medium cursor-pointer">View Details</summary>
                          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(alert.alert_data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recent Acknowledged Alerts ({acknowledgedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acknowledgedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Acknowledged
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.acknowledged_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};