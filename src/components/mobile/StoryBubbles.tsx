import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StoryUploadModal } from './StoryUploadModal';
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
  const [showStoryUpload, setShowStoryUpload] = useState(false);

  const handleStoryClick = (storyId: string) => {
    switch(storyId) {
      case 'add':
        setShowStoryUpload(true);
        break;
      case 'recruiter':
        window.location.href = '/jobs';
        break;
      case 'company':
        window.location.href = '/companies';
        break;
      case 'success':
        window.location.href = '/mobile/reels';
        break;
      case 'nearby':
        window.location.href = '/jobs';
        break;
    }
  };

  return (
    <>
      <div className="px-4 py-3 bg-background border-b border-border">
        <ScrollArea>
          <div className="flex gap-4 pb-2">
            {stories.map((story) => {
              const IconComponent = story.icon;
              
              return (
                <div 
                  key={story.id} 
                  className="flex flex-col items-center min-w-0 cursor-pointer active:scale-95 transition-transform"
                  onClick={() => handleStoryClick(story.id)}
                >
                  <div className={`relative p-0.5 bg-gradient-to-tr ${story.gradient} rounded-full`}>
                    <div className="bg-background rounded-full p-1">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src="" />
                        <AvatarFallback className={`bg-gradient-to-br ${story.gradient} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {story.isAdd && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Plus className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 text-center max-w-[60px] truncate">
                    {story.title}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Story Upload Modal */}
      {showStoryUpload && (
        <StoryUploadModal
          onClose={() => setShowStoryUpload(false)}
          onUploadComplete={() => {
            // Refresh stories or handle story upload completion
            console.log('Story uploaded successfully');
          }}
        />
      )}
    </>
  );
};