import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Settings,
  Maximize,
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
  Download,
  Share2
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  completed: boolean;
  locked: boolean;
}

interface Note {
  id: string;
  timestamp: number;
  content: string;
  createdAt: string;
}

interface InteractiveCoursePlayerProps {
  courseId: string;
  lessonId: string;
  className?: string;
}

export const InteractiveCoursePlayer: React.FC<InteractiveCoursePlayerProps> = ({
  courseId,
  lessonId,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons');
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock lesson data
  const [lessons] = useState<Lesson[]>([
    {
      id: 'lesson-1',
      title: 'Introduction to React Components',
      duration: '12:30',
      type: 'video',
      completed: true,
      locked: false
    },
    {
      id: 'lesson-2',
      title: 'Understanding JSX Syntax',
      duration: '15:45',
      type: 'video',
      completed: true,
      locked: false
    },
    {
      id: 'lesson-3',
      title: 'Props and State Management',
      duration: '18:20',
      type: 'video',
      completed: false,
      locked: false
    },
    {
      id: 'lesson-4',
      title: 'Hooks Deep Dive',
      duration: '22:15',
      type: 'video',
      completed: false,
      locked: false
    },
    {
      id: 'lesson-5',
      title: 'Quiz: React Fundamentals',
      duration: '10:00',
      type: 'quiz',
      completed: false,
      locked: true
    }
  ]);

  const currentLesson = lessons.find(lesson => lesson.id === lessonId) || lessons[0];

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const addNote = () => {
    if (noteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        timestamp: currentTime,
        content: noteContent.trim(),
        createdAt: new Date().toISOString()
      };
      setNotes([...notes, newNote]);
      setNoteContent('');
      toast.success('Note added successfully!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Player */}
      <Card className="overflow-hidden">
        <div ref={containerRef} className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full"
            poster="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                onValueChange={handleSeek}
                max={duration}
                step={1}
                className="cursor-pointer"
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipTime(-10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipTime(10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={playbackSpeed}
                  onChange={(e) => changePlaybackSpeed(Number(e.target.value))}
                  className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lesson Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-2">{currentLesson.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{currentLesson.duration}</span>
                  </span>
                  <Badge variant={currentLesson.completed ? 'default' : 'secondary'}>
                    {currentLesson.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <Progress value={progress} className="mb-4" />
            
            <p className="text-sm text-muted-foreground">
              Learn the fundamentals of React components and how to build reusable UI elements 
              that form the foundation of modern web applications.
            </p>
          </Card>

          {/* Notes Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Take Notes</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a note at current timestamp..."
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                />
                <Button onClick={addNote} disabled={!noteContent.trim()}>
                  Add Note
                </Button>
              </div>
              
              {notes.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(note.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lessons">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Course Content</h3>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        lesson.id === lessonId
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      } ${lesson.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {lesson.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : lesson.type === 'video' ? (
                            <Play className="w-5 h-5 text-muted-foreground" />
                          ) : lesson.type === 'quiz' ? (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="resources">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Resources</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="text-sm font-medium">Course Materials</h4>
                    <p className="text-xs text-muted-foreground">PDF slides and code examples</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="text-sm font-medium">Practice Exercises</h4>
                    <p className="text-xs text-muted-foreground">Hands-on coding challenges</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="text-sm font-medium">Discussion Forum</h4>
                    <p className="text-xs text-muted-foreground">Ask questions and share insights</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};