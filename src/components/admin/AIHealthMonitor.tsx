import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface FunctionHealth {
  function: string;
  version: string;
  status: 'healthy' | 'error' | 'unknown';
  mode?: string;
  lastChecked: Date;
}

export const AIHealthMonitor: React.FC = () => {
  const [functions, setFunctions] = useState<FunctionHealth[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkFunctionHealth = async (functionName: string): Promise<FunctionHealth> => {
    try {
      const url = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/${functionName}`;
      const response = await fetch(url, { method: 'GET' });
      
      if (response.ok) {
        const data = await response.json();
        return {
          function: functionName,
          version: data.version || 'unknown',
          status: 'healthy',
          mode: data.mode || data.status,
          lastChecked: new Date()
        };
      } else {
        return {
          function: functionName,
          version: 'unknown',
          status: 'error',
          lastChecked: new Date()
        };
      }
    } catch (error) {
      return {
        function: functionName,
        version: 'unknown',
        status: 'error',
        lastChecked: new Date()
      };
    }
  };

  const checkAllFunctions = async () => {
    setIsChecking(true);
    try {
      const functionNames = [
        'ai-comprehensive-generator',
        'ai-comprehensive-generator-v2',
        'content-queue-processor'
      ];

      const healthChecks = await Promise.all(
        functionNames.map(name => checkFunctionHealth(name))
      );

      setFunctions(healthChecks);
    } catch (error) {
      console.error('Error checking function health:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAllFunctions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">AI Function Health</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={checkAllFunctions}
          disabled={isChecking}
          className="gap-2"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          Check
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {functions.map((func) => (
            <div key={func.function} className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(func.status)}
                <div>
                  <p className="text-sm font-medium">{func.function}</p>
                  <p className="text-xs text-muted-foreground">
                    v{func.version} {func.mode && `• ${func.mode}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(func.status)}
                <p className="text-xs text-muted-foreground mt-1">
                  {func.lastChecked.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};