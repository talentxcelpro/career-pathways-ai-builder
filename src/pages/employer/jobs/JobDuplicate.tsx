
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const JobDuplicate = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleDuplicate = () => {
    // Simulate duplication
    navigate('/jobs/post/success', { 
      state: { 
        jobData: { title: "Senior Software Engineer (Copy)" },
        duplicated: true 
      } 
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Copy className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Duplicate Job Post</h1>
          <p className="text-gray-600">Create a copy of this job posting</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Duplicate Job Posting</CardTitle>
          <CardDescription>This will create an exact copy of the current job post</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Are you sure you want to duplicate this job posting? A new draft will be created with all the same details.</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(`/jobs/manage/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Job
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobDuplicate;
