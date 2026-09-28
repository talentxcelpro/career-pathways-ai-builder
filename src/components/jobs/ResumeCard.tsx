import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download } from "lucide-react";

interface ResumeCardProps {
  resumeUrl?: string;
  profileResumeUrl?: string;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resumeUrl, profileResumeUrl }) => {
  const finalResumeUrl = resumeUrl || profileResumeUrl;
  const hasResume = !!finalResumeUrl;

  const handleAction = () => {
    if (finalResumeUrl) {
      window.open(finalResumeUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Original CV
          </span>
          {hasResume && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleAction}>
                <Eye className="h-4 w-4 mr-2" />
                View File
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasResume ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Applicant_CV_Original</p>
                    <p className="text-sm text-gray-600">
                      View the exact, unmodified CV submitted by the candidate
                    </p>
                  </div>
                </div>
                <Button onClick={handleAction}>Open Document</Button>
              </div>
            </div>
            
            <div className="border rounded-lg h-96 bg-white overflow-hidden flex items-center justify-center">
              {finalResumeUrl.toLowerCase().includes('.pdf') ? (
                <iframe src={finalResumeUrl} className="w-full h-full" title="Resume PDF Viewer" />
              ) : (
                <div className="text-center p-6">
                  <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium mb-2">Document Available</p>
                  <p className="text-sm text-gray-500 mb-4">Click below to open the original file</p>
                  <Button onClick={handleAction}>Open File in New Tab</Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No CV file was attached to this application</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
