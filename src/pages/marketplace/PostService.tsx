
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  DollarSign, 
  Clock, 
  Star,
  Plus,
  X,
  Upload,
  CheckCircle
} from 'lucide-react';

const PostService = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [packages, setPackages] = useState([
    { name: '', price: '', duration: '', description: '', features: [''] }
  ]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addPackage = () => {
    setPackages([...packages, { name: '', price: '', duration: '', description: '', features: [''] }]);
  };

  const updatePackage = (index: number, field: string, value: string) => {
    const updatedPackages = [...packages];
    updatedPackages[index] = { ...updatedPackages[index], [field]: value };
    setPackages(updatedPackages);
  };

  const addFeatureToPackage = (packageIndex: number) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].features.push('');
    setPackages(updatedPackages);
  };

  const updatePackageFeature = (packageIndex: number, featureIndex: number, value: string) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].features[featureIndex] = value;
    setPackages(updatedPackages);
  };

  const removePackageFeature = (packageIndex: number, featureIndex: number) => {
    const updatedPackages = [...packages];
    updatedPackages[packageIndex].features.splice(featureIndex, 1);
    setPackages(updatedPackages);
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Service details and category' },
    { number: 2, title: 'Pricing & Packages', description: 'Set your pricing structure' },
    { number: 3, title: 'Profile & Credentials', description: 'Your background and expertise' },
    { number: 4, title: 'Review & Publish', description: 'Final review and submission' }
  ];

  const categories = ['Mentoring', 'Coaching', 'Training', 'Writing', 'Marketing', 'Consulting'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer Your Professional Services</h1>
          <p className="text-lg text-gray-600">
            Share your expertise and help others advance their careers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-0.5 ml-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          {currentStep === 1 && (
            <div>
              <CardHeader>
                <CardTitle>Basic Service Information</CardTitle>
                <CardDescription>
                  Provide the essential details about your service offering
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="service-title">Service Title *</Label>
                    <Input 
                      id="service-title" 
                      placeholder="e.g., Career Transition Coaching"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short-description">Short Description *</Label>
                  <Input 
                    id="short-description" 
                    placeholder="Brief one-line description of your service"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detailed-description">Detailed Description *</Label>
                  <Textarea 
                    id="detailed-description" 
                    placeholder="Provide a comprehensive description of your service, your approach, and what clients can expect..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills & Expertise</Label>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{skill}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages</Label>
                    <Input 
                      id="languages" 
                      placeholder="e.g., English, Spanish"
                    />
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <CardHeader>
                <CardTitle>Pricing & Service Packages</CardTitle>
                <CardDescription>
                  Define your pricing structure and service packages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hourly-rate">Base Hourly Rate *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        id="hourly-rate" 
                        placeholder="150"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="response-time">Typical Response Time</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-hour">Within 1 hour</SelectItem>
                        <SelectItem value="2-hours">Within 2 hours</SelectItem>
                        <SelectItem value="4-hours">Within 4 hours</SelectItem>
                        <SelectItem value="24-hours">Within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Service Packages</Label>
                  {packages.map((pkg, packageIndex) => (
                    <Card key={packageIndex} className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Package Name</Label>
                            <Input 
                              placeholder="e.g., Single Session"
                              value={pkg.name}
                              onChange={(e) => updatePackage(packageIndex, 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price ($)</Label>
                            <Input 
                              placeholder="125"
                              value={pkg.price}
                              onChange={(e) => updatePackage(packageIndex, 'price', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input 
                              placeholder="1 hour"
                              value={pkg.duration}
                              onChange={(e) => updatePackage(packageIndex, 'duration', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Package Description</Label>
                          <Textarea 
                            placeholder="Describe what's included in this package..."
                            value={pkg.description}
                            onChange={(e) => updatePackage(packageIndex, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Package Features</Label>
                          {pkg.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex space-x-2">
                              <Input 
                                placeholder="e.g., 60-minute video call"
                                value={feature}
                                onChange={(e) => updatePackageFeature(packageIndex, featureIndex, e.target.value)}
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removePackageFeature(packageIndex, featureIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => addFeatureToPackage(packageIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Feature
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={addPackage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              </CardContent>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <CardHeader>
                <CardTitle>Your Professional Profile</CardTitle>
                <CardDescription>
                  Showcase your credentials and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="professional-title">Professional Title *</Label>
                  <Input 
                    id="professional-title" 
                    placeholder="e.g., Senior Career Coach & Former Tech Executive"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience-years">Years of Experience *</Label>
                  <Input 
                    id="experience-years" 
                    type="number"
                    placeholder="8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell potential clients about your background, expertise, and what makes you unique..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea 
                    id="certifications" 
                    placeholder="List your relevant certifications, one per line..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea 
                    id="education" 
                    placeholder="List your educational background, one per line..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <CardHeader>
                <CardTitle>Review & Publish</CardTitle>
                <CardDescription>
                  Review your service listing before publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Before you publish:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ All required fields are completed</li>
                    <li>✓ Your pricing is competitive and fair</li>
                    <li>✓ Your description clearly explains your service</li>
                    <li>✓ You've included relevant skills and credentials</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms of Service and Provider Agreement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="guidelines" />
                    <Label htmlFor="guidelines" className="text-sm">
                      I understand and will follow the Community Guidelines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="quality" />
                    <Label htmlFor="quality" className="text-sm">
                      I commit to providing high-quality service to all clients
                    </Label>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">What happens next?</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Your listing will be reviewed within 24-48 hours</li>
                    <li>• You'll receive an email confirmation once approved</li>
                    <li>• Your service will appear in search results</li>
                    <li>• You can start receiving client inquiries</li>
                  </ul>
                </div>
              </CardContent>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}>
                Next
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700">
                Publish Service
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostService;
