import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  FileText, 
  Star, 
  Upload,
  Eye,
  CheckCircle,
  X,
  Camera,
  User,
  ExternalLink,
  Plus,
  Phone,
  Globe,
  Mail
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceFormData {
  profilePictureUrl: string;
  profileLink: string;
  title: string;
  professionalTitle: string;
  experience: string;
  location: string;
  description: string;
  whatsIncluded: string[];
  clientRequirements: string;
  deliveryTime: number;
  price: string;
  currency: string;
  paymentMethods: string[];
  contactPreferences: string[];
  tags: string[];
  portfolioItems: any[];
  status: 'draft' | 'pending' | 'published';
}

const INITIAL_FORM_DATA: ServiceFormData = {
  profilePictureUrl: '',
  profileLink: '',
  title: '',
  professionalTitle: '',
  experience: '',
  location: '',
  description: '',
  whatsIncluded: [],
  clientRequirements: '',
  deliveryTime: 3,
  price: '',
  currency: 'INR',
  paymentMethods: [],
  contactPreferences: [],
  tags: [],
  portfolioItems: [],
  status: 'draft'
};

const WHAT_INCLUDED_OPTIONS = [
  'ATS Format',
  'Role Match',
  'PDF & Word',
  'Resume Review',
  'Content Rewriting',
  'Formatting & Design',
  'LinkedIn Profile Tips',
  'Interview Preparation',
  'Cover Letter Writing',
  'Career Consultation',
  'Revisions Included'
];

const PAYMENT_METHODS = [
  'Razorpay',
  'UPI',
  'Stripe',
  'PayPal',
  'Credit Card',
  'Crypto',
  'Bank Transfer',
  'Cash'
];

const CONTACT_PREFERENCES = [
  'Email',
  'Phone',
  'Website'
];

const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' }
];

