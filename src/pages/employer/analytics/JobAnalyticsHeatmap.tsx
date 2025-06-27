
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const JobAnalyticsHeatmap = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}/analytics`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Activity className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Heatmap</h1>
          <p className="text-gray-600">Time-based application trends</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Trends</CardTitle>
          <CardDescription>Visual representation of when applications are received</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Heatmap analytics coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobAnalyticsHeatmap;
