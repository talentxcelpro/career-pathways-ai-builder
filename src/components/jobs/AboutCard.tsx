
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface AboutCardProps {
  about: string;
}

export const AboutCard: React.FC<AboutCardProps> = ({ about }) => {
  if (!about) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 whitespace-pre-wrap">
          {about}
        </p>
      </CardContent>
    </Card>
  );
};
