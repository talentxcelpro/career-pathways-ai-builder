
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, ArrowLeft, Save } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CompanySocials = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer/profile')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Share2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Links</h1>
          <p className="text-gray-600">Manage your company's social media presence</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Add your company's social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" placeholder="https://linkedin.com/company/yourcompany" />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input id="twitter" placeholder="https://twitter.com/yourcompany" />
          </div>
          <div>
            <Label htmlFor="glassdoor">Glassdoor</Label>
            <Input id="glassdoor" placeholder="https://glassdoor.com/Overview/Working-at-yourcompany" />
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Links
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySocials;
