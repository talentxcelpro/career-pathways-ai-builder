import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Eye, 
  Plus, 
  X, 
  CreditCard,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Crown,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CreatePlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [planData, setPlanData] = useState({
    name: '',
    description: '',
    price: 0,
    billing_cycle: 'monthly',
    is_active: true,
    is_popular: false,
    features: [],
    limits: {
      job_applications: -1, // -1 for unlimited
      resume_downloads: -1,
      ai_recommendations: -1,
      premium_support: false,
      analytics_access: false,
      api_access: false,
      team_members: 1
    },
    stripe_price_id: '',
    trial_days: 0
  });

  const [newFeature, setNewFeature] = useState('');

  const billingCycles = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Annually' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'lifetime', label: 'Lifetime' }
  ];

  const planTemplates = [
    {
      name: 'Basic',
      price: 0,
      features: ['5 Job Applications', 'Basic Resume Builder', 'Job Alerts', 'Email Support'],
      limits: { job_applications: 5, resume_downloads: 3, ai_recommendations: 10 }
    },
    {
      name: 'Pro',
      price: 29,
      features: ['Unlimited Applications', 'Advanced Resume Builder', 'AI Job Matching', 'Priority Support', 'Analytics Dashboard'],
      limits: { job_applications: -1, resume_downloads: -1, ai_recommendations: -1, premium_support: true, analytics_access: true }
    },
    {
      name: 'Enterprise',
      price: 99,
      features: ['All Pro Features', 'Team Management', 'Custom Integrations', 'Dedicated Support', 'Advanced Analytics', 'API Access'],
      limits: { job_applications: -1, resume_downloads: -1, ai_recommendations: -1, premium_support: true, analytics_access: true, api_access: true, team_members: 10 }
    }
  ];

  const applyTemplate = (template: any) => {
    setPlanData(prev => ({
      ...prev,
      name: template.name,
      price: template.price,
      features: [...template.features],
      limits: { ...prev.limits, ...template.limits },
      is_popular: template.name === 'Pro'
    }));
  };

  const handleFeatureAdd = () => {
    if (newFeature.trim()) {
      setPlanData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleFeatureRemove = (index: number) => {
    setPlanData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!planData.name || planData.price < 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!user) {
        toast.error('You must be logged in to create a pricing plan');
        return;
      }

      // Insert pricing plan into database
      const { data, error } = await supabase
        .from('pricing_plans')
        .insert([{
          name: planData.name,
          description: planData.description,
          price: planData.price,
          billing_cycle: planData.billing_cycle,
          is_active: planData.is_active,
          is_popular: planData.is_popular,
          features: planData.features,
          limits: planData.limits,
          stripe_price_id: planData.stripe_price_id,
          trial_days: planData.trial_days,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      toast.success('Pricing plan created successfully!');
      navigate('/admin/payments');
    } catch (error: any) {
      console.error('Error creating pricing plan:', error);
      toast.error(error?.message || 'Failed to create pricing plan');
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    window.open('/pricing/preview', '_blank');
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('unlimited') || feature.toLowerCase().includes('advanced')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (feature.toLowerCase().includes('support')) {
      return <Users className="h-4 w-4 text-blue-600" />;
    }
    if (feature.toLowerCase().includes('api') || feature.toLowerCase().includes('integration')) {
      return <Zap className="h-4 w-4 text-purple-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  return (
    <AdminGuard requiredPermission="canAccessDashboard">
      <UnifiedAdminLayout 
        title="Create New Pricing Plan" 
        description="Add a new subscription plan to the platform"
      >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Pricing Plan Creation</h2>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>
        </div>

        {/* Quick Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planTemplates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {template.name === 'Pro' && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <p className="text-2xl font-bold mb-2">
                    ${template.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {template.features.length} features included
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Name *</label>
                <Input
                  placeholder="e.g., Pro, Enterprise, Basic"
                  value={planData.name}
                  onChange={(e) => setPlanData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Cycle</label>
                <Select value={planData.billing_cycle} onValueChange={(value) => setPlanData(prev => ({ ...prev, billing_cycle: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycles.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of what this plan offers"
                value={planData.description}
                onChange={(e) => setPlanData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0"
                    className="pl-10"
                    value={planData.price}
                    onChange={(e) => setPlanData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trial Days</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={planData.trial_days}
                  onChange={(e) => setPlanData(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stripe Price ID</label>
                <Input
                  placeholder="price_xxxxxxxxxxxxx"
                  value={planData.stripe_price_id}
                  onChange={(e) => setPlanData(prev => ({ ...prev, stripe_price_id: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={planData.is_active}
                    onCheckedChange={(checked) => setPlanData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <label className="text-sm font-medium">Active Plan</label>
                </div>
                <p className="text-xs text-muted-foreground">Make this plan available for purchase</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={planData.is_popular}
                    onCheckedChange={(checked) => setPlanData(prev => ({ ...prev, is_popular: checked }))}
                  />
                  <label className="text-sm font-medium">Popular Plan</label>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-xs text-muted-foreground">Highlight this plan as most popular</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature (e.g., Unlimited job applications)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFeatureAdd()}
              />
              <Button onClick={handleFeatureAdd}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {planData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFeatureIcon(feature)}
                    <span className="text-sm">{feature}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeatureRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Limits & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Applications</label>
                <Select 
                  value={planData.limits.job_applications.toString()} 
                  onValueChange={(value) => setPlanData(prev => ({ 
                    ...prev, 
                    limits: { ...prev.limits, job_applications: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Unlimited</SelectItem>
                    <SelectItem value="5">5 per month</SelectItem>
                    <SelectItem value="10">10 per month</SelectItem>
                    <SelectItem value="25">25 per month</SelectItem>
                    <SelectItem value="50">50 per month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resume Downloads</label>
                <Select 
                  value={planData.limits.resume_downloads.toString()} 
                  onValueChange={(value) => setPlanData(prev => ({ 
                    ...prev, 
                    limits: { ...prev.limits, resume_downloads: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Unlimited</SelectItem>
                    <SelectItem value="3">3 per month</SelectItem>
                    <SelectItem value="10">10 per month</SelectItem>
                    <SelectItem value="25">25 per month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Recommendations</label>
                <Select 
                  value={planData.limits.ai_recommendations.toString()} 
                  onValueChange={(value) => setPlanData(prev => ({ 
                    ...prev, 
                    limits: { ...prev.limits, ai_recommendations: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Unlimited</SelectItem>
                    <SelectItem value="10">10 per month</SelectItem>
                    <SelectItem value="50">50 per month</SelectItem>
                    <SelectItem value="100">100 per month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Members</label>
                <Input
                  type="number"
                  min="1"
                  value={planData.limits.team_members}
                  onChange={(e) => setPlanData(prev => ({ 
                    ...prev, 
                    limits: { ...prev.limits, team_members: parseInt(e.target.value) || 1 }
                  }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Additional Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Premium Support</p>
                    <p className="text-xs text-muted-foreground">Priority customer support</p>
                  </div>
                  <Switch
                    checked={planData.limits.premium_support}
                    onCheckedChange={(checked) => setPlanData(prev => ({ 
                      ...prev, 
                      limits: { ...prev.limits, premium_support: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Analytics Access</p>
                    <p className="text-xs text-muted-foreground">Advanced analytics dashboard</p>
                  </div>
                  <Switch
                    checked={planData.limits.analytics_access}
                    onCheckedChange={(checked) => setPlanData(prev => ({ 
                      ...prev, 
                      limits: { ...prev.limits, analytics_access: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">API Access</p>
                    <p className="text-xs text-muted-foreground">RESTful API access</p>
                  </div>
                  <Switch
                    checked={planData.limits.api_access}
                    onCheckedChange={(checked) => setPlanData(prev => ({ 
                      ...prev, 
                      limits: { ...prev.limits, api_access: checked }
                    }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`relative border-2 rounded-lg p-6 ${planData.is_popular ? 'border-primary' : 'border-border'}`}>
              {planData.is_popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Crown className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">{planData.name || 'Plan Name'}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">${planData.price}</span>
                  <span className="text-muted-foreground">/{planData.billing_cycle}</span>
                </div>
                {planData.trial_days > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {planData.trial_days} days free trial
                  </p>
                )}
              </div>
              
              <div className="space-y-3">
                {planData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-6" disabled>
                Choose {planData.name || 'Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
    </AdminGuard>
  );
};

export default CreatePlan;