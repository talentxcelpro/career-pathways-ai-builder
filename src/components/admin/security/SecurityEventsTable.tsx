import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { Shield, AlertTriangle, Eye, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SecurityEventsTable = () => {
  const { securityEvents, eventsLoading } = useSecurityManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredEvents = securityEvents?.filter(event => {
    const matchesSearch = !searchTerm || 
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof event.profiles === 'object' && event.profiles && 'email' in event.profiles && (event.profiles as any).email && (event.profiles as any).email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof event.profiles === 'object' && event.profiles && 'full_name' in event.profiles && (event.profiles as any).full_name && (event.profiles as any).full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || event.event_category === categoryFilter;
    
    return matchesSearch && matchesSeverity && matchesCategory;
  }) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      case 'info': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return '🔐';
      case 'authorization': return '🛡️';
      case 'data_access': return '📊';
      case 'system': return '⚙️';
      default: return '📋';
    }
  };

  if (eventsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Security Events ({filteredEvents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="search">Search Events</Label>
            <Input
              id="search"
              placeholder="Search by event type, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="severity">Severity Filter</Label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Category Filter</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="authentication">Authentication</SelectItem>
                <SelectItem value="authorization">Authorization</SelectItem>
                <SelectItem value="data_access">Data Access</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Table */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
            No security events found.
          </div>
        ) : (
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Event</th>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Severity</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">IP Address</th>
                    <th className="text-left p-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/25">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{event.event_type}</p>
                          {typeof event.details === 'string' && (
                            <p className="text-sm text-muted-foreground">{event.details}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {(typeof event.profiles === 'object' && event.profiles && 'full_name' in event.profiles && (event.profiles as any).full_name) || 'Unknown'} {(typeof event.profiles === 'object' && event.profiles && 'email' in event.profiles && (event.profiles as any).email && `(${(event.profiles as any).email})`) || ''}
                      </td>
                      <td className="p-3">
                        <Badge className={`text-white ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span>{getCategoryIcon(event.event_category)}</span>
                          {event.event_category}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{String(event.ip_address || 'N/A')}</td>
                      <td className="p-3 text-sm">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};