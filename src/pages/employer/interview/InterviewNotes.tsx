
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const InterviewNotes = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Notes</h1>
          <p className="text-gray-600">Record interview feedback and evaluations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Feedback</CardTitle>
          <CardDescription>Track interview evaluations and notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Interview notes feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewNotes;
