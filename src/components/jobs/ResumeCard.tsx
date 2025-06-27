
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Download } from "lucide-react";

interface ResumeCardProps {
  resumeUrl?: string;
  profileResumeUrl?: string;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resumeUrl, profileResumeUrl }) => {
  const hasResume = resumeUrl || profileResumeUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Resume
          </span>
          {hasResume && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasResume ? (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Resume.pdf</p>
                  <p className="text-sm text-gray-600">
                    Click to view or download the candidate's resume
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg h-96 bg-white flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">PDF viewer will load here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Click "View" or "Download" above to access the resume
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No resume uploaded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
