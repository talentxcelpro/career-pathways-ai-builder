import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useEventRegistration } from '@/hooks/useLiveEvents';
import { LiveEvent } from '@/hooks/useLiveEvents';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  DollarSign,
  Share2,
  Bookmark,
  Bell,
  ExternalLink
} from 'lucide-react';

interface EnhancedLiveEventCardProps {
  event: LiveEvent;
  variant?: 'default' | 'compact' | 'featured';
}

export const EnhancedLiveEventCard: React.FC<EnhancedLiveEventCardProps> = ({ 
  event, 
  variant = 'default' 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { register, unregister } = useEventRegistration();
  const [showDetails, setShowDetails] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const eventDate = new Date(event.scheduled_at);
  const isUpcoming = eventDate > new Date();
  const isRegistered = event.is_registered || false;
  const isFull = event.max_participants && event.participant_count >= event.max_participants;

  const timeLabel = isUpcoming 
    ? `Starts ${formatDistanceToNow(eventDate, { addSuffix: true })}`
    : event.is_live 
    ? 'Live now'
    : 'Ended';

  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const typeColor = {
    webinar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-green-100 text-green-800',
    networking: 'bg-purple-100 text-purple-800',
    interview: 'bg-orange-100 text-orange-800'
  };

  const handleRegistration = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isRegistered) {
        await unregister.mutateAsync({ eventId: event.id, userId: user.id });
        toast({
          title: "Registration Cancelled",
          description: "You have successfully unregistered from this event.",
        });
      } else {
        await register.mutateAsync({ eventId: event.id, userId: user.id });
        toast({
          title: "Registration Successful",
          description: "You have successfully registered for this event!",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleJoinEvent = () => {
    if (event.event_url) {
      window.open(event.event_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: event.description,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${event.title} - ${window.location.href}`);
        toast({
          title: "Link Copied",
          description: "Event link copied to clipboard!",
        });
      }
    } else {
      navigator.clipboard.writeText(`${event.title} - ${window.location.href}`);
      toast({
        title: "Link Copied",
        description: "Event link copied to clipboard!",
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from Bookmarks" : "Added to Bookmarks",
      description: isBookmarked ? "Event removed from your bookmarks." : "Event saved to your bookmarks!",
    });
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={typeColor[event.event_type]}>
                  {event.event_type}
                </Badge>
                {event.is_live && (
                  <Badge variant="destructive" className="animate-pulse">
                    <Video className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                {event.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{event.host_name}</span>
                <span>•</span>
                <span>{timeLabel}</span>
              </div>
            </div>
            <Button
              onClick={handleJoinEvent}
              size="sm"
              variant={event.is_live ? "default" : "outline"}
              className="flex-shrink-0"
            >
              {event.is_live ? 'Join' : 'View'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="relative h-48">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.1%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-yellow-500 text-yellow-900">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
            {event.is_live && (
              <Badge variant="destructive" className="animate-pulse">
                <Video className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl font-bold mb-2 line-clamp-2">{event.title}</h2>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Avatar className="w-6 h-6">
                <AvatarImage src={event.host_avatar} />
                <AvatarFallback className="text-xs">
                  {event.host_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{event.host_name}</span>
              <span>•</span>
              <span>{format(eventDate, 'MMM d, h:mm a')}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {event.participant_count} participants
              </span>
            </div>
            <Button
              onClick={handleJoinEvent}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {event.is_live ? 'Join Live' : 'Register'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={typeColor[event.event_type]}>
                {event.event_type}
              </Badge>
              <Badge className={difficultyColor[event.difficulty_level]}>
                {event.difficulty_level}
              </Badge>
              {event.is_live && (
                <Badge variant="destructive" className="animate-pulse">
                  <Video className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              )}
              {isFull && (
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  Full
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(eventDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{event.duration_minutes}min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{event.participant_count}</span>
                {event.max_participants && (
                  <span>/{event.max_participants}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={event.host_avatar} />
                <AvatarFallback>
                  {event.host_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{event.host_name}</p>
                <p className="text-xs text-muted-foreground">Host</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="text-muted-foreground hover:text-primary"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-primary"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {timeLabel}
            </Badge>
            {event.price && event.price > 0 && (
              <Badge variant="secondary" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                ${event.price}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {event.registration_required && !event.is_live && isUpcoming && (
              <Button
                onClick={handleRegistration}
                variant={isRegistered ? "outline" : "default"}
                size="sm"
                disabled={register.isPending || unregister.isPending || (!isRegistered && isFull)}
                className={isRegistered ? "border-green-500 text-green-700" : ""}
              >
                {register.isPending || unregister.isPending ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isRegistered ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Registered
                  </>
                ) : isFull ? (
                  <>
                    <XCircle className="w-4 h-4 mr-1" />
                    Full
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            )}
            
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{event.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">{event.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{format(eventDate, 'PPPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{format(eventDate, 'p')} ({event.duration_minutes} minutes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.participant_count} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>{event.difficulty_level} level</span>
                    </div>
                  </div>
                  {event.tags && (
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleJoinEvent}
              size="sm"
              variant={event.is_live ? "default" : "outline"}
              className={event.is_live ? "animate-pulse" : ""}
            >
              <Video className="h-4 w-4 mr-1" />
              {event.is_live ? 'Join Live' : isUpcoming ? 'Preview' : 'View Recording'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};