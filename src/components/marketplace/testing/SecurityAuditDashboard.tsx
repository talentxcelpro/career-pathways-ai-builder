import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Lock,
  Eye,
  FileText,
  Users,
  Server,
  Database,
  Globe,
  Key
} from "lucide-react";

interface SecurityIssue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'false-positive';
  detected_at: string;
  affected_components: string[];
}

interface ComplianceCheck {
  standard: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  requirements_met: number;
  total_requirements: number;
  last_audit: string;
}

export const SecurityAuditDashboard = () => {
  const [securityIssues] = useState<SecurityIssue[]>([
    {
      id: '1',
      title: 'SQL Injection Vulnerability',
      severity: 'critical',
      category: 'Code Security',
      description: 'Potential SQL injection in user search functionality.',
      status: 'in-progress',
      detected_at: '2024-01-15',
      affected_components: ['Search API', 'User Profiles']
    },
    {
      id: '2',
      title: 'Weak Password Policy',
      severity: 'medium',
      category: 'Authentication',
      description: 'Password requirements do not meet security standards.',
      status: 'open',
      detected_at: '2024-01-14',
      affected_components: ['User Registration', 'Password Reset']
    },
    {
      id: '3',
      title: 'Missing Rate Limiting',
      severity: 'high',
      category: 'API Security',
      description: 'API endpoints lack proper rate limiting controls.',
      status: 'resolved',
      detected_at: '2024-01-10',
      affected_components: ['Authentication API', 'Search API']
    }
  ]);

  const [complianceChecks] = useState<ComplianceCheck[]>([
    {
      standard: 'GDPR',
      status: 'compliant',
      score: 95,
      requirements_met: 19,
      total_requirements: 20,
      last_audit: '2024-01-01'
    },
    {
      standard: 'SOC 2',
      status: 'partial',
      score: 78,
      requirements_met: 12,
      total_requirements: 15,
      last_audit: '2024-01-01'
    },
    {
      standard: 'ISO 27001',
      status: 'non-compliant',
      score: 45,
      requirements_met: 25,
      total_requirements: 55,
      last_audit: '2023-12-15'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'false-positive': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-500';
      case 'partial': return 'text-yellow-500';
      case 'non-compliant': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const securityScore = 87;
  const criticalIssues = securityIssues.filter(issue => issue.severity === 'critical' && issue.status !== 'resolved').length;
  const openIssues = securityIssues.filter(issue => issue.status === 'open').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Audit Dashboard</h2>
          <p className="text-muted-foreground">Security monitoring and compliance management</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Run Security Scan
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Score</p>
                <p className="text-2xl font-bold text-green-500">{securityScore}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={securityScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-500">{criticalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-2xl font-bold text-yellow-500">{openIssues}</p>
              </div>
              <XCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Scan</p>
                <p className="text-sm font-medium">2 hours ago</p>
                <p className="text-xs text-muted-foreground">Automated</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vulnerabilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <div className="grid gap-4">
            {securityIssues.map((issue) => (
              <Card key={issue.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(issue.status)}
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                      </div>
                      <CardDescription>{issue.category} • Detected {issue.detected_at}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{issue.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Affected Components:</p>
                      <div className="flex gap-1">
                        {issue.affected_components.map((component, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {issue.status === 'open' && (
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                      )}
                      <Button size="sm">
                        View Details
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
            {complianceChecks.map((compliance, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {compliance.standard}
                      </CardTitle>
                      <CardDescription>
                        Last audit: {compliance.last_audit}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getComplianceColor(compliance.status)}`}>
                        {compliance.score}%
                      </div>
                      <Badge className={getComplianceColor(compliance.status)}>
                        {compliance.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Requirements Met</span>
                      <span>{compliance.requirements_met}/{compliance.total_requirements}</span>
                    </div>
                    <Progress value={(compliance.requirements_met / compliance.total_requirements) * 100} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      View Requirements
                    </Button>
                    <Button size="sm">
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Infrastructure Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Firewall Status</span>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SSL/TLS Certificates</span>
                  <Badge className="bg-green-500/10 text-green-500">Valid</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DDoS Protection</span>
                  <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WAF Rules</span>
                  <Badge className="bg-yellow-500/10 text-yellow-500">Needs Update</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Encryption</span>
                  <Badge className="bg-green-500/10 text-green-500">AES-256</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup Security</span>
                  <Badge className="bg-green-500/10 text-green-500">Encrypted</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Access Control</span>
                  <Badge className="bg-green-500/10 text-green-500">RBAC</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Masking</span>
                  <Badge className="bg-blue-500/10 text-blue-500">Configured</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Multi-Factor Auth</span>
                  <Badge className="bg-yellow-500/10 text-yellow-500">Optional</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Management</span>
                  <Badge className="bg-green-500/10 text-green-500">Secure</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password Policy</span>
                  <Badge className="bg-yellow-500/10 text-yellow-500">Weak</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Lockout</span>
                  <Badge className="bg-green-500/10 text-green-500">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Application Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Input Validation</span>
                  <Badge className="bg-green-500/10 text-green-500">Implemented</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CSRF Protection</span>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">XSS Prevention</span>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Security</span>
                  <Badge className="bg-yellow-500/10 text-yellow-500">Partial</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Reports</CardTitle>
                <CardDescription>Generate comprehensive security reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Vulnerability Assessment Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Posture Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Access Control Audit
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Lock className="h-4 w-4 mr-2" />
                  Compliance Status Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Audits</CardTitle>
                <CardDescription>Automated security assessments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Vulnerability Scan</h4>
                    <p className="text-sm text-muted-foreground">Next: Tomorrow 2:00 AM</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Monthly Compliance Check</h4>
                    <p className="text-sm text-muted-foreground">Next: Jan 30, 2024</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Quarterly Penetration Test</h4>
                    <p className="text-sm text-muted-foreground">Next: Mar 15, 2024</p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500">Scheduled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};