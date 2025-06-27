
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface ApplicantHeaderProps {
  status: string;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'applied': return 'bg-blue-100 text-blue-800';
    case 'reviewing': return 'bg-yellow-100 text-yellow-800';
    case 'interview': return 'bg-purple-100 text-purple-800';
    case 'offered': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ApplicantHeader: React.FC<ApplicantHeaderProps> = ({
  status,
  onStatusChange,
  isUpdating
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <Link to="/jobs/manage" className="inline-flex items-center text-blue-600 hover:text-blue-700">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Link>
      
      <div className="flex items-center space-x-3">
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange('reviewing')}
            disabled={isUpdating}
          >
            Mark as Reviewing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange('interview')}
            disabled={isUpdating}
          >
            Schedule Interview
          </Button>
          <Button
            size="sm"
            onClick={() => onStatusChange('offered')}
            disabled={isUpdating}
          >
            Make Offer
          </Button>
        </div>
      </div>
    </div>
  );
};
