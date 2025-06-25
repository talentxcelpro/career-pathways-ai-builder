
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    member_count?: number;
  };
  onJoin?: (groupId: string) => void;
  isJoining?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onJoin,
  isJoining = false
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Group Header */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
            {group.category && (
              <Badge variant="secondary" className="mt-1">
                {group.category}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-3">
            {group.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {group.member_count || 0} members
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              Active
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              className="flex-1" 
              onClick={() => onJoin?.(group.id)}
              disabled={isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Group'}
            </Button>
            <Button variant="outline" size="icon">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
