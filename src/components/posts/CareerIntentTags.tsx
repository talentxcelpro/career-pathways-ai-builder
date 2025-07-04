import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  GraduationCap, 
  Users, 
  Trophy, 
  Target, 
  Rocket,
  BookOpen,
  HandHeart
} from 'lucide-react';

export interface CareerIntent {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

export const CAREER_INTENTS: CareerIntent[] = [
  {
    id: 'job_seeking',
    label: 'Job Seeking',
    description: 'Looking for new opportunities',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'mentoring',
    label: 'Mentoring',
    description: 'Offering guidance and support',
    icon: HandHeart,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100'
  },
  {
    id: 'learning',
    label: 'Learning',
    description: 'Sharing knowledge and insights',
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100'
  },
  {
    id: 'showcasing',
    label: 'Showcasing',
    description: 'Highlighting achievements',
    icon: Trophy,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100'
  },
  {
    id: 'networking',
    label: 'Networking',
    description: 'Building professional connections',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100'
  },
  {
    id: 'career_growth',
    label: 'Career Growth',
    description: 'Discussing career development',
    icon: Rocket,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100'
  }
];

interface CareerIntentTagsProps {
  selectedIntents: string[];
  onIntentToggle: (intentId: string) => void;
  showDescription?: boolean;
  variant?: 'selector' | 'display';
}

export const CareerIntentTags: React.FC<CareerIntentTagsProps> = ({
  selectedIntents,
  onIntentToggle,
  showDescription = false,
  variant = 'selector'
}) => {
  if (variant === 'display') {
    return (
      <div className="flex flex-wrap gap-2">
        {selectedIntents.map(intentId => {
          const intent = CAREER_INTENTS.find(i => i.id === intentId);
          if (!intent) return null;
          
          const IconComponent = intent.icon;
          return (
            <Badge
              key={intentId}
              variant="secondary"
              className={`${intent.color} ${intent.bgColor} border-0 font-medium`}
            >
              <IconComponent className="h-3 w-3 mr-1" />
              {intent.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Career Intent</CardTitle>
        <p className="text-xs text-muted-foreground">
          Help others understand your post's purpose
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {CAREER_INTENTS.map(intent => {
            const IconComponent = intent.icon;
            const isSelected = selectedIntents.includes(intent.id);
            
            return (
              <Button
                key={intent.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onIntentToggle(intent.id)}
                className={`justify-start h-auto p-3 ${
                  isSelected 
                    ? `${intent.color} ${intent.bgColor} border-current` 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-xs font-medium">{intent.label}</div>
                    {showDescription && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {intent.description}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const CareerIntentBadge: React.FC<{ intentId: string; size?: 'sm' | 'md' }> = ({ 
  intentId, 
  size = 'sm' 
}) => {
  const intent = CAREER_INTENTS.find(i => i.id === intentId);
  if (!intent) return null;
  
  const IconComponent = intent.icon;
  
  return (
    <Badge
      variant="secondary"
      className={`${intent.color} ${intent.bgColor} border-0 font-medium ${
        size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs'
      }`}
    >
      <IconComponent className={`${size === 'md' ? 'h-4 w-4' : 'h-3 w-3'} mr-1`} />
      {intent.label}
    </Badge>
  );
};