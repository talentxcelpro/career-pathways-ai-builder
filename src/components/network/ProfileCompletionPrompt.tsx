import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { 
  Target, 
  User, 
  Briefcase, 
  Heart, 
  Zap, 
  Building, 
  MapPin, 
  Camera, 
  Linkedin,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
  target: Target,
  user: User,
  briefcase: Briefcase,
  heart: Heart,
  zap: Zap,
  building: Building,
  'map-pin': MapPin,
  camera: Camera,
  linkedin: Linkedin
};

interface ProfileCompletionPromptProps {
  className?: string;
}

export const ProfileCompletionPrompt: React.FC<ProfileCompletionPromptProps> = ({ className }) => {
  const { completionScore, suggestions, isLoading } = useProfileCompletion();

  if (isLoading || completionScore >= 80) {
    return null; // Don't show if profile is mostly complete
  }

  return (
    <Card className={`border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Target className="h-5 w-5" />
          Complete Your Profile
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {completionScore}% complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-orange-700">Profile completion</span>
            <span className="font-medium text-orange-800">{completionScore}%</span>
          </div>
          <Progress value={completionScore} className="h-2" />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-orange-700">
            Complete your profile to get better AI-powered connection recommendations:
          </p>
          
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((suggestion) => {
              const IconComponent = iconMap[suggestion.icon as keyof typeof iconMap] || Target;
              return (
                <div key={suggestion.field} className="flex items-center gap-3 text-sm">
                  <div className={`p-1 rounded-full ${
                    suggestion.priority === 'high' ? 'bg-red-100' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <IconComponent className={`h-3 w-3 ${
                      suggestion.priority === 'high' ? 'text-red-600' :
                      suggestion.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-orange-800">{suggestion.label}</span>
                    <p className="text-orange-600 text-xs mt-0.5">{suggestion.description}</p>
                  </div>
                </div>
              );
            })}
            
            {suggestions.length > 3 && (
              <p className="text-xs text-orange-600 pl-6">
                +{suggestions.length - 3} more suggestions
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link to="/profile/edit" className="flex-1">
            <Button className="w-full gap-2 bg-orange-600 hover:bg-orange-700">
              <Target className="h-4 w-4" />
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </Link>
        </div>

        {completionScore > 50 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Good progress!</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              You're on track. Complete a few more sections to unlock advanced AI matching.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};