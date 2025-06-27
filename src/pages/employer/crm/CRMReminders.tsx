
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CRMReminders = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Bell className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Reminders</h1>
          <p className="text-gray-600">Follow-ups and reminders for candidates</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reminders & Follow-ups</CardTitle>
          <CardDescription>Automated reminders for candidate follow-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">CRM reminders feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMReminders;
