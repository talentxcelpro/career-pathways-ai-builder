
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Star, Mail, MessageCircle } from "lucide-react";

interface CandidateProfileCardProps {
  profile: any;
  matchScore?: number;
}

const formatDisplayName = (profile: any) => {
  if (profile?.full_name && profile.full_name.trim()) {
    return profile.full_name;
  }
  return 'Candidate';
};

const generateInitials = (profile: any) => {
  const displayName = formatDisplayName(profile);
  if (displayName === 'Candidate') return 'C';
  
  const names = displayName.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
};

export const CandidateProfileCard: React.FC<CandidateProfileCardProps> = ({
  profile,
  matchScore
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Link to={`/network/people/${profile?.id}`} className="block mb-4 hover:scale-105 transition-transform">
            <Avatar className="w-24 h-24 cursor-pointer">
              <AvatarImage src={profile?.profile_picture_url} />
              <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {generateInitials(profile)}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <Link 
            to={`/network/people/${profile?.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer">
              {formatDisplayName(profile)}
            </h2>
          </Link>
          
          <p className="text-gray-600 mb-2">
            {profile?.title || 'Professional'}
          </p>
          
          {profile?.location && (
            <p className="text-sm text-gray-500 mb-4 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {profile.location}
            </p>
          )}

          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {profile?.experience_years || 0} years exp.
            </div>
            {matchScore && (
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                {Math.round(matchScore)}% match
              </div>
            )}
          </div>

          <div className="flex space-x-2 w-full">
            <Button variant="outline" className="flex-1" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Link to={`/network/messages/${profile?.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
