import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from 'react-router-dom';

interface ProfileViewersProps {
  profileUserId: string;
  viewsCount: number;
}

export function ProfileViewers({ profileUserId, viewsCount }: ProfileViewersProps) {
  return (
    <Link to="/profile/viewers">
      <Button variant="ghost" className="text-sm text-gray-500 hover:text-gray-700 p-0 h-auto">
        <Eye className="h-4 w-4 mr-1" />
        {viewsCount} {viewsCount === 1 ? 'view' : 'views'}
      </Button>
    </Link>
  );
}