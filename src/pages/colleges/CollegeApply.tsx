import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User,
  GraduationCap,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Upload,
  CheckCircle,
  Clock,
  DollarSign,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

const CollegeApply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    academicInfo: {
      tenthPercentage: '',
      tenthBoard: '',
      tenthYear: '',
      twelfthPercentage: '',
      twelfthBoard: '',
      twelfthYear: '',
      stream: '',
      entranceExam: '',
      entranceScore: '',
      previousQualification: ''
    },
    coursePreferences: {
      firstChoice: '',
      secondChoice: '',
      thirdChoice: '',
      specialization: '',
      courseType: ''
    },
    documents: {
      tenthMarksheet: null,
      twelfthMarksheet: null,
      identityProof: null,
      addressProof: null,
      photograph: null,
      signature: null
    }
  });

  // Sample college data
  const college = {
    id: '1',
    name: 'Indian Institute of Technology Delhi',
    logo_url: '/placeholder.svg',
    location: 'New Delhi, Delhi',
    applicationFee: 1500,
    applicationDeadline: '2024-03-31',
    courses: [
      'Computer Science Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electronics & Communication',
      'Chemical Engineering'
    ]
  };

  const applicationSteps: ApplicationStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal and contact details',
      completed: false,
      current: currentStep === 0
    },
    {
      id: 'academic',
      title: 'Academic Details',
      description: 'Educational qualifications and scores',
      completed: false,
      current: currentStep === 1
    },
    {
      id: 'preferences',
      title: 'Course Preferences',
      description: 'Select your preferred courses',
      completed: false,
      current: currentStep === 2
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload required documents',
      completed: false,
      current: currentStep === 3
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review application and submit',
      completed: false,
      current: currentStep === 4
    }
  ];

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < applicationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitApplication = () => {
    toast.success('Application submitted successfully! You will receive a confirmation email shortly.');
    navigate('/applications');
  };

  const progressPercentage = ((currentStep + 1) / applicationSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={college.logo_url} alt={college.name} />
                <AvatarFallback>{college.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl text-gray-900">{college.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {college.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Application Fee: ₹{college.applicationFee}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {college.applicationDeadline}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Application Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between mt-4">
              {applicationSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="text-xs text-gray-600 mt-1 text-center max-w-20">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Application Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            {/* Personal Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.personalInfo.firstName}
                      onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.personalInfo.lastName}
                      onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.personalInfo.dateOfBirth}
                      onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select onValueChange={(value) => handleInputChange('personalInfo', 'gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.personalInfo.address}
                    onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.personalInfo.city}
                      onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.personalInfo.state}
                      onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
                      placeholder="Enter your state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <Input
                      id="pincode"
                      value={formData.personalInfo.pincode}
                      onChange={(e) => handleInputChange('personalInfo', 'pincode', e.target.value)}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">10th Standard Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="tenthPercentage">Percentage/CGPA *</Label>
                        <Input
                          id="tenthPercentage"
                          value={formData.academicInfo.tenthPercentage}
                          onChange={(e) => handleInputChange('academicInfo', 'tenthPercentage', e.target.value)}
                          placeholder="Enter percentage or CGPA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenthBoard">Board *</Label>
                        <Input
                          id="tenthBoard"
                          value={formData.academicInfo.tenthBoard}
                          onChange={(e) => handleInputChange('academicInfo', 'tenthBoard', e.target.value)}
                          placeholder="CBSE, ICSE, State Board"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenthYear">Year of Passing *</Label>
                        <Input
                          id="tenthYear"
                          value={formData.academicInfo.tenthYear}
                          onChange={(e) => handleInputChange('academicInfo', 'tenthYear', e.target.value)}
                          placeholder="2022"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">12th Standard/Diploma Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="twelfthPercentage">Percentage/CGPA *</Label>
                        <Input
                          id="twelfthPercentage"
                          value={formData.academicInfo.twelfthPercentage}
                          onChange={(e) => handleInputChange('academicInfo', 'twelfthPercentage', e.target.value)}
                          placeholder="Enter percentage or CGPA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twelfthBoard">Board *</Label>
                        <Input
                          id="twelfthBoard"
                          value={formData.academicInfo.twelfthBoard}
                          onChange={(e) => handleInputChange('academicInfo', 'twelfthBoard', e.target.value)}
                          placeholder="CBSE, ICSE, State Board"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twelfthYear">Year of Passing *</Label>
                        <Input
                          id="twelfthYear"
                          value={formData.academicInfo.twelfthYear}
                          onChange={(e) => handleInputChange('academicInfo', 'twelfthYear', e.target.value)}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stream">Stream *</Label>
                    <Select onValueChange={(value) => handleInputChange('academicInfo', 'stream', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="science">Science (PCM/PCB)</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                        <SelectItem value="arts">Arts/Humanities</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entranceExam">Entrance Exam (if any)</Label>
                      <Input
                        id="entranceExam"
                        value={formData.academicInfo.entranceExam}
                        onChange={(e) => handleInputChange('academicInfo', 'entranceExam', e.target.value)}
                        placeholder="JEE Main, JEE Advanced, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="entranceScore">Score/Rank</Label>
                      <Input
                        id="entranceScore"
                        value={formData.academicInfo.entranceScore}
                        onChange={(e) => handleInputChange('academicInfo', 'entranceScore', e.target.value)}
                        placeholder="Enter score or rank"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Preferences */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Course Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstChoice">First Preference *</Label>
                    <Select onValueChange={(value) => handleInputChange('coursePreferences', 'firstChoice', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your first choice" />
                      </SelectTrigger>
                      <SelectContent>
                        {college.courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="secondChoice">Second Preference</Label>
                    <Select onValueChange={(value) => handleInputChange('coursePreferences', 'secondChoice', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your second choice" />
                      </SelectTrigger>
                      <SelectContent>
                        {college.courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="thirdChoice">Third Preference</Label>
                    <Select onValueChange={(value) => handleInputChange('coursePreferences', 'thirdChoice', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your third choice" />
                      </SelectTrigger>
                      <SelectContent>
                        {college.courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="courseType">Course Type *</Label>
                    <Select onValueChange={(value) => handleInputChange('coursePreferences', 'courseType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="lateral">Lateral Entry</SelectItem>
                        <SelectItem value="distance">Distance Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Important Note</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Course allocation will be based on merit and availability. We recommend selecting three different preferences to increase your chances of admission.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Document Upload</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'tenthMarksheet', label: '10th Marksheet *', required: true },
                    { key: 'twelfthMarksheet', label: '12th Marksheet *', required: true },
                    { key: 'identityProof', label: 'Identity Proof *', required: true },
                    { key: 'addressProof', label: 'Address Proof *', required: true },
                    { key: 'photograph', label: 'Passport Size Photo *', required: true },
                    { key: 'signature', label: 'Signature *', required: true }
                  ].map((doc) => (
                    <div key={doc.key} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">{doc.label}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Supported formats: PDF, JPG, PNG (Max 2MB)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
                        className="hidden"
                        id={doc.key}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(doc.key)?.click()}
                      >
                        Choose File
                      </Button>
                      {(formData.documents as any)[doc.key] && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {((formData.documents as any)[doc.key] as File).name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Document Guidelines</h4>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                        <li>All documents should be clear and legible</li>
                        <li>Scanned copies or high-quality photos are acceptable</li>
                        <li>File size should not exceed 2MB per document</li>
                        <li>Original documents will be verified during admission</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Review & Submit</h3>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Application Ready for Submission</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Please review all information before submitting. You can edit any section by clicking the back button.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Application Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-800">Personal Information</h4>
                        <p className="text-sm text-gray-600">
                          {formData.personalInfo.firstName} {formData.personalInfo.lastName} • {formData.personalInfo.email}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800">Academic Information</h4>
                        <p className="text-sm text-gray-600">
                          12th: {formData.academicInfo.twelfthPercentage}% • 10th: {formData.academicInfo.tenthPercentage}%
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-800">Course Preferences</h4>
                        <p className="text-sm text-gray-600">
                          1st: {formData.coursePreferences.firstChoice}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions and declare that all information provided is true and accurate.
                    </Label>
                  </div>
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
              
              {currentStep < applicationSteps.length - 1 ? (
                <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                  Next Step
                </Button>
              ) : (
                <Button onClick={submitApplication} className="bg-green-600 hover:bg-green-700">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollegeApply;