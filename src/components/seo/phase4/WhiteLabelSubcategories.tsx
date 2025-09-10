import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Users, 
  FileText, 
  Globe, 
  Key, 
  Building, 
  CreditCard, 
  Store 
} from 'lucide-react';

const WhiteLabelSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('branding');

  const subcategories = [
    {
      id: 'branding',
      title: 'Custom Branding Options',
      icon: Palette,
      description: 'Customize the platform with your brand identity',
      status: 'active'
    },
    {
      id: 'client-access',
      title: 'Client Dashboard Access',
      icon: Users,
      description: 'Provide clients with branded dashboard access',
      status: 'active'
    },
    {
      id: 'reports',
      title: 'White Label Reports',
      icon: FileText,
      description: 'Generate reports with your company branding',
      status: 'active'
    },
    {
      id: 'domain',
      title: 'Custom Domain Setup',
      icon: Globe,
      description: 'Host the platform on your own domain',
      status: 'beta'
    },
    {
      id: 'api-access',
      title: 'API Access Management',
      icon: Key,
      description: 'Manage API keys and integration access',
      status: 'active'
    },
    {
      id: 'multi-client',
      title: 'Multi-Client Management',
      icon: Building,
      description: 'Manage multiple client accounts and projects',
      status: 'active'
    },
    {
      id: 'billing',
      title: 'Billing & Subscription Management',
      icon: CreditCard,
      description: 'Handle client billing and subscription plans',
      status: 'coming-soon'
    },
    {
      id: 'reseller',
      title: 'Reseller Portal',
      icon: Store,
      description: 'Advanced features for reseller partners',
      status: 'coming-soon'
    }
  ];

  const renderSubcategoryContent = () => {
    const subcategory = subcategories.find(sub => sub.id === activeSubcategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{subcategory?.title}</h3>
            <p className="text-muted-foreground mt-1">{subcategory?.description}</p>
          </div>
          <Badge variant={subcategory?.status === 'active' ? 'default' : 'secondary'}>
            {subcategory?.status?.replace('-', ' ')}
          </Badge>
        </div>

        {activeSubcategory === 'branding' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Customization</CardTitle>
                <CardDescription>Customize the platform appearance with your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Logo</label>
                  <div className="mt-2 border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <div className="text-sm text-muted-foreground">Upload your company logo</div>
                    <Button size="sm" className="mt-2">Choose File</Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Primary Brand Color</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 bg-blue-600 rounded border"></div>
                    <Input value="#3B82F6" className="flex-1" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Secondary Color</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-12 h-12 bg-gray-600 rounded border"></div>
                    <Input value="#6B7280" className="flex-1" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input placeholder="Your Company Name" className="mt-2" />
                </div>
                
                <Button className="w-full">Save Brand Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Preview how your branding will appear</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded"></div>
                    <span className="font-semibold">Your Company SEO Suite</span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-background rounded border">
                      <div className="font-medium">Dashboard Header</div>
                      <div className="text-muted-foreground">With your custom branding</div>
                    </div>
                    
                    <div className="p-3 bg-background rounded border">
                      <div className="font-medium">Report Header</div>
                      <div className="text-muted-foreground">SEO Report for Client Name</div>
                    </div>
                    
                    <div className="p-3 bg-background rounded border">
                      <div className="font-medium">Email Templates</div>
                      <div className="text-muted-foreground">Branded email notifications</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'client-access' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Dashboard Settings</CardTitle>
                <CardDescription>Configure client access and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Enable Client Dashboards</span>
                    <p className="text-sm text-muted-foreground">Allow clients to access their own dashboards</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Real-time Data Access</span>
                    <p className="text-sm text-muted-foreground">Clients see live SEO data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Download Reports</span>
                    <p className="text-sm text-muted-foreground">Allow clients to download reports</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Email Notifications</span>
                    <p className="text-sm text-muted-foreground">Send automated updates to clients</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Dashboard Modules</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Rankings', 'Traffic', 'Keywords', 'Backlinks', 'Reports', 'Competitors'].map(module => (
                      <div key={module} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{module}</span>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Client Dashboards</CardTitle>
                <CardDescription>Manage client dashboard access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'TechCorp Inc.', users: 3, lastAccess: '2 hours ago', status: 'active' },
                    { name: 'Marketing Pro LLC', users: 5, lastAccess: '1 day ago', status: 'active' },
                    { name: 'StartupXYZ', users: 2, lastAccess: '3 days ago', status: 'inactive' },
                    { name: 'Enterprise Solutions', users: 8, lastAccess: '1 hour ago', status: 'active' }
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{client.name}</span>
                        <p className="text-sm text-muted-foreground">{client.users} users • Last access: {client.lastAccess}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <Button size="sm" variant="outline">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full mt-4">Add New Client Dashboard</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'multi-client' && (
          <Card>
            <CardHeader>
              <CardTitle>Multi-Client Management Hub</CardTitle>
              <CardDescription>Centralized management for all your client accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-muted-foreground">Active Clients</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">$42,350</div>
                  <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Client Overview</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Export Data</Button>
                    <Button size="sm">Add New Client</Button>
                  </div>
                </div>
                
                {[
                  { 
                    name: 'TechCorp Inc.', 
                    plan: 'Enterprise', 
                    keywords: 2500, 
                    revenue: '$1,200/mo', 
                    health: 'excellent',
                    projects: 3 
                  },
                  { 
                    name: 'Marketing Pro LLC', 
                    plan: 'Professional', 
                    keywords: 1200, 
                    revenue: '$600/mo', 
                    health: 'good',
                    projects: 2 
                  },
                  { 
                    name: 'StartupXYZ', 
                    plan: 'Starter', 
                    keywords: 500, 
                    revenue: '$200/mo', 
                    health: 'warning',
                    projects: 1 
                  }
                ].map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.plan} Plan • {client.projects} projects</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{client.keywords}</div>
                        <div className="text-muted-foreground">Keywords</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{client.revenue}</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <Badge variant={
                        client.health === 'excellent' ? 'default' :
                        client.health === 'good' ? 'secondary' : 'destructive'
                      }>
                        {client.health}
                      </Badge>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcategories.map((subcategory) => {
          const Icon = subcategory.icon;
          return (
            <Button
              key={subcategory.id}
              variant={activeSubcategory === subcategory.id ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSubcategory(subcategory.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs text-center">{subcategory.title}</span>
            </Button>
          );
        })}
      </div>

      {renderSubcategoryContent()}
    </div>
  );
};

export default WhiteLabelSubcategories;