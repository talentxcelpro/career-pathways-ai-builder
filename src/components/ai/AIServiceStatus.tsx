import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface ServiceStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  lastChecked?: string;
  error?: string;
  openaiConfigured?: boolean;
}

export const AIServiceStatus: React.FC<{ 
  services?: string[]; 
  showDetails?: boolean;
  onStatusChange?: (allHealthy: boolean) => void;
}> = ({ 
  services = ['ai-resume-enhancement', 'ai-agent'], 
  showDetails = false,
  onStatusChange 
}) => {
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkServiceHealth = async (serviceName: string): Promise<ServiceStatus> => {
    try {
      console.log(`🔍 Checking health for ${serviceName}...`);
      
      const { data, error } = await supabase.functions.invoke(serviceName, {
        method: 'GET'
      });

      if (error) {
        console.error(`❌ Health check failed for ${serviceName}:`, error);
        return {
          service: serviceName,
          status: 'unhealthy',
          error: error.message,
          lastChecked: new Date().toISOString()
        };
      }

      console.log(`✅ Health check passed for ${serviceName}:`, data);
      
      return {
        service: serviceName,
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        openaiConfigured: data?.openaiConfigured
      };
    } catch (error) {
      console.error(`💥 Health check error for ${serviceName}:`, error);
      return {
        service: serviceName,
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const checkAllServices = async () => {
    setIsChecking(true);
    
    try {
      const checks = services.map(service => checkServiceHealth(service));
      const results = await Promise.all(checks);
      
      setServiceStatuses(results);
      
      const allHealthy = results.every(result => result.status === 'healthy');
      onStatusChange?.(allHealthy);
      
      if (!allHealthy) {
        const unhealthyServices = results.filter(r => r.status === 'unhealthy');
        toast.error(`AI services unavailable: ${unhealthyServices.map(s => s.service).join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to check services:', error);
      toast.error('Failed to check AI service status');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAllServices();
    
    // Check services every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    
    return () => clearInterval(interval);
  }, [services.join(',')]);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'checking': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'unhealthy': return <WifiOff className="w-4 h-4" />;
      case 'checking': return <Loader2 className="w-4 h-4 animate-spin" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  const allHealthy = serviceStatuses.every(s => s.status === 'healthy');
  const hasUnhealthy = serviceStatuses.some(s => s.status === 'unhealthy');

  if (!showDetails) {
    // Simple status indicator
    return (
      <div className="flex items-center space-x-2">
        <Badge 
          variant="secondary" 
          className={`${getStatusColor(allHealthy ? 'healthy' : hasUnhealthy ? 'unhealthy' : 'checking')}`}
        >
          {getStatusIcon(allHealthy ? 'healthy' : hasUnhealthy ? 'unhealthy' : 'checking')}
          <span className="ml-1">
            {isChecking ? 'Checking...' : 
             allHealthy ? 'AI Services Online' : 
             'AI Services Issue'}
          </span>
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={checkAllServices}
          disabled={isChecking}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  }

  // Detailed status card
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Service Status</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkAllServices}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {serviceStatuses.map((service) => (
          <div key={service.service} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
              </div>
              <div>
                <div className="font-medium capitalize">
                  {service.service.replace('ai-', '').replace('-', ' ')}
                </div>
                <div className="text-sm text-gray-500">
                  {service.lastChecked && 
                    `Last checked: ${new Date(service.lastChecked).toLocaleTimeString()}`
                  }
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
              
              {service.error && (
                <div className="text-xs text-red-600 mt-1 max-w-40 truncate">
                  {service.error}
                </div>
              )}
              
              {service.openaiConfigured === false && (
                <div className="text-xs text-yellow-600 mt-1">
                  API key missing
                </div>
              )}
            </div>
          </div>
        ))}
        
        {hasUnhealthy && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Service Issues Detected</div>
                <div className="text-sm text-yellow-700 mt-1">
                  Some AI features may not work properly. This is often due to:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Missing API keys</li>
                    <li>Network connectivity issues</li>
                    <li>Service deployment in progress</li>
                  </ul>
                  Try refreshing or contact support if issues persist.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};