import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, MapPin, Building2, Briefcase, 
  Download, Mail, Eye, Tag 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    email: string;
    title?: string;
    company?: string;
    location?: string;
    skills?: string[];
    resume_url?: string;
    source: 'application' | 'platform';
    applied_at?: string;
    created_at?: string;
  };
  onViewProfile: (candidateId: string) => void;
  onDownloadResume?: (candidate: any) => void;
  onEmailCandidate?: (candidate: any) => void;
  tags?: Array<{ tag_name: string; tag_color: string }>;
  notes?: Array<{ note_content: string; created_at: string }>;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onViewProfile,
  onDownloadResume,
  onEmailCandidate,
  tags = [],
  notes = []
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'application' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const timeAgo = candidate.applied_at || candidate.created_at;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={candidate.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">{candidate.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Boolean((candidate as any).reverse_pitched || ((candidate as any).match_score && (candidate as any).match_score >= 80)) && (
              <Badge 
                className="bg-purple-100 text-purple-800 border-purple-200 cursor-help"
                title="Verified via Proctored Timed Assessment (45s window, anti-cheat tab-switch monitored)"
              >
                ⚡ Reverse Pitched {(candidate as any).match_score ? `(${(candidate as any).match_score}%)` : ''}
              </Badge>
            )}
            <Badge className={getSourceBadgeColor(candidate.source)}>
              {candidate.source === 'application' ? 'Applied' : 'Platform'}
            </Badge>
          </div>
        </div>

        {candidate.title && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Briefcase className="h-4 w-4 mr-2" />
            <span>{candidate.title}</span>
            {candidate.company && (
              <>
                <span className="mx-2">at</span>
                <Building2 className="h-4 w-4 mr-1" />
                <span>{candidate.company}</span>
              </>
            )}
          </div>
        )}

        {candidate.location && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{candidate.location}</span>
          </div>
        )}

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  className="text-xs flex items-center gap-1"
                  style={{ backgroundColor: tag.tag_color + '20', color: tag.tag_color }}
                >
                  <Tag className="h-3 w-3" />
                  {tag.tag_name}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 2} tags
                </Badge>
              )}
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
            <span className="font-medium">Latest note:</span>
            <p className="text-muted-foreground mt-1 line-clamp-2">
              {notes[0].note_content.length > 100 
                ? notes[0].note_content.substring(0, 100) + '...'
                : notes[0].note_content}
            </p>
          </div>
        )}

        {timeAgo && (
          <p className="text-xs text-muted-foreground mb-3">
            {candidate.source === 'application' ? 'Applied' : 'Added'} {formatDistanceToNow(new Date(timeAgo), { addSuffix: true })}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(candidate.id)}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Profile
          </Button>
          
          <div className="flex items-center gap-1">
            {candidate.resume_url && onDownloadResume && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownloadResume(candidate)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {onEmailCandidate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEmailCandidate(candidate)}
                className="flex items-center gap-1"
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};