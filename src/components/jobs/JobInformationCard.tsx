
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface JobInformationCardProps {
  job: any;
  appliedAt: string;
  coverLetter?: string;
}

export const JobInformationCard: React.FC<JobInformationCardProps> = ({
  job,
  appliedAt,
  coverLetter
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Application for {job?.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          {job?.companies?.logo_url && (
            <img 
              src={job.companies.logo_url} 
              alt={job.companies.name}
              className="w-12 h-12 rounded"
            />
          )}
          <div>
            <h3 className="font-semibold">{job?.companies?.name}</h3>
            <p className="text-sm text-gray-600">Applied on {new Date(appliedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {coverLetter && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Cover Letter</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {coverLetter}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
