
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  FileText, 
  Star, 
  Upload,
  Eye,
  CheckCircle,
  X
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

interface ServiceFormData {
  title: string;
  professionalTitle: string;
  experience: string;
  location: string;
  description: string;
  whatsIncluded: string[];
  clientRequirements: string;
  deliveryTime: string;
  price: string;
  priceType: 'fixed' | 'hourly';
  paymentMethods: string[];
  contactOptions: string[];
  tags: string[];
  portfolioFiles: string[];
}

const INITIAL_FORM_DATA: ServiceFormData = {
  title: '',
  professionalTitle: '',
  experience: '',
  location: '',
  description: '',
  whatsIncluded: [],
  clientRequirements: '',
  deliveryTime: '',
  price: '',
  priceType: 'fixed',
  paymentMethods: [],
  contactOptions: [],
  tags: [],
  portfolioFiles: []
};

const WHAT_INCLUDED_OPTIONS = [
  'Resume Review',
  'ATS Optimization',
  'Content Rewriting',
  'Formatting & Design',
  'LinkedIn Profile Tips',
  'Interview Preparation',
  'Cover Letter Writing',
  'Career Consultation',
  'Revisions Included'
];

const PAYMENT_METHODS = [
  'UPI',
  'Bank Transfer',
  'PayPal',
  'Cash on Delivery',
  'Credit/Debit Card'
];

const CONTACT_OPTIONS = [
  'Email',
  'Phone Call',
  'WhatsApp',
  'Video Call',
  'In-Person Meeting'
];

export default function ServiceSetupForm() {
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const { uploadFile, uploading } = useFileUpload({ bucket: 'portfolio' });

  const totalSteps = 5;

  const updateFormData = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof ServiceFormData, item: string) => {
    const currentArray = formData[field] as string[];
    const updated = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateFormData(field, updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const fileUrl = await uploadFile(file, `portfolio-${Date.now()}-${file.name}`);
        updateFormData('portfolioFiles', [...formData.portfolioFiles, fileUrl]);
        toast.success('Portfolio file uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload file');
      }
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Service data:', formData);
    toast.success('Service published successfully!');
    // Here you would typically save to database
  };

  if (isPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 (127 Reviews)</span>
                  <span>•</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>89 Orders Completed</span>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>Avg. Delivery: {formData.deliveryTime}</span>
                </div>
                <CardTitle className="text-2xl">{formData.title}</CardTitle>
                <p className="text-muted-foreground">
                  By: {formData.professionalTitle}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Experience: {formData.experience}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ₹{formData.price}
                  {formData.priceType === 'hourly' && <span className="text-sm">/hour</span>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Service Description</h3>
              <p className="text-muted-foreground">{formData.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What's Included</h3>
              <div className="grid grid-cols-2 gap-2">
                {formData.whatsIncluded.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What You Need to Provide</h3>
              <p className="text-muted-foreground">{formData.clientRequirements}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment Methods</h3>
              <div className="flex flex-wrap gap-2">
                {formData.paymentMethods.map((method, index) => (
                  <Badge key={index} variant="outline">{method}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contact Options</h3>
              <div className="flex flex-wrap gap-2">
                {formData.contactOptions.map((option, index) => (
                  <Badge key={index} variant="secondary">{option}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index}>{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsPreview(false)} variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Edit Service
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Service Setup Form
          </CardTitle>
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded ${
                  i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Professional Resume Review & Enhancement"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalTitle">Your Professional Title *</Label>
                <Input
                  id="professionalTitle"
                  placeholder="e.g., Senior HR Manager & Career Coach"
                  value={formData.professionalTitle}
                  onChange={(e) => updateFormData('professionalTitle', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select value={formData.experience} onValueChange={(value) => updateFormData('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 Years">1-2 Years</SelectItem>
                      <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                      <SelectItem value="5-10 Years">5-10 Years</SelectItem>
                      <SelectItem value="10+ Years">10+ Years</SelectItem>
                      <SelectItem value="15+ Years">15+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, India"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Service Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description">Service Description *</Label>
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="Briefly explain what your service offers. Highlight your expertise, what makes it unique, and who it's for."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>What's Included *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {WHAT_INCLUDED_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.whatsIncluded.includes(option)}
                        onCheckedChange={() => toggleArrayItem('whatsIncluded', option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientRequirements">What You Need from the Client *</Label>
                <Textarea
                  id="clientRequirements"
                  rows={3}
                  placeholder="e.g., Current Resume (PDF or Word), Target Job Titles"
                  value={formData.clientRequirements}
                  onChange={(e) => updateFormData('clientRequirements', e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Pricing & Delivery</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time *</Label>
                  <Select value={formData.deliveryTime} onValueChange={(value) => updateFormData('deliveryTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 Day">1 Day</SelectItem>
                      <SelectItem value="2 Days">2 Days</SelectItem>
                      <SelectItem value="3 Days">3 Days</SelectItem>
                      <SelectItem value="5 Days">5 Days</SelectItem>
                      <SelectItem value="1 Week">1 Week</SelectItem>
                      <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceType">Price Type *</Label>
                  <Select value={formData.priceType} onValueChange={(value: 'fixed' | 'hourly') => updateFormData('priceType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="2000"
                    className="pl-10"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Methods Accepted *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <label key={method} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.paymentMethods.includes(method)}
                        onCheckedChange={() => toggleArrayItem('paymentMethods', method)}
                      />
                      <span className="text-sm">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Contact & Tags</h3>
              
              <div className="space-y-2">
                <Label>Contact Options *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTACT_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.contactOptions.includes(option)}
                        onCheckedChange={() => toggleArrayItem('contactOptions', option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags / Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Portfolio & Publish</h3>
              
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Upload (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload samples of your work (e.g., before/after resumes, testimonials)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="portfolio-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('portfolio-upload')?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Choose Files'}
                  </Button>
                </div>
                {formData.portfolioFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Uploaded files:</p>
                    <div className="space-y-1">
                      {formData.portfolioFiles.map((file, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          File {index + 1} uploaded successfully
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Ready to publish?</h4>
                <p className="text-sm text-muted-foreground">
                  Your service will be reviewed and published to the marketplace. 
                  You can always edit it later from your dashboard.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === totalSteps && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              
              <Button
                type="button"
                onClick={currentStep === totalSteps ? handleSubmit : nextStep}
              >
                {currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish Service
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
