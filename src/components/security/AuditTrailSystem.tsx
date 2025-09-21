import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Eye, Download, Search, Shield, User, Settings, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  category: 'security' | 'privacy' | 'data' | 'profile' | 'system';
  details: string;
  ipAddress: string;
  device: string;
  location: string;
  risk: 'low' | 'medium' | 'high';
}

export const AuditTrailSystem: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const [auditEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      timestamp: '2024-03-25 14:30:22',
      action: 'Profile Updated',
      category: 'profile',
      details: 'Updated work experience section',
      ipAddress: '192.168.1.100',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      risk: 'low'
    },
    {
      id: '2',
      timestamp: '2024-03-25 13:15:45',
      action: 'Privacy Settings Changed',
      category: 'privacy',
      details: 'Modified contact information visibility',
      ipAddress: '192.168.1.100',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      risk: 'medium'
    },
    {
      id: '3',
      timestamp: '2024-03-25 10:22:11',
      action: 'Login Attempt',
      category: 'security',
      details: 'Successful login with 2FA',
      ipAddress: '203.0.113.42',
      device: 'iPhone 15',
      location: 'New York, NY',
      risk: 'low'
    },
    {
      id: '4',
      timestamp: '2024-03-24 22:45:33',
      action: 'Data Export',
      category: 'data',
      details: 'Downloaded personal data archive',
      ipAddress: '192.168.1.100',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      risk: 'medium'
    },
    {
      id: '5',
      timestamp: '2024-03-24 18:12:07',
      action: 'Failed Login',
      category: 'security',
      details: 'Invalid password attempt',
      ipAddress: '198.51.100.23',
      device: 'Unknown',
      location: 'Unknown',
      risk: 'high'
    }
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'privacy': return <Eye className="h-4 w-4" />;
      case 'data': return <FileText className="h-4 w-4" />;
      case 'profile': return <User className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'privacy': return 'bg-blue-100 text-blue-800';
      case 'data': return 'bg-purple-100 text-purple-800';
      case 'profile': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesRisk = filterRisk === 'all' || event.risk === filterRisk;
    
    return matchesSearch && matchesCategory && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Audit Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Security Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {auditEvents.filter(e => e.risk === 'low').length}
              </div>
              <div className="text-xs text-muted-foreground">Low Risk Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {auditEvents.filter(e => e.risk === 'medium').length}
              </div>
              <div className="text-xs text-muted-foreground">Medium Risk Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {auditEvents.filter(e => e.risk === 'high').length}
              </div>
              <div className="text-xs text-muted-foreground">High Risk Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="profile">Profile</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="default">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity ({filteredEvents.length} events)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {getCategoryIcon(event.category)}
                    </div>
                    <div>
                      <h4 className="font-medium">{event.action}</h4>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                    <Badge className={`${getRiskColor(event.risk)} text-white`}>
                      {event.risk}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Time:</span>
                    <br />
                    {event.timestamp}
                  </div>
                  <div>
                    <span className="font-medium">IP:</span>
                    <br />
                    {event.ipAddress}
                  </div>
                  <div>
                    <span className="font-medium">Device:</span>
                    <br />
                    {event.device}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <br />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};