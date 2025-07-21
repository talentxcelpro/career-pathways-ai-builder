import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EmailDeliveryRecord {
  id: string;
  recipient_email: string;
  delivery_status: string;
  delivery_timestamp: string;
  bounce_reason?: string;
  spam_score?: number;
  opened_at?: string;
  clicked_at?: string;
  created_at: string;
}

export const EmailDeliveryTracker = () => {
  const [deliveryRecords, setDeliveryRecords] = useState<EmailDeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('email_delivery_tracking')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching delivery records:', error);
        toast.error('Failed to load email delivery records');
        return;
      }

      setDeliveryRecords(data || []);
    } catch (error) {
      console.error('Error in fetchDeliveryRecords:', error);
      toast.error('Failed to load delivery records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryRecords();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'default';
      case 'failed':
      case 'bounced':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Delivery Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Delivery Tracking
            </CardTitle>
            <CardDescription>
              Monitor email delivery status, opens, clicks, and bounces
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDeliveryRecords}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {deliveryRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No delivery records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Clicked</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.recipient_email}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(record.delivery_status)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(record.delivery_status)}
                        {record.delivery_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.delivery_timestamp ? 
                        new Date(record.delivery_timestamp).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.opened_at ? 
                        new Date(record.opened_at).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.clicked_at ? 
                        new Date(record.clicked_at).toLocaleDateString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.bounce_reason && (
                        <Badge variant="destructive" className="text-xs">
                          {record.bounce_reason}
                        </Badge>
                      )}
                      {record.spam_score && record.spam_score > 5 && (
                        <Badge variant="destructive" className="text-xs ml-1">
                          High Spam Score
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};