
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Eye, Share2, Settings, MessageCircle } from "lucide-react";

export const ProfileNavigation: React.FC = () => {
  const location = useLocation();
  const isProfilePage = location.pathname.startsWith('/profile');

  return (
    <Card className="border-0 shadow-lg mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/profile">
            <Button 
              variant={isProfilePage ? "default" : "outline"} 
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
          
          <Link to="/network/people">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Public View
            </Button>
          </Link>
          
          <Link to="/network">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Network
            </Button>
          </Link>
          
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Link to="/network/messages">
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
