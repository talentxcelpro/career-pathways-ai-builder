import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Users, Phone, Mail, MessageSquare, Calendar, TrendingUp, 
  Star, DollarSign, Target, Plus, Search, Filter, Eye, Edit2
} from "lucide-react";

interface Lead {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  company: string;
  status: string;
  priority: string;
  source: string;
  estimated_value: number;
  probability: number;
  ai_lead_score: number;
  tags: string[];
  notes: string;
  last_contact_date: string;
  next_follow_up: string;
  created_at: string;
}

interface Communication {
  id: string;
  communication_type: string;
  subject: string;
  content: string;
  direction: string;
  status: string;
  scheduled_at: string;
  completed_at: string;
  created_at: string;
}

export default function CRMDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newLead, setNewLead] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    company: "",
    status: "new",
    priority: "medium",
    source: "direct",
    estimated_value: 0,
    probability: 50,
    notes: ""
  });

  const [newCommunication, setNewCommunication] = useState({
    communication_type: "email",
    subject: "",
    content: "",
    direction: "outbound",
    scheduled_at: ""
  });

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('pro_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch communications
      const { data: commsData, error: commsError } = await supabase
        .from('pro_communications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (commsError) throw commsError;

      setLeads(leadsData || []);
      setCommunications(commsData || []);

    } catch (error) {
      console.error('Error fetching CRM data:', error);
      toast({
        title: "Error",
        description: "Failed to load CRM data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLead = async () => {
    if (!newLead.client_name || !newLead.client_email) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pro_leads')
        .insert([{
          ...newLead,
          profile_id: null, // Will be set by RLS
        }]);

      if (error) throw error;

      setNewLead({
        client_name: "",
        client_email: "",
        client_phone: "",
        company: "",
        status: "new",
        priority: "medium",
        source: "direct",
        estimated_value: 0,
        probability: 50,
        notes: ""
      });
      setShowNewLeadDialog(false);
      fetchCRMData();
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: "Failed to create lead",
        variant: "destructive",
      });
    }
  };

  const addCommunication = async () => {
    if (!selectedLead || !newCommunication.subject) {
      toast({
        title: "Error",
        description: "Please select a lead and fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pro_communications')
        .insert([{
          ...newCommunication,
          lead_id: selectedLead.id,
          profile_id: null, // Will be set by RLS
          scheduled_at: newCommunication.scheduled_at || null,
        }]);

      if (error) throw error;

      setNewCommunication({
        communication_type: "email",
        subject: "",
        content: "",
        direction: "outbound",
        scheduled_at: ""
      });
      setShowCommunicationDialog(false);
      fetchCRMData();
      toast({
        title: "Success",
        description: "Communication logged successfully",
      });
    } catch (error) {
      console.error('Error adding communication:', error);
      toast({
        title: "Error",
        description: "Failed to log communication",
        variant: "destructive",
      });
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('pro_leads')
        .update({ status })
        .eq('id', leadId);

      if (error) throw error;

      fetchCRMData();
      toast({
        title: "Success",
        description: "Lead status updated",
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed_won': return 'bg-green-100 text-green-800';
      case 'closed_lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getLeadStats = () => {
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      closed_won: leads.filter(l => l.status === 'closed_won').length,
      totalValue: leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
      avgScore: leads.length > 0 ? leads.reduce((sum, l) => sum + (l.ai_lead_score || 0), 0) / leads.length : 0
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = getLeadStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your leads and client communications
          </p>
        </div>
        <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
              <DialogDescription>Add a new lead to your CRM system</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-name">Client Name *</Label>
                <Input
                  id="client-name"
                  value={newLead.client_name}
                  onChange={(e) => setNewLead({ ...newLead, client_name: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="client-email">Email *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newLead.client_email}
                  onChange={(e) => setNewLead({ ...newLead, client_email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="client-phone">Phone</Label>
                <Input
                  id="client-phone"
                  value={newLead.client_phone}
                  onChange={(e) => setNewLead({ ...newLead, client_phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newLead.status} onValueChange={(value) => setNewLead({ ...newLead, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newLead.priority} onValueChange={(value) => setNewLead({ ...newLead, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimated-value">Estimated Value ($)</Label>
                <Input
                  id="estimated-value"
                  type="number"
                  value={newLead.estimated_value}
                  onChange={(e) => setNewLead({ ...newLead, estimated_value: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="probability">Probability (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={newLead.probability}
                  onChange={(e) => setNewLead({ ...newLead, probability: Number(e.target.value) })}
                  placeholder="50"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Enter any additional notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowNewLeadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createLead}>Create Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qualified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed_won}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg AI Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed_won">Closed Won</SelectItem>
                <SelectItem value="closed_lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{lead.client_name}</h3>
                        <p className="text-sm text-muted-foreground">{lead.client_email}</p>
                        {lead.company && (
                          <p className="text-sm text-muted-foreground">{lead.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority}
                      </Badge>
                      {lead.ai_lead_score > 0 && (
                        <Badge variant="outline">
                          AI Score: {lead.ai_lead_score}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Estimated Value</p>
                      <p className="text-lg font-semibold">${lead.estimated_value?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Probability</p>
                      <p className="text-lg font-semibold">{lead.probability}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Source</p>
                      <p className="text-sm">{lead.source}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm">{format(new Date(lead.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{lead.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowCommunicationDialog(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateLeadStatus(lead.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {communications.map((comm) => (
              <Card key={comm.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {comm.communication_type === 'email' && <Mail className="h-4 w-4" />}
                      {comm.communication_type === 'call' && <Phone className="h-4 w-4" />}
                      {comm.communication_type === 'meeting' && <Calendar className="h-4 w-4" />}
                      {comm.communication_type === 'message' && <MessageSquare className="h-4 w-4" />}
                      <span className="font-medium">{comm.subject}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={comm.direction === 'outbound' ? 'default' : 'secondary'}>
                        {comm.direction}
                      </Badge>
                      <Badge variant="outline">{comm.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{comm.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comm.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
            <DialogDescription>
              Add a new communication entry for {selectedLead?.client_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="comm-type">Type</Label>
                <Select
                  value={newCommunication.communication_type}
                  onValueChange={(value) => setNewCommunication({ ...newCommunication, communication_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="direction">Direction</Label>
                <Select
                  value={newCommunication.direction}
                  onValueChange={(value) => setNewCommunication({ ...newCommunication, direction: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={newCommunication.subject}
                onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                placeholder="Enter subject"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newCommunication.content}
                onChange={(e) => setNewCommunication({ ...newCommunication, content: e.target.value })}
                placeholder="Enter communication details"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowCommunicationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addCommunication}>Log Communication</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}