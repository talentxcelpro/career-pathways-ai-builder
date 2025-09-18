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
  sent_at: string;
  bounce_reason?: string;
  bounce_type?: string;
  complaint_type?: string;
  ses_message_id?: string;
  template_name?: string;
  recipient_name?: string;
}

export const EmailDeliveryTracker = () => {
  const [deliveryRecords, setDeliveryRecords] = useState<EmailDeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('email_delivery_tracking')
        .select(`
          id,
          recipient_email,
          delivery_status,
          sent_at,
          bounce_type,
          bounce_reason,
          complaint_type,
          ses_message_id,
          email_automation_queue_id,
          email_automation_queue:email_automation_queue_id (
            trigger_type,
            recipient_name
          )
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching delivery records:', error);
        toast.error('Failed to load email delivery records');
        return;
      }

      // Transform the data to include template info
      const transformedData = (data || []).map((record: any) => ({
        ...record,
        template_name: record.email_automation_queue?.trigger_type || 'Unknown',
        recipient_name: record.email_automation_queue?.recipient_name || 'Unknown'
      }));

      setDeliveryRecords(transformedData);
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
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Message ID</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{record.recipient_email}</span>
                        <span className="text-xs text-muted-foreground">
                          {record.recipient_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.template_name}
                      </Badge>
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
                      {record.sent_at ? 
                        new Date(record.sent_at).toLocaleString() : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        {record.ses_message_id ? 
                          record.ses_message_id.substring(0, 12) + '...' : 
                          '-'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {record.bounce_reason && (
                          <Badge variant="destructive" className="text-xs">
                            {record.bounce_type}: {record.bounce_reason}
                          </Badge>
                        )}
                        {record.complaint_type && (
                          <Badge variant="destructive" className="text-xs">
                            Complaint: {record.complaint_type}
                          </Badge>
                        )}
                      </div>
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