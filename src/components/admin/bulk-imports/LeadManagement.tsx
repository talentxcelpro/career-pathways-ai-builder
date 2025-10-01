import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Mail, UserCheck, ExternalLink, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string;
  designation: string | null;
  current_company: string | null;
  linkedin_url: string | null;
  status: string;
  enrichment_status: string;
  invitation_sent_at: string | null;
  activated_at: string | null;
  created_at: string;
}

export function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [enrichmentFilter, setEnrichmentFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, enrichmentFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('imported_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (enrichmentFilter !== 'all') {
        query = query.eq('enrichment_status', enrichmentFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    searchTerm === '' ||
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.current_company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendInvitation = async (leadId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: { lead_id: leadId }
      });

      if (error) throw error;
      toast.success('Invitation sent successfully');
      fetchLeads();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      invited: { variant: 'default', label: 'Invited' },
      active: { variant: 'default', label: 'Active' },
      bounced: { variant: 'destructive', label: 'Bounced' }
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, email, company..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enrichment</label>
              <Select value={enrichmentFilter} onValueChange={setEnrichmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="enriched">Enriched</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLeads.length} of {leads.length} leads
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Enrichment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-sm">{lead.email}</td>
                    <td className="px-4 py-3 text-sm">{lead.designation || '-'}</td>
                    <td className="px-4 py-3 text-sm">{lead.current_company || '-'}</td>
                    <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.enrichment_status === 'enriched' ? 'default' : 'secondary'}>
                        {lead.enrichment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {lead.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendInvitation(lead.id)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                        )}
                        {lead.linkedin_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(lead.linkedin_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && !loading && (
            <div className="p-8 text-center text-muted-foreground">
              No leads found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
