import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Camera, Users, MapPin, Eye, TrendingUp } from "lucide-react";

export const EnhancedCompanyProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              TC
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">TechCorp Solutions</h1>
              <p className="text-muted-foreground">Leading AI & Software Development Company</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Bangalore, India</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">1250+ employees</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">8,940</p>
            <p className="text-xs text-muted-foreground">Profile Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Active Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">456</p>
            <p className="text-xs text-muted-foreground">Applicants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">+23%</p>
            <p className="text-xs text-muted-foreground">Growth</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Camera className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">4.2</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
            <p className="text-2xl font-bold">1250+</p>
            <p className="text-xs text-muted-foreground">Employees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage your company profile and information.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Profile Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View detailed analytics about your company profile.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure your company profile settings.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};