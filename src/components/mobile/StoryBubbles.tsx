import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Briefcase, 
  Building, 
  Trophy, 
  MapPin,
  Plus
} from 'lucide-react';

const stories = [
  {
    id: 'add',
    title: 'Your Story',
    icon: Plus,
    gradient: 'from-gray-400 to-gray-500',
    isAdd: true
  },
  {
    id: 'recruiter',
    title: 'Recruiter Updates',
    icon: Briefcase,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'company',
    title: 'Company Highlights',
    icon: Building,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'success',
    title: 'Success Stories',
    icon: Trophy,
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'nearby',
    title: 'Jobs Near You',
    icon: MapPin,
    gradient: 'from-green-500 to-green-600'
  }
];

export const StoryBubbles: React.FC = () => {
  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100">
      <ScrollArea>
        <div className="flex gap-4 pb-2">
          {stories.map((story) => {
            const IconComponent = story.icon;
            
            return (
              <div key={story.id} className="flex flex-col items-center min-w-0">
                <div className={`relative p-0.5 bg-gradient-to-tr ${story.gradient} rounded-full`}>
                  <div className="bg-white rounded-full p-1">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src="" />
                      <AvatarFallback className={`bg-gradient-to-br ${story.gradient} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {story.isAdd && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                      <Plus className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center max-w-[60px] truncate">
                  {story.title}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};