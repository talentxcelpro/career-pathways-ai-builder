import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Phone,
  Mail,
  Globe,
  Plus,
  X
} from "lucide-react";

interface ServiceFormData {
  title: string;
  professional_title: string;
  years_experience: string;
  location: string;
  description: string;
  whats_included: string[];
  client_requirements: string;
  delivery_time_days: number;
  price: number;
  currency: string;
  payment_methods: string[];
  contact_email: boolean;
  contact_phone: boolean;
  contact_website: boolean;
  website_url: string;
  phone_number: string;
  tags: string[];
  category_id?: string;
}

export const ProSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newIncludeItem, setNewIncludeItem] = useState('');
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    professional_title: '',
    years_experience: '',
    location: '',
    description: '',
    whats_included: [],
    client_requirements: '',
    delivery_time_days: 7,
    price: 0,
    currency: 'INR',
    payment_methods: [],
    contact_email: true,
    contact_phone: false,
    contact_website: false,
    website_url: '',
    phone_number: '',
    tags: [],
  });

  const currencies = [
    { value: 'INR', label: '₹ Indian Rupee' },
    { value: 'USD', label: '$ US Dollar' },
    { value: 'EUR', label: '€ Euro' },
    { value: 'GBP', label: '£ British Pound' }
  ];

  const paymentMethods = [
    'bank_transfer',
    'upi',
    'razorpay',
    'paypal',
    'crypto',
    'international_wire'
  ];

  const experienceLevels = [
    '1-2 years',
    '3-5 years',
    '5+ years',
    '7+ years',
    '10+ years'
  ];

  const addIncludeItem = () => {
    if (newIncludeItem.trim()) {
      setFormData(prev => ({
        ...prev,
        whats_included: [...prev.whats_included, newIncludeItem.trim()]
      }));
      setNewIncludeItem('');
    }
  };

  const removeIncludeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whats_included: prev.whats_included.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a service.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .insert({
          provider_id: user.id,
          title: formData.title,
          professional_title: formData.professional_title,
          years_experience: formData.years_experience,
          location: formData.location,
          description: formData.description,
          whats_included: formData.whats_included,
          client_requirements: formData.client_requirements,
          delivery_time_days: formData.delivery_time_days,
          price: formData.price,
          currency: formData.currency,
          payment_methods: formData.payment_methods,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          contact_website: formData.contact_website,
          website_url: formData.website_url,
          phone_number: formData.phone_number,
          tags: formData.tags,
          is_active: true,
          is_featured: false,
          status: 'published',
          average_rating: 0,
          total_reviews: 0,
          total_orders: 0,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your service has been created successfully.",
      });

      navigate('/pro');
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.title && formData.professional_title && formData.location;
      case 2:
        return formData.description && formData.whats_included.length > 0;
      case 3:
        return formData.price > 0 && formData.payment_methods.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Set Up Your Professional Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Create your service listing and start connecting with clients
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= stepNumber 
                  ? 'bg-primary text-white' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step > stepNumber ? <CheckCircle className="h-5 w-5" /> : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${step > stepNumber ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">
              {step === 1 && "Basic Information"}
              {step === 2 && "Service Details"}
              {step === 3 && "Pricing & Payment"}
              {step === 4 && "Contact & Preferences"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Service Title</label>
                  <Input
                    placeholder="e.g., Professional Resume Writing & Career Coaching"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Professional Title</label>
                  <Input
                    placeholder="e.g., Senior Career Coach & Resume Expert"
                    value={formData.professional_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, professional_title: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                    <Select value={formData.years_experience} onValueChange={(value) => setFormData(prev => ({ ...prev, years_experience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="e.g., Mumbai, India"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Service Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Service Description</label>
                  <Textarea
                    placeholder="Describe your service in detail. What makes you unique? What problems do you solve?"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">What's Included in Your Service</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Professional resume review and optimization"
                        value={newIncludeItem}
                        onChange={(e) => setNewIncludeItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addIncludeItem()}
                      />
                      <Button onClick={addIncludeItem} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.whats_included.map((item, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {item}
                          <button onClick={() => removeIncludeItem(index)} className="ml-2">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Client Requirements</label>
                  <Textarea
                    placeholder="What do you need from clients to deliver your service effectively?"
                    rows={3}
                    value={formData.client_requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_requirements: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Service Tags</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., resume-writing, career-coaching"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {tag}
                          <button onClick={() => removeTag(index)} className="ml-2">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Currency</label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Delivery Time (Days)</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.delivery_time_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_time_days: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Methods</label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map(method => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.payment_methods.includes(method)}
                          onChange={() => handlePaymentMethodToggle(method)}
                          className="rounded"
                        />
                        <label className="text-sm capitalize">
                          {method.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact & Preferences */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Preferences</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.contact_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.checked }))}
                      />
                      <Mail className="h-4 w-4" />
                      <label>Available via Email</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.contact_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.checked }))}
                      />
                      <Phone className="h-4 w-4" />
                      <label>Available via Phone</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.contact_website}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_website: e.target.checked }))}
                      />
                      <Globe className="h-4 w-4" />
                      <label>Available via Website</label>
                    </div>
                  </div>
                </div>

                {formData.contact_phone && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                    <Input
                      placeholder="+91-9876543210"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    />
                  </div>
                )}

                {formData.contact_website && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Website URL</label>
                    <Input
                      placeholder="https://yourwebsite.com"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            )}

            <Separator className="my-6" />

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 4 ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepValid(step)}
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Creating Service...' : 'Create Service'}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProSetup;