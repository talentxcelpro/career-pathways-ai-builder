import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthData {
  status: string;
  timestamp: string;
  openai_configured: boolean;
  environment: {
    deno_version: string;
    v8_version: string;
    typescript_version: string;
  };
  function_status: string;
}

export const EdgeFunctionHealthCheck: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('health-check');
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      setHealthData(data);
    } catch (err: any) {
      console.error('Health check failed:', err);
      setError(err.message || 'Health check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Edge Function Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkHealth} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Checking...' : 'Check Health'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Health Check Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {healthData && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(healthData.status)}
              <span className="font-medium capitalize">{healthData.status}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>OpenAI Configured:</span>
                <span className={healthData.openai_configured ? 'text-green-600' : 'text-red-600'}>
                  {healthData.openai_configured ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Function Status:</span>
                <span className="text-green-600">{healthData.function_status}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Last Check:</span>
                <span>{new Date(healthData.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};