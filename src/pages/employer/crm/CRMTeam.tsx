
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CRMTeam = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Team Collaboration</h1>
          <p className="text-gray-600">Team hiring activity and collaboration</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Collaboration</CardTitle>
          <CardDescription>Shared hiring activity and team coordination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">CRM team collaboration feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMTeam;
