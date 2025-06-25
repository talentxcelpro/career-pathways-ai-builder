
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, Camera } from "lucide-react";
import { Link } from 'react-router-dom';

interface ProfileCompletionPromptProps {
  missingFields: string[];
  className?: string;
}

export const ProfileCompletionPrompt: React.FC<ProfileCompletionPromptProps> = ({ 
  missingFields, 
  className = "" 
}) => {
  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-orange-800">
              Complete your profile to get better visibility
            </h3>
            <p className="text-sm text-orange-700 mt-1">
              Add your {missingFields.join(', ')} so others can recognize you in the network and posts. 
              This makes your profile more engaging and trustworthy.
            </p>
            <div className="mt-3">
              <Link to="/profile">
                <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  <User className="h-4 w-4 mr-2" />
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
