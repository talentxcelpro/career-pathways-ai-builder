import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building, 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  Crown,
  Lock,
  Globe,
  Zap,
  UserCheck,
  FileText,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Upload,
  Database,
  Cloud,
  Cpu,
  HardDrive
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastActive: string;
  permissions: string[];
}

interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    users: number;
    storage: number;
    exports: number;
    integrations: number;
  };
}

export const EnterpriseFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlan, setSelectedPlan] = useState('enterprise');

  // Mock data
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'HR Manager',
      department: 'Human Resources',
      lastActive: '2024-01-15T10:30:00Z',
      permissions: ['view_all_resumes', 'export_data', 'manage_team']
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Recruiter',
      department: 'Talent Acquisition',
      lastActive: '2024-01-15T09:45:00Z',
      permissions: ['view_resumes', 'contact_candidates']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'Admin',
      department: 'IT',
      lastActive: '2024-01-15T11:20:00Z',
      permissions: ['full_access', 'system_admin', 'billing_admin']
    }
  ]);

  const [billingPlans] = useState<BillingPlan[]>([
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small teams',
      price: 49,
      features: ['Basic Resume Builder', 'PDF Export', 'Email Support'],
      limits: {
        users: 5,
        storage: 10,
        exports: 100,
        integrations: 2
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing businesses',
      price: 149,
      features: ['Advanced Templates', 'Team Collaboration', 'Priority Support', 'Basic Analytics'],
      limits: {
        users: 25,
        storage: 100,
        exports: 500,
        integrations: 5
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 499,
      features: ['Custom Branding', 'Advanced Analytics', 'SSO Integration', 'Dedicated Support', 'Custom Integrations'],
      limits: {
        users: 500,
        storage: 1000,
        exports: 10000,
        integrations: 50
      }
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Enterprise Dashboard
          </h1>
          <p className="text-gray-600">Advanced features and controls for enterprise customers</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Enterprise Plan
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342 GB</div>
            <p className="text-xs text-muted-foreground">
              34% of 1TB limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>Real-time system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[23%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full w-[67%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Database Load</span>
                      <span>31%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[31%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Enterprise Activity</CardTitle>
                <CardDescription>Latest actions across your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span>New user added to HR department</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Download className="h-4 w-4 text-blue-500" />
                    <span>Bulk resume export completed</span>
                    <span className="text-muted-foreground">4 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <span>Security audit completed</span>
                    <span className="text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>Integration settings updated</span>
                    <span className="text-muted-foreground">2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most used enterprise features this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resume Builder</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-20">
                        <div className="bg-blue-600 h-2 rounded-full w-[85%]" />
                      </div>
                      <span className="text-xs">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Team Collaboration</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-20">
                        <div className="bg-green-600 h-2 rounded-full w-[72%]" />
                      </div>
                      <span className="text-xs">72%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Analytics Dashboard</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-20">
                        <div className="bg-yellow-600 h-2 rounded-full w-[58%]" />
                      </div>
                      <span className="text-xs">58%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Integration</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-200 rounded-full h-2 w-20">
                        <div className="bg-purple-600 h-2 rounded-full w-[43%]" />
                      </div>
                      <span className="text-xs">43%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support & Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Support & Resources</CardTitle>
                <CardDescription>Enterprise support and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Dedicated Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Live Chat with Experts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Enterprise Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Training Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Team Management</h2>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Invite Team Member
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
              <CardDescription>Manage your organization's team members and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                          <Badge variant="outline" className="text-xs">{member.department}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Last active: {new Date(member.lastActive).toLocaleDateString()}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Management */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure what each role can access and do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">HR Manager</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View All Resumes</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Export Data</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manage Team</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Recruiter</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View Resumes</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Contact Candidates</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Export Data</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Admin</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Full Access</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">System Admin</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Billing Admin</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            {/* SSO Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Single Sign-On (SSO)
                </CardTitle>
                <CardDescription>Configure enterprise SSO authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable SSO</p>
                    <p className="text-sm text-muted-foreground">Allow users to sign in with your identity provider</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Identity Provider</label>
                    <Select defaultValue="azure">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="azure">Azure AD</SelectItem>
                        <SelectItem value="okta">Okta</SelectItem>
                        <SelectItem value="google">Google Workspace</SelectItem>
                        <SelectItem value="saml">Custom SAML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Domain</label>
                    <Input placeholder="company.com" className="mt-1" />
                  </div>
                </div>
                <Button>Configure SSO</Button>
              </CardContent>
            </Card>

            {/* Security Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Security Policies</CardTitle>
                <CardDescription>Configure organization-wide security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for all team members</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">IP Whitelisting</p>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <Select defaultValue="4">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Monitor all security-related activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">User login successful</p>
                        <p className="text-xs text-muted-foreground">sarah.johnson@company.com</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Failed login attempt</p>
                        <p className="text-xs text-muted-foreground">unknown@domain.com</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">3 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Security settings updated</p>
                        <p className="text-xs text-muted-foreground">admin@company.com</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Analytics</CardTitle>
              <CardDescription>Advanced insights and reporting for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-muted-foreground">Resumes Created</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">89%</div>
                  <div className="text-sm text-muted-foreground">Team Adoption Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">456</div>
                  <div className="text-sm text-muted-foreground">Exports This Month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid gap-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your current subscription and usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Enterprise Plan</h3>
                    <p className="text-sm text-muted-foreground">$499/month • Billed annually</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Users</p>
                    <p className="text-lg font-medium">247/500</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="text-lg font-medium">342GB/1TB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exports</p>
                    <p className="text-lg font-medium">2,847/10,000</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Integrations</p>
                    <p className="text-lg font-medium">12/50</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Upgrade or change your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {billingPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`p-4 border rounded-lg ${selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : ''}`}
                    >
                      <div className="text-center">
                        <h3 className="font-medium">{plan.name}</h3>
                        <p className="text-2xl font-bold">${plan.price}</p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant={selectedPlan === plan.id ? "default" : "outline"} 
                        className="w-full mt-4"
                        disabled={selectedPlan === plan.id}
                      >
                        {selectedPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Integrations</CardTitle>
              <CardDescription>Connect with your existing enterprise tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium">HRIS Integration</h3>
                        <p className="text-sm text-muted-foreground">Sync with your HR systems</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-8 w-8 text-green-500" />
                      <div>
                        <h3 className="font-medium">Email Platform</h3>
                        <p className="text-sm text-muted-foreground">Connect with your email system</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};