export default function ServiceSetupForm() {
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [portfolioInput, setPortfolioInput] = useState('');
  const { uploadFile, uploading } = useFileUpload({ bucket: 'portfolio' });
  const { user } = useAuth();

  const totalSteps = 6;
  const currentCurrency = CURRENCIES.find(c => c.value === formData.currency) || CURRENCIES[0];

  useEffect(() => {
    if (user) {
      // Auto-generate profile link
      const profileLink = `https://talentxcel.in/profile/user/${user.id}`;
      setFormData(prev => ({ ...prev, profileLink }));
      
      // Auto-fetch profile picture from user profile
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          profilePictureUrl: `https://talentxcel.in/profile/user/${user.id}/avatar`,
          professionalTitle: data.full_name || '',
          location: '' // Set to empty string as it doesn't exist in profiles
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Set default values if profile fetch fails
      setFormData(prev => ({
        ...prev,
        profilePictureUrl: `https://talentxcel.in/profile/user/${user.id}/avatar`,
        professionalTitle: '',
        location: ''
      }));
    }
  };

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

  const addPortfolioItem = () => {
    if (portfolioInput.trim()) {
      const newItem = {
        id: Date.now(),
        title: portfolioInput.trim(),
        type: 'text',
        url: portfolioInput.trim()
      };
      updateFormData('portfolioItems', [...formData.portfolioItems, newItem]);
      setPortfolioInput('');
    }
  };

  const removePortfolioItem = (itemId: number) => {
    updateFormData('portfolioItems', formData.portfolioItems.filter(item => item.id !== itemId));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const fileUrl = await uploadFile(file, `portfolio-${Date.now()}-${file.name}`);
        const portfolioItem = {
          id: Date.now(),
          title: file.name,
          type: 'file',
          url: fileUrl
        };
        updateFormData('portfolioItems', [...formData.portfolioItems, portfolioItem]);
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

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const serviceData = {
        provider_id: user.id,
        title: formData.title,
        professional_title: formData.professionalTitle,
        years_experience: formData.experience,
        location: formData.location,
        description: formData.description,
        whats_included: formData.whatsIncluded,
        client_requirements: formData.clientRequirements,
        delivery_time_days: formData.deliveryTime,
        price: parseFloat(formData.price),
        currency: formData.currency,
        payment_methods: formData.paymentMethods,
        contact_preferences: formData.contactPreferences,
        tags: formData.tags,
        portfolio_items: formData.portfolioItems,
        profile_picture_url: formData.profilePictureUrl,
        profile_link: formData.profileLink,
        status: formData.status,
        is_active: true
      };

      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Service created successfully!');
      console.log('Service created:', data);
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  if (isPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.profilePictureUrl} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{formData.professionalTitle}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>{formData.experience}</span>
                </div>
                <a 
                  href={formData.profileLink}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 (127 Reviews)</span>
                  <span>•</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>89 Orders Completed</span>
                </div>
                <CardTitle className="text-2xl">{formData.title}</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {currentCurrency.symbol}{formData.price}
                </div>
                <div className="text-sm text-muted-foreground">
                  Delivered in {formData.deliveryTime} days
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
              <h3 className="font-semibold mb-2">Client Requirements</h3>
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
                {formData.contactPreferences.map((option, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {option === 'Email' && <Mail className="h-3 w-3" />}
                    {option === 'Phone' && <Phone className="h-3 w-3" />}
                    {option === 'Website' && <Globe className="h-3 w-3" />}
                    {option}
                  </Badge>
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

            {formData.portfolioItems.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Portfolio</h3>
                <div className="grid grid-cols-2 gap-4">
                  {formData.portfolioItems.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <h3 className="text-lg font-semibold">👤 Profile & Basic Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.profilePictureUrl} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label>Profile Picture</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-loaded from: https://talentxcel.in/profile/user/{user?.id}/avatar
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload New Photo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Profile Link (Auto-Generated)</Label>
                  <Input 
                    value={formData.profileLink} 
                    readOnly 
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be displayed as "View Profile" on your service card
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Professional Resume Writing"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalTitle">Your Professional Title *</Label>
                <Input
                  id="professionalTitle"
                  placeholder="e.g., Senior HR Consultant"
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
                      <SelectItem value="1-2 years">1-2 years</SelectItem>
                      <SelectItem value="3-5 years">3-5 years</SelectItem>
                      <SelectItem value="5-8 years">5-8 years</SelectItem>
                      <SelectItem value="8+ years">8+ years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Bengaluru, India"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">📝 Service Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="description">Service Description *</Label>
                <Textarea
                  id="description"
                  rows={6}
                  placeholder="Full overview of what you're offering. Highlight your expertise and what makes your service unique."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>What's Included * (Select all that apply)</Label>
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
                <Label htmlFor="clientRequirements">Client Requirements *</Label>
                <Textarea
                  id="clientRequirements"
                  rows={3}
                  placeholder="E.g., Current Resume, LinkedIn Profile, Target Roles"
                  value={formData.clientRequirements}
                  onChange={(e) => updateFormData('clientRequirements', e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">💰 Pricing & Delivery</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">
                      {currentCurrency.symbol}
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="999"
                      className="pl-8"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time (in Days) *</Label>
                <Select 
                  value={formData.deliveryTime.toString()} 
                  onValueChange={(value) => updateFormData('deliveryTime', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="2">2 Days</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="5">5 Days</SelectItem>
                    <SelectItem value="7">1 Week</SelectItem>
                    <SelectItem value="14">2 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Methods (Multi-select) *</Label>
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
              <h3 className="text-lg font-semibold">📞 Contact & Communication</h3>
              
              <div className="space-y-2">
                <Label>Contact Preferences (Multi-select) *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTACT_PREFERENCES.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.contactPreferences.includes(option)}
                        onCheckedChange={() => toggleArrayItem('contactPreferences', option)}
                      />
                      <span className="text-sm flex items-center gap-1">
                        {option === 'Email' && <Mail className="h-3 w-3" />}
                        {option === 'Phone' && <Phone className="h-3 w-3" />}
                        {option === 'Website' && <Globe className="h-3 w-3" />}
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags / Keywords</Label>
                <p className="text-sm text-muted-foreground">
                  Used for filters and search on Services Page
                </p>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="e.g., Resume, LinkedIn, Career"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
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
              <h3 className="text-lg font-semibold">🎨 Portfolio & Samples</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Add Portfolio Item</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter portfolio item title or description"
                      value={portfolioInput}
                      onChange={(e) => setPortfolioInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioItem())}
                    />
                    <Button type="button" onClick={addPortfolioItem} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload Portfolio Files</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload samples of your work (PDFs, images, documents)
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
                </div>

                {formData.portfolioItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Portfolio Items</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.portfolioItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.type}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removePortfolioItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">🚀 Review & Publish</h3>
              
              <div className="space-y-2">
                <Label>Publication Status</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'pending' | 'published') => updateFormData('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft - Save for later</SelectItem>
                    <SelectItem value="pending">Pending - Submit for review</SelectItem>
                    <SelectItem value="published">Published - Live on marketplace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📋 Service Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Service:</strong> {formData.title}</p>
                  <p><strong>Price:</strong> {currentCurrency.symbol}{formData.price}</p>
                  <p><strong>Delivery:</strong> {formData.deliveryTime} days</p>
                  <p><strong>What's included:</strong> {formData.whatsIncluded.length} items</p>
                  <p><strong>Payment methods:</strong> {formData.paymentMethods.join(', ')}</p>
                  <p><strong>Contact:</strong> {formData.contactPreferences.join(', ')}</p>
                  <p><strong>Tags:</strong> {formData.tags.join(', ')}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Ready to publish?</h4>
                <p className="text-sm text-muted-foreground">
                  Your service will be {formData.status === 'published' ? 'immediately live' : 'saved as ' + formData.status} on the marketplace. 
                  You can always edit it later from your pro dashboard.
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
                    {formData.status === 'draft' ? 'Save Draft' : 
                     formData.status === 'pending' ? 'Submit for Review' : 'Publish Service'}
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