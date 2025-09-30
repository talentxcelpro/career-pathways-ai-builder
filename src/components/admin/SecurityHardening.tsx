import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Clock, Lock, Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'data' | 'access' | 'encryption' | 'monitoring';
  status: 'open' | 'fixing' | 'fixed' | 'ignored';
  progress: number;
  impact: string;
  solution: string;
}

export const SecurityHardening: React.FC = () => {
  const [issues, setIssues] = useState<SecurityIssue[]>([
    {
      id: 'public-emails',
      title: 'Public Email Exposure',
      description: 'Email addresses are publicly accessible in profiles table',
      severity: 'critical',
      category: 'data',
      status: 'open',
      progress: 0,
      impact: 'Data privacy violation, potential GDPR issues',
      solution: 'Restrict email visibility in RLS policies'
    },
    {
      id: 'college-contacts',
      title: 'Public College Contact Info',
      description: 'College contact information exposed without authentication',
      severity: 'high',
      category: 'data',
      status: 'open',
      progress: 0,
      impact: 'Unauthorized access to sensitive contact data',
      solution: 'Add authentication requirement for colleges table'
    },
    {
      id: 'leaked-passwords',
      title: 'Leaked Password Protection Disabled',
      description: 'Supabase leaked password protection is not enabled',
      severity: 'high',
      category: 'access',
      status: 'open',
      progress: 0,
      impact: 'Users can use compromised passwords',
      solution: 'Enable leaked password protection in Auth settings'
    },
    {
      id: 'rate-limiting',
      title: 'Missing API Rate Limiting',
      description: 'No rate limiting on API endpoints',
      severity: 'medium',
      category: 'access',
      status: 'open',
      progress: 0,
      impact: 'Potential for abuse and DDoS attacks',
      solution: 'Implement rate limiting middleware'
    },
    {
      id: 'audit-logging',
      title: 'Incomplete Audit Logging',
      description: 'Not all sensitive operations are logged',
      severity: 'medium',
      category: 'monitoring',
      status: 'open',
      progress: 0,
      impact: 'Difficulty tracking security incidents',
      solution: 'Enhance audit logging for all admin actions'
    },
    {
      id: 'mfa',
      title: 'Multi-Factor Authentication',
      description: 'MFA not enforced for admin accounts',
      severity: 'high',
      category: 'access',
      status: 'open',
      progress: 0,
      impact: 'Higher risk of account compromise',
      solution: 'Implement MFA requirement for admin users'
    }
  ]);

  const [running, setRunning] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    calculateSecurityScore();
  }, [issues]);

  const calculateSecurityScore = () => {
    const totalIssues = issues.length;
    const fixedIssues = issues.filter(i => i.status === 'fixed').length;
    const criticalOpen = issues.filter(i => i.severity === 'critical' && i.status !== 'fixed').length;
    const highOpen = issues.filter(i => i.severity === 'high' && i.status !== 'fixed').length;
    
    let score = (fixedIssues / totalIssues) * 100;
    score -= criticalOpen * 20; // Critical issues heavily impact score
    score -= highOpen * 10; // High issues moderately impact score
    
    setSecurityScore(Math.max(0, Math.min(100, score)));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data': return <Eye className="h-4 w-4" />;
      case 'access': return <Lock className="h-4 w-4" />;
      case 'encryption': return <Shield className="h-4 w-4" />;
      case 'monitoring': return <Users className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const fixIssue = async (issueId: string) => {
    setRunning(true);
    
    const issueIndex = issues.findIndex(i => i.id === issueId);
    if (issueIndex === -1) return;

    const updatedIssues = [...issues];
    updatedIssues[issueIndex] = { ...updatedIssues[issueIndex], status: 'fixing', progress: 0 };
    setIssues(updatedIssues);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 25) {
        await new Promise(resolve => setTimeout(resolve, 300));
        updatedIssues[issueIndex] = { ...updatedIssues[issueIndex], progress: i };
        setIssues([...updatedIssues]);
      }

      // Call security hardening function
      await supabase.functions.invoke('system-optimizer', {
        body: { action: 'security_hardening', issue: issueId }
      });

      updatedIssues[issueIndex] = { ...updatedIssues[issueIndex], status: 'fixed', progress: 100 };
      setIssues([...updatedIssues]);

    } catch (error) {
      console.error('Security fix failed:', error);
      updatedIssues[issueIndex] = { ...updatedIssues[issueIndex], status: 'open', progress: 0 };
      setIssues([...updatedIssues]);
    } finally {
      setRunning(false);
    }
  };

  const fixAllIssues = async () => {
    for (const issue of issues.filter(i => i.status === 'open')) {
      await fixIssue(issue.id);
    }
  };

  const criticalIssues = issues.filter(i => i.severity === 'critical' && i.status !== 'fixed');
  const fixedIssues = issues.filter(i => i.status === 'fixed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Hardening</h2>
          <p className="text-muted-foreground">
            Identify and fix security vulnerabilities
          </p>
        </div>
        <Button 
          onClick={fixAllIssues} 
          disabled={running}
          className="bg-primary hover:bg-primary/90"
        >
          {running ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Fixing...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Fix All Issues
            </>
          )}
        </Button>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                <span className={securityScore >= 80 ? 'text-green-500' : securityScore >= 60 ? 'text-yellow-500' : 'text-red-500'}>
                  {Math.round(securityScore)}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <Progress value={securityScore} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold">{criticalIssues.length}</div>
                <div className="text-muted-foreground">Critical</div>
              </div>
              <div>
                <div className="font-bold">{fixedIssues}</div>
                <div className="text-muted-foreground">Fixed</div>
              </div>
              <div>
                <div className="font-bold">{issues.length}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalIssues.length} critical security issue{criticalIssues.length > 1 ? 's' : ''}</strong> require immediate attention.
            These issues pose significant security risks and should be addressed as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Issues */}
      <div className="grid gap-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(issue.category)}
                  <CardTitle className="text-lg">{issue.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getSeverityColor(issue.severity) as any}>
                    {issue.severity}
                  </Badge>
                  <Badge variant={issue.status === 'fixed' ? 'default' : 'secondary'}>
                    {issue.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>{issue.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <div className="font-medium">{issue.impact}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Solution:</span>
                    <div className="font-medium">{issue.solution}</div>
                  </div>
                </div>

                {issue.status === 'fixing' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fixing Progress</span>
                      <span>{issue.progress}%</span>
                    </div>
                    <Progress value={issue.progress} className="h-2" />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => fixIssue(issue.id)}
                    disabled={running || issue.status === 'fixed' || issue.status === 'fixing'}
                    variant={issue.status === 'fixed' ? 'outline' : issue.severity === 'critical' ? 'destructive' : 'default'}
                    size="sm"
                  >
                    {issue.status === 'fixed' ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Fixed
                      </>
                    ) : issue.status === 'fixing' ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Fix Issue
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};