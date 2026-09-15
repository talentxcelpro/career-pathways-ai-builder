import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, DollarSign, Crown, TrendingUp } from 'lucide-react';

export const MonetizationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monetization Settings</h2>
          <p className="text-muted-foreground">Configure premium features and pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Crown className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Premium Plans</CardTitle>
            <CardDescription>Configure premium college subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="basic-price">Basic Plan (₹/month)</Label>
              <Input id="basic-price" defaultValue="15000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premium-price">Premium Plan (₹/month)</Label>
              <Input id="premium-price" defaultValue="25000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enterprise-price">Enterprise Plan (₹/month)</Label>
              <Input id="enterprise-price" defaultValue="50000" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-discounts">Enable yearly discounts</Label>
              <Switch id="enable-discounts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Revenue Tracking</CardTitle>
            <CardDescription>Monitor monetization performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">₹0</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Premium Colleges</div>
              </div>
              <div>
                <div className="text-xl font-bold">0%</div>
                <div className="text-xs text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Feature Access</CardTitle>
            <CardDescription>Control premium feature availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="featured-listings">Featured listings</Label>
              <Switch id="featured-listings" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics-access">Analytics dashboard</Label>
              <Switch id="analytics-access" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="priority-support">Priority support</Label>
              <Switch id="priority-support" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="virtual-tours">Virtual tours hosting</Label>
              <Switch id="virtual-tours" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Settings className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Lead Generation</CardTitle>
            <CardDescription>Student inquiry monetization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inquiry-price">Price per inquiry (₹)</Label>
              <Input id="inquiry-price" defaultValue="500" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="qualified-leads">Qualified leads only</Label>
              <Switch id="qualified-leads" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-discounts">Bulk inquiry discounts</Label>
              <Switch id="bulk-discounts" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Monetization Strategy</CardTitle>
          <CardDescription>Revenue streams and business model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">💎 Premium Subscriptions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Featured directory listings</li>
                <li>• Enhanced profile visibility</li>
                <li>• Advanced analytics access</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📧 Lead Generation</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Qualified student inquiries</li>
                <li>• Application lead forwarding</li>
                <li>• Placement opportunity alerts</li>
                <li>• Alumni networking access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 Advertisement Revenue</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sponsored college listings</li>
                <li>• Program promotion slots</li>
                <li>• Event advertisement space</li>
                <li>• Recruitment campaign features</li>
              </ul>
            </div>
          </div>
          <div className="pt-4">
            <Button>Save Monetization Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};