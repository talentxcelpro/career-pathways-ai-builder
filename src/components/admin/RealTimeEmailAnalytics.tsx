
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, CheckCircle, XCircle, Pause, Play } from 'lucide-react';

interface EmailQueueItem {
  id: string;
  recipient: string;
  subject: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  timestamp: Date;
}

export const RealTimeEmailAnalytics: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([
    {
      id: '1',
      recipient: 'user1@example.com',
      subject: 'Welcome to TalentXcel',
      status: 'sent',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: '2',
      recipient: 'user2@example.com',
      subject: 'Job Application Received',
      status: 'sending',
      timestamp: new Date(Date.now() - 1000 * 60 * 2)
    },
    {
      id: '3',
      recipient: 'user3@example.com',
      subject: 'Profile Verification',
      status: 'pending',
      timestamp: new Date(Date.now() - 1000 * 30)
    }
  ]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setEmailQueue(prev => prev.map(item => {
        if (item.status === 'pending') {
          return { ...item, status: 'sending' as const };
        } else if (item.status === 'sending') {
          return { ...item, status: Math.random() > 0.2 ? 'sent' as const : 'failed' as const };
        }
        return item;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusIcon = (status: EmailQueueItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'sending':
        return <Activity className="h-4 w-4 animate-spin" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: EmailQueueItem['status']) => {
    const variants = {
      pending: 'secondary',
      sending: 'default',
      sent: 'secondary',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Email Queue
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emailQueue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No emails in queue
            </p>
          ) : (
            emailQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.recipient}</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
