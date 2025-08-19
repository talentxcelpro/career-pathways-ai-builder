import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCollegesManagement } from '@/hooks/useCollegesManagement';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  Eye
} from 'lucide-react';

export const VerificationManagement: React.FC = () => {
  const { verifyCollege } = useCollegesManagement();

  // Fetch pending verifications
  const { data: pendingVerifications, isLoading } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .in('verification_status', ['pending', 'under_review'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleVerification = (collegeId: string, status: string, reason?: string) => {
    verifyCollege.mutate({ collegeId, status, reason });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'under_review':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800'
    };
    return variants[status] || variants.pending;
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-64"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Verification Management</h2>
          <p className="text-muted-foreground">Review and verify college applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {pendingVerifications?.length || 0} Pending Review
          </Badge>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="space-y-4">
        {pendingVerifications?.map((college: any) => (
          <Card key={college.id} className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {college.college_name}
                    <Badge className={getStatusBadge(college.verification_status)}>
                      {getStatusIcon(college.verification_status)}
                      {college.verification_status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {college.college_type} • {college.city}, {college.state}
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  Applied: {new Date(college.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* College Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {college.college_type}</div>
                    <div><strong>Established:</strong> {college.established_year || 'N/A'}</div>
                    <div><strong>Students:</strong> {college.student_count || 'N/A'}</div>
                    <div><strong>Faculty:</strong> {college.faculty_count || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Contact Details</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Email:</strong> {college.contact_email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {college.contact_phone || 'N/A'}</div>
                    <div><strong>Website:</strong> 
                      {college.website_url ? (
                        <a href={college.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                          Visit
                        </a>
                      ) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Verification Documents</h4>
                  <div className="space-y-2">
                    {college.verification_documents?.length > 0 ? (
                      college.verification_documents.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>{doc.name || `Document ${index + 1}`}</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No documents uploaded</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {college.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{college.description}</p>
                </div>
              )}

              {/* Verification Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleVerification(college.id, 'under_review')}
                    disabled={college.verification_status === 'under_review'}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Under Review
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleVerification(college.id, 'verified', 'Manual verification completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleVerification(college.id, 'rejected', 'Verification documents insufficient')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {pendingVerifications?.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No pending verifications</h3>
            <p className="text-muted-foreground">All colleges are up to date with their verification status</p>
          </CardContent>
        </Card>
      )}

      {/* Verification Guidelines */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Verification Guidelines
          </CardTitle>
          <CardDescription>
            Ensure colleges meet TalentXcel's quality standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">✅ Required Documents</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• University/Board affiliation certificate</li>
                <li>• Government recognition document</li>
                <li>• Accreditation certificates (NAAC/NBA)</li>
                <li>• Principal's authorization letter</li>
                <li>• Academic calendar or prospectus</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔍 Verification Checklist</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verify college official website</li>
                <li>• Cross-check with UGC/AICTE databases</li>
                <li>• Validate contact information</li>
                <li>• Review social media presence</li>
                <li>• Check for any negative reviews/complaints</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};