
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const JobEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Edit className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job Post</h1>
          <p className="text-gray-600">Update your job posting details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
          <CardDescription>Edit your job posting details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" defaultValue="Senior Software Engineer" />
          </div>
          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea id="description" rows={8} defaultValue="Job description content..." />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(`/jobs/manage/${id}`)}>
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobEdit;
