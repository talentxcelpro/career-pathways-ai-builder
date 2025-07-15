import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ScrollText, 
  Search, 
  Filter, 
  RefreshCw, 
  Download,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AILogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, moduleFilter, timeRange]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Calculate time range
      const now = new Date();
      const timeRangeHours = timeRange === '1h' ? 1 : 
                           timeRange === '24h' ? 24 : 
                           timeRange === '7d' ? 168 : 720;
      const startTime = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);
      
      // Build query
      let query = supabase
        .from('ai_request_logs')
        .select(`
          *,
          ai_deployments (
            deployment_name,
            module_name,
            ai_models (
              model_name,
              model_version
            )
          )
        `)
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('success', statusFilter === 'success');
      }
      
      if (moduleFilter !== 'all') {
        query = query.eq('ai_deployments.module_name', moduleFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Success
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    // Apply search term to deployment name, request type, or error message
    return (
      log.ai_deployments?.deployment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.request_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.error_message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const modules = [
    'resume_builder',
    'jobs',
    'career_map',
    'learning',
    'employer',
    'network',
    'testing'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Logs & Usage</h2>
          <p className="text-muted-foreground">
            View and analyze AI request logs and system activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchLogs()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            startIcon={<Search className="h-4 w-4" />}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map(module => (
              <SelectItem key={module} value={module}>
                {module.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Request Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No logs found matching your criteria
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Deployment</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.ai_deployments?.deployment_name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.ai_deployments?.module_name?.replace('_', ' ') || 'Unknown module'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{log.request_type}</TableCell>
                    <TableCell>{getStatusBadge(log.success)}</TableCell>
                    <TableCell>{log.response_time_ms}ms</TableCell>
                    <TableCell>{log.tokens_used || 0}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Log Details: {selectedLog?.request_type}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Deployment</h4>
                  <p>{selectedLog.ai_deployments?.deployment_name || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Model</h4>
                  <p>
                    {selectedLog.ai_deployments?.ai_models?.model_name} 
                    {selectedLog.ai_deployments?.ai_models?.model_version && 
                      ` v${selectedLog.ai_deployments?.ai_models?.model_version}`
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Module</h4>
                  <p>{selectedLog.ai_deployments?.module_name?.replace('_', ' ') || 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Timestamp</h4>
                  <p>{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <div>{getStatusBadge(selectedLog.success)}</div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Performance</h4>
                  <div className="flex gap-4">
                    <span>{selectedLog.response_time_ms}ms</span>
                    <span>{selectedLog.tokens_used || 0} tokens</span>
                  </div>
                </div>
              </div>

              {selectedLog.error_message && (
                <div>
                  <h4 className="font-medium mb-1 text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Error Message
                  </h4>
                  <div className="bg-red-50 text-red-900 p-3 rounded-md">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-1">Request Data</h4>
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-40">
                  <pre className="text-sm">
                    {JSON.stringify(selectedLog.input_data, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Response Data</h4>
                <div className="bg-muted p-4 rounded-lg overflow-auto max-h-40">
                  <pre className="text-sm">
                    {JSON.stringify(selectedLog.output_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};