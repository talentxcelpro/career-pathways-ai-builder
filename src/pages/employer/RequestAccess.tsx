
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building2, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const RequestAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phoneNumber: '',
    companyName: '',
    companyWebsite: '',
    companyLogoUrl: '',
    companyDescription: '',
    hiringReason: '',
    linkedinProfile: '',
    gstNumber: ''
  });

  // Check if user already has a pending or approved request
  const { data: existingRequest, isLoading } = useQuery({
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
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const submitRequestMutation = useMutation({
    mutationFn: async (requestData: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('employer_requests')
        .insert({
          user_id: user.id,
          full_name: requestData.fullName,
          email: requestData.email,
          phone_number: requestData.phoneNumber,
          company_name: requestData.companyName,
          company_website: requestData.companyWebsite,
          company_logo_url: requestData.companyLogoUrl,
          company_description: requestData.companyDescription,
          hiring_reason: requestData.hiringReason,
          linkedin_profile: requestData.linkedinProfile,
          gst_number: requestData.gstNumber
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employer access request submitted successfully!');
      // Refresh the page to show the status
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit request');
    }
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.companyName || !formData.companyDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitRequestMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-4">Please login to request employer access</p>
            <Button onClick={() => navigate('/auth/login')}>
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show status if user already has a request
  if (existingRequest) {
    const statusConfig = {
      pending: {
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        title: 'Request Under Review',
        message: 'Your employer access request is being reviewed by our team. We\'ll notify you via email once it\'s processed.'
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        title: 'Access Approved!',
        message: 'Congratulations! You now have employer access. You can start posting jobs and managing your company profile.'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        title: 'Request Rejected',
        message: existingRequest.rejection_reason || 'Your request was not approved. Please contact support for more information.'
      }
    };

    const config = statusConfig[existingRequest.status as keyof typeof statusConfig];
    const StatusIcon = config.icon;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className={`${config.bgColor} rounded-lg p-6 text-center`}>
                <StatusIcon className={`h-16 w-16 ${config.color} mx-auto mb-4`} />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h2>
                <p className="text-gray-700 mb-4">{config.message}</p>
                
                {existingRequest.status === 'approved' && (
                  <div className="space-y-3">
                    <Button onClick={() => navigate('/jobs/post')} className="mr-3">
                      Post a Job
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/employer')}>
                      Employer Dashboard
                    </Button>
                  </div>
                )}
                
                {existingRequest.status === 'rejected' && (
                  <Button onClick={() => navigate('/contact')} variant="outline">
                    Contact Support
                  </Button>
                )}
                
                <div className="mt-6 text-sm text-gray-500">
                  <p>Submitted: {new Date(existingRequest.created_at).toLocaleDateString()}</p>
                  <p>Company: {existingRequest.company_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Employer Access</h1>
          <p className="text-gray-600">Join TalentXcel as an employer and start hiring top talent</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="companyDescription">Company Description *</Label>
                <Textarea
                  id="companyDescription"
                  rows={4}
                  placeholder="Tell us about your company..."
                  value={formData.companyDescription}
                  onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="hiringReason">Why do you want to hire via TalentXcel?</Label>
                <Textarea
                  id="hiringReason"
                  rows={3}
                  placeholder="Brief description of your hiring needs..."
                  value={formData.hiringReason}
                  onChange={(e) => handleInputChange('hiringReason', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn/Company Social Profile</Label>
                  <Input
                    id="linkedinProfile"
                    placeholder="https://linkedin.com/company/..."
                    value={formData.linkedinProfile}
                    onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                  <Input
                    id="gstNumber"
                    placeholder="Company registration number"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your request will be reviewed by our team</li>
                  <li>• We'll verify your company information</li>
                  <li>• You'll receive an email notification about the decision</li>
                  <li>• Once approved, you can start posting jobs immediately</li>
                </ul>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitRequestMutation.isPending}
              >
                {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestAccess;
