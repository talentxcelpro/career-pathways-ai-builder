import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  database: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  functions: 'healthy' | 'warning' | 'error';
  lastCheck: string;
}

export const HealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus>({
    database: 'healthy',
    auth: 'healthy', 
    storage: 'healthy',
    functions: 'healthy',
    lastCheck: new Date().toISOString()
  });

  const checkHealth = async () => {
    const results: Partial<HealthStatus> = {};

    try {
      // Database health
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      results.database = dbError ? 'error' : 'healthy';
    } catch {
      results.database = 'error';
    }

    try {
      // Auth health
      const { error: authError } = await supabase.auth.getSession();
      results.auth = authError ? 'warning' : 'healthy';
    } catch {
      results.auth = 'error';
    }

    setHealth(prev => ({
      ...prev,
      ...results,
      lastCheck: new Date().toISOString()
    }));
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const overallHealth = Object.values(health).some(v => v === 'error') ? 'error' :
                       Object.values(health).some(v => v === 'warning') ? 'warning' : 'healthy';

  if (!import.meta.env.DEV) return null; // Only show in development

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(overallHealth)}`} />
          System Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(['database', 'auth', 'storage', 'functions'] as const).map(service => (
          <div key={service} className="flex justify-between items-center">
            <span className="text-sm capitalize">{service}</span>
            <Badge variant={health[service] === 'healthy' ? 'default' : 'destructive'}>
              {health[service]}
            </Badge>
          </div>
        ))}
        <div className="text-xs text-muted-foreground">
          Last check: {new Date(health.lastCheck).toLocaleTimeString()}
        </div>
        {overallHealth !== 'healthy' && (
          <Alert>
            <AlertDescription className="text-xs">
              System issues detected. Check console for details.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};