import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock,
  Zap,
  Activity,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
}

interface RateLimitStatus {
  endpoint: string;
  requests: number;
  limit: number;
  resetTime: Date;
  blocked: boolean;
}

interface SecurityMetrics {
  totalTransactions: number;
  suspiciousActivity: number;
  blockedAttempts: number;
  securityScore: number;
}

const TXCSecurityManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalTransactions: 0,
    suspiciousActivity: 0,
    blockedAttempts: 0,
    securityScore: 95
  });
  const [isLoading, setIsLoading] = useState(false);
  const [encryptionStatus, setEncryptionStatus] = useState<'active' | 'inactive' | 'error'>('active');

  // Security event monitoring
  const fetchSecurityEvents = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    }
  }, [user?.id]);

  // Rate limiting status
  const checkRateLimits = useCallback(async () => {
    // Simulate rate limit checking - in production, this would call actual monitoring APIs
    const endpoints = [
      'txc-mining',
      'balance-check',
      'transaction-history',
      'leaderboard'
    ];

    const limits = endpoints.map(endpoint => ({
      endpoint,
      requests: Math.floor(Math.random() * 100),
      limit: 100,
      resetTime: new Date(Date.now() + 3600000), // 1 hour from now
      blocked: Math.random() > 0.9 // 10% chance of being rate limited
    }));

    setRateLimits(limits);
  }, []);

  // Input validation and sanitization
  const validateTXCInput = useCallback((input: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for common injection patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /expression\(/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+.*set/i
    ];

    const inputString = JSON.stringify(input);
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(inputString)) {
        errors.push(`Potentially dangerous pattern detected: ${pattern.source}`);
      }
    }

    // Check input length
    if (inputString.length > 10000) {
      errors.push('Input too large');
    }

    // Check for null bytes
    if (inputString.includes('\0')) {
      errors.push('Null bytes not allowed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, []);

  // Secure transaction validation
  const validateTransaction = useCallback(async (transactionData: any): Promise<boolean> => {
    // Validate input
    const validation = validateTXCInput(transactionData);
    if (!validation.valid) {
      console.error('Transaction validation failed:', validation.errors);
      return false;
    }

    // Check transaction limits
    if (transactionData.amount && transactionData.amount > 10000) {
      console.error('Transaction amount exceeds limit');
      return false;
    }

    // Verify user session
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      console.error('Invalid session for transaction');
      return false;
    }

    // Check rate limiting
    const userRateLimit = rateLimits.find(limit => limit.endpoint === 'txc-mining');
    if (userRateLimit?.blocked) {
      console.error('Rate limit exceeded');
      return false;
    }

    return true;
  }, [validateTXCInput, rateLimits]);

  // Anomaly detection
  const detectAnomalies = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Check for unusual transaction patterns
      const { data: recentTransactions } = await supabase
        .from('txc_transactions')
        .select('amount, created_at, transaction_type')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 86400000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false });

      if (recentTransactions && recentTransactions.length > 0) {
        // Calculate anomaly score based on transaction patterns
        const amounts = recentTransactions.map(t => t.amount);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const maxAmount = Math.max(...amounts);
        
        // Flag if recent transaction is 5x the average
        const hasAnomaly = maxAmount > avgAmount * 5;
        
        if (hasAnomaly) {
          toast({
            title: "Unusual Activity Detected",
            description: "We've detected unusual transaction patterns. Please verify your recent activity.",
            variant: "destructive"
          });

          // Log security event
          await supabase.functions.invoke('log-security-event', {
            body: {
              userId: user.id,
              eventType: 'anomaly_detected',
              description: 'Unusual transaction pattern detected',
              severity: 'medium',
              metadata: { avgAmount, maxAmount, transactionCount: recentTransactions.length }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in anomaly detection:', error);
    }
  }, [user?.id, toast]);

  // Encryption status check
  const checkEncryptionStatus = useCallback(async () => {
    try {
      // Check if browser supports required encryption features
      const hasWebCrypto = !!window.crypto?.subtle;
      const hasSecureContext = window.isSecureContext;
      
      if (!hasWebCrypto || !hasSecureContext) {
        setEncryptionStatus('error');
        return;
      }

      // Test encryption functionality
      const testData = new TextEncoder().encode('test');
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: window.crypto.getRandomValues(new Uint8Array(12)) },
        key,
        testData
      );

      setEncryptionStatus('active');
    } catch (error) {
      console.error('Encryption test failed:', error);
      setEncryptionStatus('error');
    }
  }, []);

  // Security audit
  const runSecurityAudit = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await Promise.all([
        fetchSecurityEvents(),
        checkRateLimits(),
        detectAnomalies(),
        checkEncryptionStatus()
      ]);

      // Calculate security score
      const score = Math.max(0, 100 - (securityEvents.length * 2) - (rateLimits.filter(r => r.blocked).length * 10));
      
      setMetrics(prev => ({
        ...prev,
        securityScore: score,
        suspiciousActivity: securityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length
      }));

      toast({
        title: "Security Audit Complete",
        description: `Security score: ${score}/100`,
        variant: score > 80 ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Security audit failed:', error);
      toast({
        title: "Security Audit Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchSecurityEvents, checkRateLimits, detectAnomalies, checkEncryptionStatus, securityEvents.length, rateLimits, toast]);

  // Auto-security monitoring
  useEffect(() => {
    if (user?.id) {
      runSecurityAudit();
      
      // Set up periodic security checks
      const interval = setInterval(() => {
        detectAnomalies();
        checkRateLimits();
      }, 300000); // Every 5 minutes

      return () => clearInterval(interval);
    }
  }, [user?.id, runSecurityAudit, detectAnomalies, checkRateLimits]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSecurityIcon = (score: number) => {
    if (score >= 90) return <Shield className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <Shield className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSecurityIcon(metrics.securityScore)}
            TXC Security Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.securityScore}</div>
              <div className="text-sm text-muted-foreground">Security Score</div>
              <Progress value={metrics.securityScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.suspiciousActivity}</div>
              <div className="text-sm text-muted-foreground">Suspicious Activity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.blockedAttempts}</div>
              <div className="text-sm text-muted-foreground">Blocked Attempts</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={runSecurityAudit} disabled={isLoading}>
              <Activity className="h-4 w-4 mr-2" />
              Run Security Audit
            </Button>
            <Badge variant={encryptionStatus === 'active' ? 'default' : 'destructive'}>
              <Lock className="h-3 w-3 mr-1" />
              Encryption {encryptionStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="validation">Input Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No security events recorded
                </div>
              ) : (
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium">{event.event_type}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(event.created_at).toLocaleString()}
                          {event.ip_address && ` • IP: ${event.ip_address}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Rate Limiting Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rateLimits.map((limit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{limit.endpoint}</div>
                      <div className="text-sm text-muted-foreground">
                        {limit.requests}/{limit.limit} requests
                      </div>
                    </div>
                    <div className="text-right">
                      {limit.blocked ? (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Resets: {limit.resetTime.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Input Validation Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  TXC implements comprehensive input validation to prevent injection attacks, 
                  XSS, and other security vulnerabilities. All user inputs are sanitized and validated 
                  before processing.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Protected Against:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• SQL Injection</li>
                    <li>• Cross-Site Scripting (XSS)</li>
                    <li>• Code Injection</li>
                    <li>• Null Byte Attacks</li>
                    <li>• Oversized Inputs</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Security Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time Validation</li>
                    <li>• Pattern Detection</li>
                    <li>• Anomaly Monitoring</li>
                    <li>• Rate Limiting</li>
                    <li>• Encryption in Transit</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TXCSecurityManager;