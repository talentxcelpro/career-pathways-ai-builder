
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const CRMCandidateDetail = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate('/employer/crm/candidates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <User className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Profile</h1>
          <p className="text-gray-600">Detailed candidate information and history</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Candidate Details</CardTitle>
          <CardDescription>Complete candidate profile and interaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">CRM candidate detail feature coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMCandidateDetail;
