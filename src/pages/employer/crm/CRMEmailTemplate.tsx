
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const CRMEmailTemplate = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Mail className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Saved email templates for candidate outreach</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Pre-saved templates for candidate communication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Email template management feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMEmailTemplate;
