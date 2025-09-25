import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Target,
  Users,
  Briefcase,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'education' | 'experience' | 'certification' | 'milestone' | 'skill';
  status: 'completed' | 'current' | 'upcoming' | 'optional';
  duration?: string;
  location?: string;
  skills?: string[];
  achievements?: string[];
  confidence?: number;
  importance: 'high' | 'medium' | 'low';
}

interface PersonalizationData {
  profileMatch: number;
  confidenceScore: number;
  successProbability: number;
  timeToGoal: string;
  customizedFor: {
    currentRole: string;
    targetRole: string;
    experience: string;
    industry: string;
  };
}

interface TimelineVisualizationProps {
  events: TimelineEvent[];
  personalization: PersonalizationData;
  title: string;
  description: string;
  onEventClick?: (eventId: string) => void;
  className?: string;
}

export const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  events,
  personalization,
  title,
  description,
  onEventClick,
  className
}) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('timeline');

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'education': return <GraduationCap className="h-4 w-4" />;
      case 'experience': return <Briefcase className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'skill': return <TrendingUp className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-200';
      case 'current': return 'bg-blue-500 border-blue-200';
      case 'upcoming': return 'bg-amber-500 border-amber-200';
      case 'optional': return 'bg-gray-400 border-gray-200';
      default: return 'bg-gray-300 border-gray-200';
    }
  };

  const getImportanceStyle = (importance: TimelineEvent['importance']) => {
    switch (importance) {
      case 'high': return 'ring-2 ring-red-300 shadow-lg';
      case 'medium': return 'ring-1 ring-yellow-300 shadow-md';
      case 'low': return 'shadow-sm';
      default: return 'shadow-sm';
    }
  };

  const nextEvent = () => {
    setCurrentEventIndex(prev => Math.min(prev + 1, events.length - 1));
  };

  const prevEvent = () => {
    setCurrentEventIndex(prev => Math.max(prev - 1, 0));
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Add auto-progression logic here
  };

  const resetTimeline = () => {
    setCurrentEventIndex(0);
    setIsPlaying(false);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Personalization Header */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-indigo-900 mb-2">{title}</CardTitle>
              <p className="text-indigo-700 text-sm">{description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-900">
                {personalization.profileMatch}%
              </div>
              <div className="text-xs text-indigo-600">Profile Match</div>
            </div>
          </div>
          
          {/* Personalization Indicators */}
          <div className="mt-4 p-4 bg-white/60 rounded-lg border border-indigo-200">
            <div className="text-sm font-medium text-indigo-800 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Based on your profile: {personalization.customizedFor.currentRole} → {personalization.customizedFor.targetRole}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-indigo-600 mb-1">AI Confidence</div>
                <div className="flex items-center gap-2">
                  <Progress value={personalization.confidenceScore} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-indigo-800">
                    {personalization.confidenceScore}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-indigo-600 mb-1">Success Probability</div>
                <div className="flex items-center gap-2">
                  <Progress value={personalization.successProbability} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-indigo-800">
                    {personalization.successProbability}%
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-indigo-600 mb-1">Time to Goal</div>
                <div className="flex items-center gap-1 text-sm font-medium text-indigo-800">
                  <Clock className="h-3 w-3" />
                  {personalization.timeToGoal}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevEvent}
                  disabled={currentEventIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextEvent}
                  disabled={currentEventIndex === events.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTimeline}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                Event {currentEventIndex + 1} of {events.length}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </Badge>
              <Badge 
                variant={viewMode === 'gantt' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setViewMode('gantt')}
              >
                Gantt
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Visualization */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] overflow-hidden">
            <CardContent className="p-6 h-full">
              {viewMode === 'timeline' ? (
                /* Timeline View */
                <div className="relative h-full">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                  
                  {/* Timeline Events */}
                  <div className="space-y-6 overflow-y-auto h-full">
                    {events.map((event, index) => (
                      <div
                        key={event.id}
                        className={cn(
                          "relative flex items-start gap-4 cursor-pointer transition-all hover:bg-gray-50 p-3 rounded-lg",
                          index === currentEventIndex && "bg-blue-50 border border-blue-200",
                          getImportanceStyle(event.importance)
                        )}
                        onClick={() => {
                          setSelectedEvent(event);
                          setCurrentEventIndex(index);
                          onEventClick?.(event.id);
                        }}
                      >
                        {/* Timeline Dot */}
                        <div className={cn(
                          "relative z-10 w-8 h-8 rounded-full border-4 flex items-center justify-center text-white",
                          getEventColor(event.status)
                        )}>
                          {getEventIcon(event.type)}
                        </div>
                        
                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {event.date}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          
                          <div className="flex flex-wrap gap-2 text-xs">
                            {event.duration && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="h-3 w-3" />
                                {event.duration}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                            {event.confidence && (
                              <Badge variant="secondary" className="text-xs">
                                {event.confidence}% match
                              </Badge>
                            )}
                          </div>
                          
                          {event.skills && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {event.skills.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {event.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{event.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Gantt Chart View */
                <div className="h-full">
                  <div className="text-sm text-gray-500 text-center py-8">
                    Gantt chart view coming soon...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Detail Panel */}
        <div>
          {selectedEvent ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-white",
                    getEventColor(selectedEvent.status)
                  )}>
                    {getEventIcon(selectedEvent.type)}
                  </div>
                  <CardTitle className="text-lg">{selectedEvent.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedEvent.type}</Badge>
                  <Badge variant={selectedEvent.status === 'current' ? 'default' : 'outline'}>
                    {selectedEvent.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Date</div>
                    <div className="font-medium">{selectedEvent.date}</div>
                  </div>
                  {selectedEvent.duration && (
                    <div>
                      <div className="text-gray-500 mb-1">Duration</div>
                      <div className="font-medium">{selectedEvent.duration}</div>
                    </div>
                  )}
                </div>

                {selectedEvent.confidence && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">AI Confidence</span>
                      <span className="font-medium">{selectedEvent.confidence}%</span>
                    </div>
                    <Progress value={selectedEvent.confidence} className="h-2" />
                  </div>
                )}

                {selectedEvent.skills && selectedEvent.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Skills Developed</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.achievements && selectedEvent.achievements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Achievements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedEvent.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Award className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={selectedEvent.status === 'completed'}
                >
                  {selectedEvent.status === 'completed' ? 'Completed' : 
                   selectedEvent.status === 'current' ? 'In Progress' : 'Start'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-700 mb-2">Select an Event</h3>
                <p className="text-sm text-gray-500">
                  Click on any timeline event to view detailed information.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};