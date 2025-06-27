
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CompanyJobs = () => {
  const navigate = useNavigate();

  const publicJobs = [
    {
      id: "1",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      status: "Active",
      applications: 47
    },
    {
      id: "2", 
      title: "Product Manager",
      location: "Remote",
      status: "Active",
      applications: 23
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer/profile')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Briefcase className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Public Job Listings</h1>
          <p className="text-gray-600">Jobs visible on your company profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Job Openings</CardTitle>
          <CardDescription>Jobs that appear on your public company profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {publicJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-gray-600">{job.location}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-100 text-green-800">{job.status}</Badge>
                  <span className="text-sm text-gray-500">{job.applications} applications</span>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyJobs;
