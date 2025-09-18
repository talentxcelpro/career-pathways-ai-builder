import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  Database,
  Network,
  FileText,
  Settings,
  Activity,
  Zap,
  Mail
} from "lucide-react";

interface SecurityMetrics {
  totalEmails: number;
  blockedThreats: number;
  securityScore: number;
  complianceScore: number;
  encryptionRate: number;
  vulnerabilities: number;
}

interface SecurityAlert {
  id: string;
  type: 'spam_detection' | 'phishing_attempt' | 'data_breach' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  affected_emails: number;
  remediation_steps: string[];
}

interface ComplianceCheck {
  id: string;
  regulation: 'GDPR' | 'CAN_SPAM' | 'CCPA' | 'SOX' | 'HIPAA';
  status: 'compliant' | 'warning' | 'violation';
  last_check: string;
  issues: string[];
  requirements_met: number;
  total_requirements: number;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  risk_level: 'low' | 'medium' | 'high';
  details: any;
}

export const EnterpriseSecurityCenter = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEmails: 0,
    blockedThreats: 0,
    securityScore: 0,
    complianceScore: 0,
    encryptionRate: 0,
    vulnerabilities: 0
  });
  
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityMetrics();
    loadSecurityAlerts();
    loadComplianceChecks();
    loadAuditLogs();
    
    // Set up real-time security monitoring
    const interval = setInterval(() => {
      loadSecurityMetrics();
      loadSecurityAlerts();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      // Mock security metrics
      const mockMetrics: SecurityMetrics = {
        totalEmails: 125649,
        blockedThreats: 1847,
        securityScore: 92.5,
        complianceScore: 98.2,
        encryptionRate: 100,
        vulnerabilities: 2
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading security metrics:', error);
    }
    setLoading(false);
  };

  const loadSecurityAlerts = async () => {
    try {
      // Mock security alerts
      const mockAlerts: SecurityAlert[] = [
        {
          id: '1',
          type: 'suspicious_activity',
          severity: 'high',
          title: 'Unusual Login Pattern Detected',
          description: 'Multiple failed login attempts from different geographic locations',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'investigating',
          affected_emails: 0,
          remediation_steps: [
            'Review login logs',
            'Implement IP restrictions',
            'Enable 2FA for affected accounts'
          ]
        },
        {
          id: '2',
          type: 'spam_detection',
          severity: 'medium',
          title: 'Potential Spam Campaign Blocked',
          description: 'Email campaign flagged by spam detection algorithms',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'resolved',
          affected_emails: 2500,
          remediation_steps: [
            'Review email content',
            'Update sender reputation',
            'Modify subject lines'
          ]
        },
        {
          id: '3',
          type: 'phishing_attempt',
          severity: 'critical',
          title: 'Phishing Email Intercepted',
          description: 'Malicious email attempting to steal user credentials',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'resolved',
          affected_emails: 1,
          remediation_steps: [
            'Block sender domain',
            'Update security filters',
            'Notify affected users'
          ]
        }
      ];
      
      setSecurityAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading security alerts:', error);
    }
  };

  const loadComplianceChecks = async () => {
    try {
      // Mock compliance data
      const mockCompliance: ComplianceCheck[] = [
        {
          id: '1',
          regulation: 'GDPR',
          status: 'compliant',
          last_check: new Date(Date.now() - 86400000).toISOString(),
          issues: [],
          requirements_met: 28,
          total_requirements: 28
        },
        {
          id: '2',
          regulation: 'CAN_SPAM',
          status: 'warning',
          last_check: new Date(Date.now() - 86400000).toISOString(),
          issues: ['Missing physical address in 2% of emails'],
          requirements_met: 7,
          total_requirements: 8
        },
        {
          id: '3',
          regulation: 'CCPA',
          status: 'compliant',
          last_check: new Date(Date.now() - 86400000).toISOString(),
          issues: [],
          requirements_met: 15,
          total_requirements: 15
        },
        {
          id: '4',
          regulation: 'HIPAA',
          status: 'violation',
          last_check: new Date(Date.now() - 86400000).toISOString(),
          issues: [
            'Encryption not enabled for PHI data',
            'Missing business associate agreements'
          ],
          requirements_met: 12,
          total_requirements: 16
        }
      ];
      
      setComplianceChecks(mockCompliance);
    } catch (error) {
      console.error('Error loading compliance checks:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      // Mock audit logs
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          user_id: 'admin_123',
          action: 'email_template_modified',
          resource: 'welcome_email_template',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          risk_level: 'low',
          details: { template_id: 'tpl_123', changes: ['subject', 'content'] }
        },
        {
          id: '2',
          user_id: 'admin_456',
          action: 'bulk_email_sent',
          resource: 'marketing_campaign',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0...',
          risk_level: 'medium',
          details: { campaign_id: 'camp_456', recipients: 5000 }
        },
        {
          id: '3',
          user_id: 'admin_789',
          action: 'security_settings_changed',
          resource: 'encryption_config',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0...',
          risk_level: 'high',
          details: { setting: 'encryption_level', old_value: 'AES128', new_value: 'AES256' }
        }
      ];
      
      setAuditLogs(mockLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const runSecurityScan = async () => {
    try {
      toast({
        title: "Security Scan Started",
        description: "Running comprehensive security analysis...",
      });

      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 3000));

      setMetrics(prev => ({
        ...prev,
        securityScore: prev.securityScore + 2.5,
        vulnerabilities: Math.max(0, prev.vulnerabilities - 1)
      }));

      toast({
        title: "Security Scan Complete",
        description: "No new vulnerabilities detected. Security score improved.",
      });
    } catch (error) {
      console.error('Error running security scan:', error);
      toast({
        title: "Scan Failed",
        description: "Security scan encountered an error.",
        variant: "destructive"
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      setSecurityAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' }
          : alert
      ));

      toast({
        title: "Alert Resolved",
        description: "Security alert has been marked as resolved.",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      spam_detection: Mail,
      phishing_attempt: Shield,
      data_breach: Database,
      suspicious_activity: Eye
    };
    
    const IconComponent = icons[type as keyof typeof icons] || AlertTriangle;
    return <IconComponent className="h-4 w-4" />;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive'
    } as const;
    
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'secondary'}>
        <span className={colors[severity as keyof typeof colors]}>
          {severity.toUpperCase()}
        </span>
      </Badge>
    );
  };

  const getComplianceStatus = (status: string) => {
    const icons = {
      compliant: CheckCircle,
      warning: AlertTriangle,
      violation: Shield
    };
    
    const colors = {
      compliant: 'text-green-600',
      warning: 'text-yellow-600',
      violation: 'text-red-600'
    };
    
    const IconComponent = icons[status as keyof typeof icons] || AlertTriangle;
    const colorClass = colors[status as keyof typeof colors];
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <IconComponent className="h-4 w-4" />
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  const getRiskLevelBadge = (level: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[level as keyof typeof variants] || 'secondary'}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading security center...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Enterprise Security Center
          </h2>
          <p className="text-muted-foreground">
            Advanced security monitoring, compliance tracking, and threat protection
          </p>
        </div>
        <Button onClick={runSecurityScan} className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Run Security Scan
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.securityScore}%</div>
            <Progress value={metrics.securityScore} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.complianceScore}%</div>
            <Progress value={metrics.complianceScore} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.blockedThreats}</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Encryption Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.encryptionRate}%</div>
            <div className="text-xs text-muted-foreground">All emails encrypted</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.vulnerabilities}</div>
            <div className="text-xs text-muted-foreground">Require attention</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Emails Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmails.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total this month</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                          <Badge variant={alert.status === 'resolved' ? 'default' : 'secondary'}>
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {alert.description}
                        </p>
                        <div className="text-xs text-muted-foreground mb-2">
                          {new Date(alert.timestamp).toLocaleString()} • 
                          {alert.affected_emails > 0 && ` ${alert.affected_emails} emails affected`}
                        </div>
                        {alert.remediation_steps.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-1">Remediation Steps:</div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {alert.remediation_steps.map((step, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {alert.status !== 'resolved' && (
                        <Button 
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4">
            {complianceChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{check.regulation}</h3>
                      {getComplianceStatus(check.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last checked: {new Date(check.last_check).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Requirements Met</span>
                      <span>{check.requirements_met}/{check.total_requirements}</span>
                    </div>
                    <Progress 
                      value={(check.requirements_met / check.total_requirements) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  {check.issues.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2 text-orange-600">
                        Issues Requiring Attention:
                      </div>
                      <ul className="text-sm space-y-1">
                        {check.issues.map((issue, index) => (
                          <li key={index} className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{log.action.replace('_', ' ')}</h4>
                        <p className="text-sm text-muted-foreground">
                          User: {log.user_id} • Resource: {log.resource}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()} • IP: {log.ip_address}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRiskLevelBadge(log.risk_level)}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Encryption Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Email Encryption</span>
                    <Badge variant="default">AES-256</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database Encryption</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transit Encryption</span>
                    <Badge variant="default">TLS 1.3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Access Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Two-Factor Auth</span>
                    <Badge variant="default">Required</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Session Timeout</span>
                    <Badge variant="secondary">8 hours</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">IP Restrictions</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};