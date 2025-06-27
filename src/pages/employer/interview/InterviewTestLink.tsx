
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const InterviewTestLink = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Link className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Send Test Link</h1>
          <p className="text-gray-600">Send assessment links to candidates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Links</CardTitle>
          <CardDescription>Send technical assessments to candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Link className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Assessment link feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewTestLink;
