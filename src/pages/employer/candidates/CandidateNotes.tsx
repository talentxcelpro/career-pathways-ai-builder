
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowLeft, Save, Plus } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const CandidateNotes = () => {
  const navigate = useNavigate();
  const { jobId, applicantId } = useParams();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${jobId}/applicants/${applicantId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Notes</h1>
          <p className="text-gray-600">Add notes and feedback for this candidate</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Notes & Feedback
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </CardTitle>
          <CardDescription>Track your thoughts and team feedback</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Add your notes about this candidate..." rows={6} />
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateNotes;
