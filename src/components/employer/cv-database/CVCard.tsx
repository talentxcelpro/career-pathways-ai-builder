import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  ExternalLink,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  User,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

interface CVCardProps {
  cv: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    title?: string;
    resume_url?: string;
    profile_picture_url?: string;
    about?: string;
    skills?: string[];
    experience_years?: number;
    current_company?: string;
    looking_for_job?: boolean;
    created_at?: string;
    applied_at?: string;
    job_title?: string;
    company_name?: string;
    status?: string;
    application_source?: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
  showJobInfo?: boolean;
}

export const CVCard: React.FC<CVCardProps> = ({ 
  cv, 
  isSelected, 
  onSelect, 
  showJobInfo = false 
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(cv.id)}
          />
          
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
            {cv.profile_picture_url ? (
              <img 
                src={cv.profile_picture_url} 
                alt={cv.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              cv.full_name?.charAt(0) || 'C'
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{cv.full_name}</h3>
                
                {cv.title && (
                  <p className="text-gray-600 flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {cv.title}
                    {cv.current_company && ` at ${cv.current_company}`}
                  </p>
                )}

                {showJobInfo && cv.job_title && (
                  <p className="text-gray-600 flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Applied to: {cv.job_title} {cv.company_name && `at ${cv.company_name}`}
                  </p>
                )}

                {cv.location && (
                  <p className="text-gray-500 flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {cv.location}
                  </p>
                )}

                {cv.about && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {cv.about}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {cv.resume_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={cv.resume_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                
                <Button variant="outline" size="sm" asChild>
                  <a href={`/@${cv.full_name?.toLowerCase().replace(/\s+/g, '-')}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {cv.email}
                </span>
                
                {cv.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {cv.phone}
                  </span>
                )}

                {cv.experience_years !== undefined && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {cv.experience_years} years exp
                  </span>
                )}

                {(cv.applied_at || cv.created_at) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {showJobInfo ? 'Applied' : 'Joined'}: {format(new Date(cv.applied_at || cv.created_at!), 'MMM dd, yyyy')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {cv.skills && cv.skills.length > 0 && (
                  <>
                    <span className="text-sm font-medium">Skills:</span>
                    {cv.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {cv.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{cv.skills.length - 3} more
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {showJobInfo && (
                <div className="flex items-center gap-2">
                  {cv.job_title && (
                    <>
                      <span className="text-sm font-medium">Job:</span>
                      <span className="text-sm">{cv.job_title}</span>
                    </>
                  )}
                  
                  {cv.status && (
                    <Badge variant="outline">{cv.status}</Badge>
                  )}
                  
                  {cv.application_source && (
                    <Badge variant={cv.application_source === 'scraped' ? 'secondary' : 'default'} className="flex items-center gap-1">
                      {cv.application_source === 'scraped' && <ExternalLink className="h-3 w-3" />}
                      {cv.application_source === 'scraped' ? 'External' : 'Platform'}
                    </Badge>
                  )}
                </div>
              )}

              {!showJobInfo && (
                <div className="flex items-center gap-2">
                  {cv.looking_for_job && (
                    <Badge variant="default" className="text-xs">
                      Open to Work
                    </Badge>
                  )}
                  
                  {cv.current_company && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Building className="h-3 w-3" />
                      {cv.current_company}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};