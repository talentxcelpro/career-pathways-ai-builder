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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Mail,
  CreditCard,
  Shield,
  Tag,
  Briefcase,
  Calendar,
  Settings,
  Sparkles,
  Search,
  BookOpen,
  Users,
  Package,
  Zap,
  Award,
  Target,
  TrendingUp,
  Lightbulb,
  ChevronRight
} from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CategorySelector } from "@/components/marketplace/CategorySelector";
import { ServiceCategory } from "@/types/service";

// Enhanced Rich Text Editor Component
const RichTextEditor = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => {
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="min-h-[150px] resize-none"
      />
      <div className="flex gap-2 text-xs text-muted-foreground">
        <span>💡 Use bullet points, highlight key benefits, and mention your expertise</span>
      </div>
    </div>
  );
};

// SEO Fields Component
const SEOFields = ({ formData, updateFormData }: { formData: any; updateFormData: (field: string, value: any) => void }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-primary" />
        <Label className="text-base font-medium">SEO & Discoverability</Label>
        <Switch
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
          className="ml-auto"
        />
      </div>
      
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>SEO Title (50-60 characters)</Label>
              <Input
                value={formData.seoTitle || ''}
                onChange={(e) => updateFormData('seoTitle', e.target.value)}
                placeholder="Optimized title for search engines"
                maxLength={60}
              />
              <div className="text-xs text-muted-foreground">
                {(formData.seoTitle || '').length}/60 characters
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Meta Description (140-160 characters)</Label>
              <Textarea
                value={formData.metaDescription || ''}
                onChange={(e) => updateFormData('metaDescription', e.target.value)}
                placeholder="Brief description that will appear in search results"
                maxLength={160}
                rows={3}
              />
              <div className="text-xs text-muted-foreground">
                {(formData.metaDescription || '').length}/160 characters
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Focus Keywords (comma-separated)</Label>
              <Input
                value={formData.focusKeywords || ''}
                onChange={(e) => updateFormData('focusKeywords', e.target.value)}
                placeholder="resume writing, career coaching, LinkedIn optimization"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Booking Slots Component
const BookingSlotsManager = ({ formData, updateFormData }: { formData: any; updateFormData: (field: string, value: any) => void }) => {
  const [showBookingSlots, setShowBookingSlots] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <Label className="text-base font-medium">Booking & Availability</Label>
        <Switch
          checked={showBookingSlots}
          onCheckedChange={setShowBookingSlots}
          className="ml-auto"
        />
      </div>
      
      <AnimatePresence>
        {showBookingSlots && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Available Slots per Month</Label>
                <Input
                  type="number"
                  value={formData.availableSlots || ''}
                  onChange={(e) => updateFormData('availableSlots', parseInt(e.target.value))}
                  placeholder="e.g., 20"
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Booking Buffer (Days)</Label>
                <Select 
                  value={formData.bookingBuffer || '1'} 
                  onValueChange={(value) => updateFormData('bookingBuffer', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Same day</SelectItem>
                    <SelectItem value="1">1 day notice</SelectItem>
                    <SelectItem value="2">2 days notice</SelectItem>
                    <SelectItem value="3">3 days notice</SelectItem>
                    <SelectItem value="7">1 week notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Working Days</Label>
              <div className="grid grid-cols-4 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <label key={day} className="flex items-center space-x-2">
                    <Checkbox
                      checked={(formData.workingDays || []).includes(day)}
                      onCheckedChange={(checked) => {
                        const current = formData.workingDays || [];
                        const updated = checked 
                          ? [...current, day]
                          : current.filter((d: string) => d !== day);
                        updateFormData('workingDays', updated);
                      }}
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Auto-Accept Bookings</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.autoAcceptBookings || false}
                  onCheckedChange={(checked) => updateFormData('autoAcceptBookings', checked)}
                />
                <span className="text-sm text-muted-foreground">
                  Automatically accept bookings without manual review
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add-ons System Component
const AddOnsManager = ({ formData, updateFormData }: { formData: any; updateFormData: (field: string, value: any) => void }) => {
  const [newAddon, setNewAddon] = useState({ name: '', price: '', description: '' });
  
  const addAddon = () => {
    if (newAddon.name && newAddon.price) {
      const addon = {
        id: Date.now(),
        name: newAddon.name,
        price: parseFloat(newAddon.price),
        description: newAddon.description
      };
      updateFormData('addOns', [...(formData.addOns || []), addon]);
      setNewAddon({ name: '', price: '', description: '' });
    }
  };
  
  const removeAddon = (id: number) => {
    updateFormData('addOns', (formData.addOns || []).filter((addon: any) => addon.id !== id));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <Label className="text-base font-medium">Optional Add-ons</Label>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Add-on Name</Label>
            <Input
              value={newAddon.name}
              onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
              placeholder="e.g., Priority Delivery"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Additional Price</Label>
            <Input
              type="number"
              value={newAddon.price}
              onChange={(e) => setNewAddon({ ...newAddon, price: e.target.value })}
              placeholder="199"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={newAddon.description}
              onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
              placeholder="48-hour delivery"
            />
          </div>
        </div>
        
        <Button type="button" onClick={addAddon} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
        
        {formData.addOns && formData.addOns.length > 0 && (
          <div className="space-y-2">
            <Label>Current Add-ons</Label>
            <div className="space-y-2">
              {formData.addOns.map((addon: any) => (
                <div key={addon.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{addon.name}</div>
                    <div className="text-sm text-muted-foreground">
                      +₹{addon.price} • {addon.description}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddon(addon.id)}
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
  );
};

// Category-specific suggestions
const getCategorySpecificSuggestions = (category: ServiceCategory | null) => {
  if (!category) return null;
  
  const suggestions = {
    'Career & Resume Services': {
      whatsIncluded: ['ATS Optimization', 'Keyword Integration', 'Professional Formatting', 'Multiple Revisions', 'LinkedIn Profile Tips'],
      tags: ['resume', 'career', 'ATS', 'LinkedIn', 'professional'],
      pricing: { min: 999, max: 4999, suggested: 1999 }
    },
    'Coaching & Mentorship': {
      whatsIncluded: ['1-on-1 Session', 'Action Plan', 'Follow-up Support', 'Resource Materials', 'Progress Tracking'],
      tags: ['coaching', 'mentorship', 'career guidance', 'personal development'],
      pricing: { min: 1999, max: 9999, suggested: 3999 }
    },
    'Tech & Development': {
      whatsIncluded: ['Source Code', 'Documentation', 'Testing', 'Deployment Guide', 'Technical Support'],
      tags: ['development', 'coding', 'tech', 'programming', 'software'],
      pricing: { min: 2999, max: 19999, suggested: 7999 }
    }
  };
  
  return suggestions[category.name as keyof typeof suggestions] || null;
};

// Main Enhanced Service Form Component
interface EnhancedServiceFormProps {
  serviceId?: string | null;
  onCancel: () => void;
  onSaved: () => void;
}

interface FormData {
  // Basic Info
  profilePictureUrl: string;
  profileLink: string;
  title: string;
  professionalTitle: string;
  experience: string;
  location: string;
  description: string;
  
  // Service Details
  whatsIncluded: string[];
  clientRequirements: string;
  deliveryTime: number;
  price: string;
  currency: string;
  
  // Payment & Contact
  paymentMethods: string[];
  contactPreferences: string[];
  
  // SEO & Marketing
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string;
  
  // Booking & Availability
  availableSlots: number;
  bookingBuffer: string;
  workingDays: string[];
  autoAcceptBookings: boolean;
  
  // Add-ons
  addOns: any[];
  
  // Portfolio & Tags
  tags: string[];
  portfolioItems: any[];
  
  // Category
  categoryId: string;
  subcategoryId: string;
  
  // Status
  status: 'draft' | 'pending' | 'published';
}

const INITIAL_FORM_DATA: FormData = {
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
  seoTitle: '',
  metaDescription: '',
  focusKeywords: '',
  availableSlots: 10,
  bookingBuffer: '1',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  autoAcceptBookings: false,
  addOns: [],
  tags: [],
  portfolioItems: [],
  categoryId: '',
  subcategoryId: '',
  status: 'draft'
};

const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' }
];

const PAYMENT_METHODS = [
  'UPI', 'Razorpay', 'Stripe', 'PayPal', 'Bank Transfer', 'Crypto'
];

const CONTACT_PREFERENCES = [
  'Email', 'Phone', 'Website'
];

export default function EnhancedServiceForm({ serviceId, onCancel, onSaved }: EnhancedServiceFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceCategory | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload({ bucket: 'portfolio' });
  
  const totalSteps = 7;
  const currentCurrency = CURRENCIES.find(c => c.value === formData.currency) || CURRENCIES[0];

  useEffect(() => {
    if (user) {
      const profileLink = `https://talentxcel.in/profile/user/${user.id}`;
      updateFormData('profileLink', profileLink);
      updateFormData('profilePictureUrl', `https://talentxcel.in/profile/user/${user.id}/avatar`);
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, title, location')
        .eq('id', user.id)
        .single();

      if (data) {
        updateFormData('professionalTitle', data.title || data.full_name || '');
        updateFormData('location', data.location || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof FormData, item: string) => {
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

  const applyCategorySuggestions = (category: ServiceCategory) => {
    const suggestions = getCategorySpecificSuggestions(category);
    if (suggestions) {
      // Auto-suggest what's included
      if (formData.whatsIncluded.length === 0) {
        updateFormData('whatsIncluded', suggestions.whatsIncluded);
      }
      
      // Auto-suggest tags
      if (formData.tags.length === 0) {
        updateFormData('tags', suggestions.tags);
      }
      
      // Auto-suggest pricing
      if (!formData.price) {
        updateFormData('price', suggestions.pricing.suggested.toString());
      }
    }
  };

  const handleCategoryChange = (categoryId: string, category: ServiceCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    updateFormData('categoryId', categoryId);
    updateFormData('subcategoryId', '');
    applyCategorySuggestions(category);
  };

  const handleSubcategoryChange = (subcategoryId: string, subcategory: ServiceCategory) => {
    setSelectedSubcategory(subcategory);
    updateFormData('subcategoryId', subcategoryId);
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
    
    setIsSubmitting(true);
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
        category_id: formData.categoryId,
        subcategory_id: formData.subcategoryId || null,
        status: formData.status,
        is_active: true,
        // SEO fields
        seo_title: formData.seoTitle,
        meta_description: formData.metaDescription,
        focus_keywords: formData.focusKeywords,
        // Booking fields
        available_slots: formData.availableSlots,
        booking_buffer: formData.bookingBuffer,
        working_days: formData.workingDays,
        auto_accept_bookings: formData.autoAcceptBookings,
        // Add-ons
        add_ons: formData.addOns
      };

      const { error } = await supabase
        .from('services')
        .insert([serviceData]);

      if (error) throw error;

      toast({
        title: "Service Created Successfully!",
        description: "Your service has been created and is now available on the marketplace.",
      });
      
      onSaved();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Service Category & Basic Info</h3>
            </div>
            
            <CategorySelector
              selectedCategoryId={formData.categoryId}
              selectedSubcategoryId={formData.subcategoryId}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Professional Resume Writing & ATS Optimization"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Your Professional Title *</Label>
                <Input
                  value={formData.professionalTitle}
                  onChange={(e) => updateFormData('professionalTitle', e.target.value)}
                  placeholder="e.g., Senior HR Consultant"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Years of Experience *</Label>
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
                <Label>Location *</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g., Mumbai, India"
                />
              </div>
            </div>
            
            {selectedCategory && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h4 className="font-medium text-primary mb-2">Category Suggestions Applied</h4>
                <p className="text-sm text-muted-foreground">
                  We've pre-filled some fields based on your selected category. You can customize them in the next steps.
                </p>
              </div>
            )}
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Service Description</h3>
            </div>
            
            <div className="space-y-2">
              <Label>Service Description *</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => updateFormData('description', value)}
                placeholder="Describe your service in detail. Highlight your expertise, what makes you unique, and the value clients will receive..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>What's Included * (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {selectedCategory && getCategorySpecificSuggestions(selectedCategory)?.whatsIncluded.map((option) => (
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
              <Label>Client Requirements *</Label>
              <Textarea
                value={formData.clientRequirements}
                onChange={(e) => updateFormData('clientRequirements', e.target.value)}
                placeholder="What do you need from clients to get started? e.g., Current resume, target roles, industry preferences..."
                rows={3}
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Pricing & Delivery</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">
                    {currentCurrency.symbol}
                  </span>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    placeholder="1999"
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Currency *</Label>
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
              
              <div className="space-y-2">
                <Label>Delivery Time *</Label>
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
            </div>
            
            <div className="space-y-2">
              <Label>Payment Methods *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
            
            <AddOnsManager formData={formData} updateFormData={updateFormData} />
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Contact & Communication</h3>
            </div>
            
            <div className="space-y-2">
              <Label>Contact Preferences *</Label>
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
            
            <BookingSlotsManager formData={formData} updateFormData={updateFormData} />
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Tags & Keywords</h3>
            </div>
            
            <div className="space-y-2">
              <Label>Tags / Keywords (for search & filtering)</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g., resume, career, ATS"
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
            
            <SEOFields formData={formData} updateFormData={updateFormData} />
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Portfolio & Showcase</h3>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload samples of your work (PDFs, images, documents)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={async (e) => {
                    const files = e.target.files;
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
                        toast({
                          title: "File uploaded successfully",
                          description: `${file.name} has been added to your portfolio.`,
                        });
                      } catch (error) {
                        toast({
                          title: "Upload failed",
                          description: `Failed to upload ${file.name}. Please try again.`,
                          variant: "destructive",
                        });
                      }
                    }
                  }}
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
              
              {formData.portfolioItems.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.portfolioItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          updateFormData('portfolioItems', formData.portfolioItems.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Review & Publish</h3>
            </div>
            
            <div className="space-y-2">
              <Label>Publication Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'draft' | 'pending' | 'published') => updateFormData('status', value)}
              >
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p><strong>Service:</strong> {formData.title}</p>
                  <p><strong>Category:</strong> {selectedCategory?.name}</p>
                  <p><strong>Price:</strong> {currentCurrency.symbol}{formData.price}</p>
                  <p><strong>Delivery:</strong> {formData.deliveryTime} days</p>
                </div>
                <div className="space-y-1">
                  <p><strong>What's included:</strong> {formData.whatsIncluded.length} items</p>
                  <p><strong>Payment methods:</strong> {formData.paymentMethods.length} options</p>
                  <p><strong>Tags:</strong> {formData.tags.length} keywords</p>
                  <p><strong>Portfolio:</strong> {formData.portfolioItems.length} items</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ready to go live?
              </h4>
              <p className="text-sm text-muted-foreground">
                Your service will be {formData.status === 'published' ? 'immediately live' : 'saved as ' + formData.status} on the marketplace. 
                You can always edit it later from your provider dashboard.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Enhanced Service Creation
            </span>
          </CardTitle>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep 
                    ? 'bg-gradient-to-r from-primary to-primary/80' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </p>
            <div className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
          
          <Separator className="my-8" />
          
          <div className="flex justify-between items-center">
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
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                {currentStep === totalSteps ? (
                  <>
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Creating...' : 
                     formData.status === 'draft' ? 'Save Draft' : 
                     formData.status === 'pending' ? 'Submit for Review' : 'Publish Service'}
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}