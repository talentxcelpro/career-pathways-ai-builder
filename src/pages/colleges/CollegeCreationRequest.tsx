import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload, CheckCircle2, Clock, Building2, Mail, Phone, MapPin, Globe, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CollegeCreationRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    college_name: '',
    college_email: '',
    official_website: '',
    contact_person: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    documents_urls: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.college_name.trim()) newErrors.college_name = 'College name is required';
    if (!formData.college_email.trim()) newErrors.college_email = 'College email is required';
    if (!formData.college_email.includes('@')) newErrors.college_email = 'Please enter a valid email';
    if (!formData.contact_person.trim()) newErrors.contact_person = 'Contact person name is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a college creation request');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('college_creation_requests')
        .insert([{
          requester_id: user.id,
          college_name: formData.college_name,
          college_email: formData.college_email,
          official_website: formData.official_website,
          contact_person: formData.contact_person,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          documents_urls: formData.documents_urls
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('College creation request submitted successfully!');
      navigate('/colleges/request-status');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Your College Profile</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our platform to showcase your institution to thousands of prospective students
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Building2, title: 'Professional Profile', desc: 'Showcase your college with detailed information' },
            { icon: CheckCircle2, title: 'Verified Badge', desc: 'Get verified status to build trust' },
            { icon: Clock, title: 'Quick Approval', desc: 'Fast review process within 24-48 hours' }
          ].map((benefit, index) => (
            <Card key={index} className="bg-white/80 border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <benefit.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              College Information
            </CardTitle>
            <CardDescription>
              Provide accurate information about your college. All details will be verified before approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="college_name">College Name *</Label>
                    <Input
                      id="college_name"
                      value={formData.college_name}
                      onChange={(e) => handleInputChange('college_name', e.target.value)}
                      placeholder="Enter complete college name"
                      className={errors.college_name ? 'border-red-500' : ''}
                    />
                    {errors.college_name && <p className="text-sm text-red-500 mt-1">{errors.college_name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="college_email">Official College Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="college_email"
                        type="email"
                        value={formData.college_email}
                        onChange={(e) => handleInputChange('college_email', e.target.value)}
                        placeholder="admin@yourcollege.edu"
                        className={`pl-10 ${errors.college_email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.college_email && <p className="text-sm text-red-500 mt-1">{errors.college_email}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_person">Contact Person Name *</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      placeholder="Full name of contact person"
                      className={errors.contact_person ? 'border-red-500' : ''}
                    />
                    {errors.contact_person && <p className="text-sm text-red-500 mt-1">{errors.contact_person}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+91 XXXXXXXXXX"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="official_website">Official Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="official_website"
                      value={formData.official_website}
                      onChange={(e) => handleInputChange('official_website', e.target.value)}
                      placeholder="https://www.yourcollege.edu"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location Details</h3>
                
                <div>
                  <Label htmlFor="address">Complete Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter complete address with landmarks"
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City name"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State name"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Verification Required:</strong> All information will be verified before approval. 
                  Please ensure you provide accurate details and use an official college email address.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/colleges')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollegeCreationRequest;