import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  GraduationCap, 
  Check, 
  X, 
  Eye, 
  Clock,
  AlertCircle,
  MapPin,
  Globe,
  Mail,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubmissionRequest {
  id: string;
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  submitted_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  type: 'company' | 'college';
}

export default function AdminSubmissionDashboard() {
  const [companyRequests, setCompanyRequests] = useState<SubmissionRequest[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<SubmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch company submissions
      const { data: companies, error: companyError } = await supabase
        .from('company_submission_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyError) throw companyError;

      // Fetch college submissions
      const { data: colleges, error: collegeError } = await supabase
        .from('college_submission_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (collegeError) throw collegeError;

      setCompanyRequests(companies?.map(c => ({ ...c, type: 'company' as const })) || []);
      setCollegeRequests(colleges?.map(c => ({ ...c, type: 'college' as const })) || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (request: SubmissionRequest, action: 'approve' | 'reject') => {
    try {
      const table = request.type === 'company' ? 'company_submission_requests' : 'college_submission_requests';
      
      // Update submission status
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      if (action === 'approve') {
        // Create the actual entry in companies or colleges table
        const targetTable = request.type === 'company' ? 'companies' : 'colleges';
        
        const baseData = {
          name: request.name,
          description: request.description,
          website: request.website,
          email: request.email,
          phone: request.phone,
          location: request.location,
          status: 'verified',
          submitted_by: request.submitted_by
        };

        const insertData = request.type === 'company' 
          ? { ...baseData, slug: request.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
          : { ...baseData, slug: request.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), college_type: 'University' };

        const { error: insertError } = await supabase
          .from(targetTable)
          .insert(insertData);

        if (insertError) throw insertError;
      }

      // Refresh submissions
      await fetchSubmissions();

      toast({
        title: action === 'approve' ? "Approved" : "Rejected",
        description: `${request.type === 'company' ? 'Company' : 'College'} submission ${action}d successfully`,
      });
    } catch (error) {
      console.error('Error handling approval:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} submission`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const SubmissionCard = ({ request }: { request: SubmissionRequest }) => (
    <Card key={request.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {request.type === 'company' ? (
                  <Building2 className="h-6 w-6" />
                ) : (
                  <GraduationCap className="h-6 w-6" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{request.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {request.description && (
            <p className="text-sm text-muted-foreground">
              {request.description.length > 150 
                ? `${request.description.substring(0, 150)}...`
                : request.description
              }
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {request.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {request.location}
              </div>
            )}
            {request.website && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Website
                </a>
              </div>
            )}
            {request.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                {request.email}
              </div>
            )}
            {request.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                {request.phone}
              </div>
            )}
          </div>

          {request.status === 'pending' && (
            <div className="flex space-x-2 pt-3">
              <Button 
                size="sm" 
                onClick={() => handleApproval(request, 'approve')}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => handleApproval(request, 'reject')}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const pendingCompanies = companyRequests.filter(r => r.status === 'pending');
  const pendingColleges = collegeRequests.filter(r => r.status === 'pending');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submission Dashboard</h1>
        <p className="text-muted-foreground">Review and manage company and college submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pendingCompanies.length}</div>
              <div className="text-sm text-muted-foreground">Pending Companies</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pendingColleges.length}</div>
              <div className="text-sm text-muted-foreground">Pending Colleges</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {companyRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Approved Companies</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {collegeRequests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Approved Colleges</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Companies ({companyRequests.length})
          </TabsTrigger>
          <TabsTrigger value="colleges" className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-2" />
            Colleges ({collegeRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-6">
          {companyRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Company Submissions</h3>
                <p className="text-muted-foreground">No company submissions to review at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {companyRequests.map(request => (
                <SubmissionCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="colleges" className="mt-6">
          {collegeRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No College Submissions</h3>
                <p className="text-muted-foreground">No college submissions to review at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {collegeRequests.map(request => (
                <SubmissionCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}