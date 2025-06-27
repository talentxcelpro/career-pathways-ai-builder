
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const JobClose = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleClose = () => {
    // Simulate closing job
    navigate('/jobs/manage');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <XCircle className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Close Job Post</h1>
          <p className="text-gray-600">Close this job posting to new applications</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Close Job Posting
          </CardTitle>
          <CardDescription>This action will stop accepting new applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Closing this job will:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Stop accepting new applications</li>
            <li>Hide the job from search results</li>
            <li>Preserve existing applications and data</li>
            <li>Allow you to reopen later if needed</li>
          </ul>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate(`/jobs/manage/${id}`)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClose}>
              <XCircle className="h-4 w-4 mr-2" />
              Close Job
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobClose;
