
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CompanyProfileEdit = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer/profile')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Company Profile</h1>
          <p className="text-gray-600">Update your company information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Edit your company's public profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" placeholder="Your Company Name" />
          </div>
          <div>
            <Label htmlFor="description">Company Description</Label>
            <Textarea id="description" placeholder="Describe your company..." rows={4} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://yourcompany.com" />
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfileEdit;
