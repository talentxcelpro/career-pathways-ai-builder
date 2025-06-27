
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Clock, Users } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const InterviewSchedule = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Calendar className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Interview</h1>
          <p className="text-gray-600">Schedule interviews with candidates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Scheduling</CardTitle>
          <CardDescription>Set up interviews with your candidates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Interview scheduling feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewSchedule;
