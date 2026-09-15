import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  BookOpen,
  Award,
  Upload,
  CheckCircle,
  ArrowLeft,
  Send,
  Plus,
  X,
  Calendar,
  DollarSign,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CollegeFormData {
  basicInfo: {
    name: string;
    type: string;
    affiliation: string;
    establishedYear: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    description: string;
  };
  facilities: {
    campusSize: string;
    totalStudents: string;
    totalFaculty: string;
    libraryBooks: string;
    hostelsAvailable: boolean;
    sportsComplex: boolean;
    cafeteria: boolean;
    medicalFacility: boolean;
    transportFacility: boolean;
    wifiCampus: boolean;
  };
  academics: {
    accreditation: string;
    ranking: string;
    placementRate: string;
    averagePackage: string;
    topRecruiters: string[];
  };
  media: {
    logo: File | null;
    coverImage: File | null;
    campusImages: File[];
    brochure: File | null;
  };
}

const EnhancedCollegeCreation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CollegeFormData>({
    basicInfo: {
      name: '',
      type: '',
      affiliation: '',
      establishedYear: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      description: ''
    },
    facilities: {
      campusSize: '',
      totalStudents: '',
      totalFaculty: '',
      libraryBooks: '',
      hostelsAvailable: false,
      sportsComplex: false,
      cafeteria: false,
      medicalFacility: false,
      transportFacility: false,
      wifiCampus: false
    },
    academics: {
      accreditation: '',
      ranking: '',
      placementRate: '',
      averagePackage: '',
      topRecruiters: []
    },
    media: {
      logo: null,
      coverImage: null,
      campusImages: [],
      brochure: null
    }
  });

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'College details and contact information',
      icon: Building
    },
    {
      id: 'facilities',
      title: 'Facilities & Infrastructure',
      description: 'Campus facilities and amenities',
      icon: Users
    },
    {
      id: 'academics',
      title: 'Academic Excellence',
      description: 'Rankings, accreditation, and achievements',
      icon: Award
    },
    {
      id: 'media',
      title: 'Media & Documents',
      description: 'Upload images and brochures',
      icon: Upload
    }
  ];

  const handleInputChange = (section: keyof CollegeFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      media: {
        ...prev.media,
        [field]: file
      }
    }));
  };

  const addRecruiter = (recruiter: string) => {
    if (recruiter.trim() && !formData.academics.topRecruiters.includes(recruiter.trim())) {
      setFormData(prev => ({
        ...prev,
        academics: {
          ...prev.academics,
          topRecruiters: [...prev.academics.topRecruiters, recruiter.trim()]
        }
      }));
    }
  };

  const removeRecruiter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      academics: {
        ...prev.academics,
        topRecruiters: prev.academics.topRecruiters.filter((_, i) => i !== index)
      }
    }));
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Info
        const { name, type, email, phone, address, city, state } = formData.basicInfo;
        return !!(name && type && email && phone && address && city && state);
      
      case 1: // Facilities
        const { campusSize, totalStudents, totalFaculty } = formData.facilities;
        return !!(campusSize && totalStudents && totalFaculty);
      
      case 2: // Academics
        const { accreditation } = formData.academics;
        return !!accreditation;
      
      case 3: // Media
        return !!formData.media.logo;
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill all required fields before proceeding');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitCollegeRequest = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit college request');
        return;
      }

      // Submit to college_creation_requests table
      const { data, error } = await supabase
        .from('college_creation_requests')
        .insert([
          {
            college_name: formData.basicInfo.name,
            college_email: formData.basicInfo.email,
            contact_person: user.email,
            phone: formData.basicInfo.phone,
            address: formData.basicInfo.address,
            city: formData.basicInfo.city,
            state: formData.basicInfo.state,
            official_website: formData.basicInfo.website,
            requester_id: user.id,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast.success('College creation request submitted successfully! We will review and get back to you within 2-3 business days.');
      navigate('/colleges/admin-dashboard');
    } catch (error: any) {
      console.error('Error submitting college request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => navigate('/colleges')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Colleges
              </Button>
            </div>
            
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create College Profile
            </CardTitle>
            <p className="text-gray-600">
              Complete your college information to get listed on our platform
            </p>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Setup Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between mt-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-gray-600 mt-1 text-center max-w-20">
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardHeader>
        </Card>

        {/* Form Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            {/* Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="collegeName">College Name *</Label>
                    <Input
                      id="collegeName"
                      value={formData.basicInfo.name}
                      onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                      placeholder="Enter college name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="collegeType">College Type *</Label>
                    <Select onValueChange={(value) => handleInputChange('basicInfo', 'type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select college type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="deemed">Deemed University</SelectItem>
                        <SelectItem value="autonomous">Autonomous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="affiliation">Affiliation</Label>
                    <Input
                      id="affiliation"
                      value={formData.basicInfo.affiliation}
                      onChange={(e) => handleInputChange('basicInfo', 'affiliation', e.target.value)}
                      placeholder="University/Board affiliation"
                    />
                  </div>

                  <div>
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={formData.basicInfo.establishedYear}
                      onChange={(e) => handleInputChange('basicInfo', 'establishedYear', e.target.value)}
                      placeholder="Year of establishment"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Official Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.basicInfo.email}
                      onChange={(e) => handleInputChange('basicInfo', 'email', e.target.value)}
                      placeholder="admissions@college.edu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Contact Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.basicInfo.phone}
                      onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                      placeholder="College contact number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.basicInfo.website}
                      onChange={(e) => handleInputChange('basicInfo', 'website', e.target.value)}
                      placeholder="https://www.college.edu"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.basicInfo.address}
                    onChange={(e) => handleInputChange('basicInfo', 'address', e.target.value)}
                    placeholder="Complete address of the college"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.basicInfo.city}
                      onChange={(e) => handleInputChange('basicInfo', 'city', e.target.value)}
                      placeholder="City name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.basicInfo.state}
                      onChange={(e) => handleInputChange('basicInfo', 'state', e.target.value)}
                      placeholder="State name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.basicInfo.postalCode}
                      onChange={(e) => handleInputChange('basicInfo', 'postalCode', e.target.value)}
                      placeholder="PIN code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">About College</Label>
                  <Textarea
                    id="description"
                    value={formData.basicInfo.description}
                    onChange={(e) => handleInputChange('basicInfo', 'description', e.target.value)}
                    placeholder="Brief description about the college, its mission, and vision"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Facilities & Infrastructure */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Facilities & Infrastructure</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campusSize">Campus Size (in acres) *</Label>
                    <Input
                      id="campusSize"
                      type="number"
                      value={formData.facilities.campusSize}
                      onChange={(e) => handleInputChange('facilities', 'campusSize', e.target.value)}
                      placeholder="Campus area in acres"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalStudents">Total Students *</Label>
                    <Input
                      id="totalStudents"
                      type="number"
                      value={formData.facilities.totalStudents}
                      onChange={(e) => handleInputChange('facilities', 'totalStudents', e.target.value)}
                      placeholder="Current student count"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalFaculty">Total Faculty *</Label>
                    <Input
                      id="totalFaculty"
                      type="number"
                      value={formData.facilities.totalFaculty}
                      onChange={(e) => handleInputChange('facilities', 'totalFaculty', e.target.value)}
                      placeholder="Faculty members count"
                    />
                  </div>

                  <div>
                    <Label htmlFor="libraryBooks">Library Books</Label>
                    <Input
                      id="libraryBooks"
                      type="number"
                      value={formData.facilities.libraryBooks}
                      onChange={(e) => handleInputChange('facilities', 'libraryBooks', e.target.value)}
                      placeholder="Number of books in library"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-4 block">Available Facilities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'hostelsAvailable', label: 'Hostel Facilities' },
                      { key: 'sportsComplex', label: 'Sports Complex' },
                      { key: 'cafeteria', label: 'Cafeteria' },
                      { key: 'medicalFacility', label: 'Medical Facility' },
                      { key: 'transportFacility', label: 'Transport' },
                      { key: 'wifiCampus', label: 'WiFi Campus' }
                    ].map((facility) => (
                      <div key={facility.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={facility.key}
                          checked={(formData.facilities as any)[facility.key]}
                          onCheckedChange={(checked) => 
                            handleInputChange('facilities', facility.key, checked)
                          }
                        />
                        <Label htmlFor={facility.key}>{facility.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Academic Excellence */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Academic Excellence</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accreditation">Accreditation *</Label>
                    <Select onValueChange={(value) => handleInputChange('academics', 'accreditation', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accreditation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NAAC A++">NAAC A++</SelectItem>
                        <SelectItem value="NAAC A+">NAAC A+</SelectItem>
                        <SelectItem value="NAAC A">NAAC A</SelectItem>
                        <SelectItem value="NAAC B++">NAAC B++</SelectItem>
                        <SelectItem value="NAAC B+">NAAC B+</SelectItem>
                        <SelectItem value="NBA">NBA</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ranking">National Ranking</Label>
                    <Input
                      id="ranking"
                      type="number"
                      value={formData.academics.ranking}
                      onChange={(e) => handleInputChange('academics', 'ranking', e.target.value)}
                      placeholder="NIRF/Other ranking"
                    />
                  </div>

                  <div>
                    <Label htmlFor="placementRate">Placement Rate (%)</Label>
                    <Input
                      id="placementRate"
                      type="number"
                      max="100"
                      value={formData.academics.placementRate}
                      onChange={(e) => handleInputChange('academics', 'placementRate', e.target.value)}
                      placeholder="Placement percentage"
                    />
                  </div>

                  <div>
                    <Label htmlFor="averagePackage">Average Package (₹ LPA)</Label>
                    <Input
                      id="averagePackage"
                      type="number"
                      value={formData.academics.averagePackage}
                      onChange={(e) => handleInputChange('academics', 'averagePackage', e.target.value)}
                      placeholder="Average salary package"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-2 block">Top Recruiters</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.academics.topRecruiters.map((recruiter, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {recruiter}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeRecruiter(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add recruiter name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addRecruiter((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        addRecruiter(input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Media & Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Media & Documents</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'logo', label: 'College Logo *', required: true },
                    { key: 'coverImage', label: 'Cover Image', required: false },
                    { key: 'brochure', label: 'College Brochure', required: false }
                  ].map((item) => (
                    <div key={item.key} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Supported formats: JPG, PNG, PDF (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept={item.key === 'brochure' ? '.pdf' : '.jpg,.jpeg,.png'}
                        onChange={(e) => handleFileUpload(item.key, e.target.files?.[0] || null)}
                        className="hidden"
                        id={item.key}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(item.key)?.click()}
                      >
                        Choose File
                      </Button>
                      {(formData.media as any)[item.key] && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {((formData.media as any)[item.key] as File).name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={submitCollegeRequest} 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedCollegeCreation;