import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { Search, Filter, Eye, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SecurityEventsTable = () => {
  const { securityEvents, eventsLoading } = useSecurityManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredEvents = securityEvents?.filter(event => {
    const matchesSearch = !searchTerm || 
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || event.event_category === categoryFilter;
    
    return matchesSearch && matchesSeverity && matchesCategory;
  }) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return '🔐';
      case 'authorization': return '🛡️';
      case 'data_access': return '📊';
      case 'system': return '⚙️';
      case 'security': return '🔒';
      default: return '📋';
    }
  };

  if (eventsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardTitle>Security Events</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search events, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="authentication">Authentication</SelectItem>
              <SelectItem value="authorization">Authorization</SelectItem>
              <SelectItem value="data_access">Data Access</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No security events found matching your criteria.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCategoryIcon(event.event_category)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        User: {event.profiles?.full_name || 'Unknown'} ({event.profiles?.email || 'No email'})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                    {event.resolved_at && (
                      <Badge variant="secondary" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  {event.ip_address && (
                    <p><span className="font-medium">IP Address:</span> {event.ip_address}</p>
                  )}
                  {event.user_agent && (
                    <p><span className="font-medium">User Agent:</span> {event.user_agent.substring(0, 100)}...</p>
                  )}
                  {event.details && Object.keys(event.details as object).length > 0 && (
                    <div>
                      <span className="font-medium">Details:</span>
                      <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
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