import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PurchaseLog {
  id: string;
  timestamp: string;
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  error?: string;
  metadata: {
    featureId?: string;
    cost?: number;
    isSubscription?: boolean;
  };
}

export const TXCPurchaseMonitor: React.FC = () => {
  const [logs, setLogs] = useState<PurchaseLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Simulate purchase logs (in real app, this would come from a logging system)
      const mockLogs: PurchaseLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          endpoint: 'process-txc-purchase',
          status: 'success',
          metadata: { featureId: 'pro_subscription', cost: 25000, isSubscription: true }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          endpoint: 'txc-feature-purchase',
          status: 'error',
          error: 'Insufficient balance',
          metadata: { featureId: 'premium_template', cost: 500 }
        }
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading purchase logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // Refresh logs every 30 seconds
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">TXC Purchase Monitor</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadLogs}
          disabled={loading}
          className="h-8"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No purchase logs available</p>
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{log.endpoint}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(log.status)}`}
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.error && (
                      <div className="text-xs text-red-600 mt-1">
                        Error: {log.error}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  {log.metadata.featureId && (
                    <div>Feature: {log.metadata.featureId}</div>
                  )}
                  {log.metadata.cost && (
                    <div>Cost: {log.metadata.cost.toLocaleString()} TXC</div>
                  )}
                  {log.metadata.isSubscription && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Subscription
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};