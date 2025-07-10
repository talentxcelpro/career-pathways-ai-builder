import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployerStatusDebug } from '@/components/employer/EmployerStatusDebug';

const RequestAccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: user?.email || '',
    role: '',
    hiringReason: ''
  });

  // Check existing request status
  const { data: existingRequest, isLoading: requestLoading } = useQuery({
    queryKey: ['employer-request', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('employer_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching employer request:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Check user's employer status
  const { data: profile } = useQuery({
    queryKey: ['user-employer-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_employer, employer_status')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Submit request mutation
  const submitRequestMutation = useMutation({
    mutationFn: async (requestData: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('employer_requests')
        .insert({
          user_id: user.id,
          company_name: requestData.companyName,
          email: requestData.companyEmail,
          full_name: user.user_metadata?.full_name || user.email || '',
          hiring_reason: requestData.hiringReason,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employer access request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['employer-request'] });
    },
    onError: (error: any) => {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request');
    }
  });

  // Redirect if already approved
  useEffect(() => {
    if (profile?.is_employer && profile?.employer_status === 'approved') {
      navigate('/employer');
    }
  }, [profile, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.companyEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitRequestMutation.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'more_info_needed': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'more_info_needed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (requestLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show status if request exists
  if (existingRequest) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Access Request</h1>
            <p className="text-gray-600">Your request status and details</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(existingRequest.status)}
                  Request Status
                </CardTitle>
                <Badge className={getStatusColor(existingRequest.status)}>
                  {existingRequest.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Company Information</h3>
                    <p className="text-sm text-gray-600">Company: {existingRequest.company_name}</p>
                    <p className="text-sm text-gray-600">Email: {existingRequest.email}</p>
                    {/* Role field will be available after migration */}
                  </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Request Details</h3>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(existingRequest.created_at).toLocaleDateString()}
                  </p>
                  {existingRequest.updated_at !== existingRequest.created_at && (
                    <p className="text-sm text-gray-600">
                      Updated: {new Date(existingRequest.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {existingRequest.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">🎉 Access Approved!</h4>
                  <p className="text-green-700 mb-4">
                    Congratulations! You now have employer access. You can start posting jobs and managing your company profile.
                  </p>
                  <Button onClick={() => navigate('/employer')} className="bg-green-600 hover:bg-green-700">
                    Go to Employer Dashboard
                  </Button>
                </div>
              )}

              {existingRequest.status === 'rejected' && existingRequest.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Request Rejected</h4>
                  <p className="text-red-700">{existingRequest.rejection_reason}</p>
                </div>
              )}

              {existingRequest.status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Request Under Review</h4>
                  <p className="text-blue-700">
                    Your request is being reviewed by our team. We'll notify you once a decision is made.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug component */}
          <EmployerStatusDebug />
        </div>
      </div>
    );
  }

  // Show request form
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Employer Access</h1>
          <p className="text-gray-600">Get access to post jobs and manage your company profile on TalentXcel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Please provide your company details to help us verify your employer status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your company name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="companyEmail">Company Email *</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  placeholder="your@company.com (must be official email)"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Must be your official company email address</p>
              </div>

              <div>
                <Label htmlFor="role">Your Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="founder">Founder</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="hiringReason">Why you want access (optional)</Label>
                <Textarea
                  id="hiringReason"
                  value={formData.hiringReason}
                  onChange={(e) => handleInputChange('hiringReason', e.target.value)}
                  placeholder="Tell us about your hiring needs and why you chose TalentXcel"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitRequestMutation.isPending}
              >
                {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Debug component */}
        <EmployerStatusDebug />
      </div>
    </div>
  );
};

export default RequestAccess;
