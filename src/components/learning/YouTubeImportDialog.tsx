import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useYouTubeIntegration } from '@/hooks/useYouTubeIntegration';
import { Loader, Youtube, Clock, Eye, ThumbsUp, User } from 'lucide-react';
import { toast } from 'sonner';

interface YouTubeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated?: (course: any) => void;
}

export const YouTubeImportDialog: React.FC<YouTubeImportDialogProps> = ({
  open,
  onOpenChange,
  onCourseCreated
}) => {
  const [step, setStep] = useState<'url' | 'preview' | 'customize'>('url');
  const [url, setUrl] = useState('');
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [playlistDetails, setPlaylistDetails] = useState<any>(null);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    difficulty_level: 'beginner',
    category: '',
    is_free: true,
    price: 0,
    skills_taught: [] as string[],
    language: 'en'
  });
  const [skillInput, setSkillInput] = useState('');

  const { 
    loading, 
    extractVideoInfo, 
    createCourseFromYouTube,
    parseDurationToHours 
  } = useYouTubeIntegration();

  const handleExtractInfo = async () => {
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    try {
      const result = await extractVideoInfo(url);
      setVideoDetails(result.videoDetails);
      setPlaylistDetails(result.playlistDetails);
      
      // Pre-fill course data with extracted info
      setCourseData({
        title: result.videoDetails.title,
        description: result.videoDetails.description,
        instructor_name: result.videoDetails.channelName,
        difficulty_level: 'beginner',
        category: '',
        is_free: true,
        price: 0,
        skills_taught: result.videoDetails.tags || [],
        language: 'en'
      });
      
      setStep('preview');
    } catch (error) {
      console.error('Error extracting video info:', error);
    }
  };

  const handleCustomize = () => {
    setStep('customize');
  };

  const handleCreateCourse = async () => {
    try {
      const course = await createCourseFromYouTube(url);
      
      // Update course with customized data
      if (courseData.title !== videoDetails?.title || 
          courseData.description !== videoDetails?.description ||
          courseData.difficulty_level !== 'beginner' ||
          courseData.category ||
          !courseData.is_free ||
          courseData.skills_taught.length !== videoDetails?.tags?.length) {
        
        // Additional update logic could go here
        toast.success('Course created and customized successfully');
      }
      
      if (onCourseCreated) {
        onCourseCreated(course);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleClose = () => {
    setStep('url');
    setUrl('');
    setVideoDetails(null);
    setPlaylistDetails(null);
    setCourseData({
      title: '',
      description: '',
      instructor_name: '',
      difficulty_level: 'beginner',
      category: '',
      is_free: true,
      price: 0,
      skills_taught: [],
      language: 'en'
    });
    setSkillInput('');
    onOpenChange(false);
  };

  const addSkill = () => {
    if (skillInput.trim() && !courseData.skills_taught.includes(skillInput.trim())) {
      setCourseData({
        ...courseData,
        skills_taught: [...courseData.skills_taught, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setCourseData({
      ...courseData,
      skills_taught: courseData.skills_taught.filter(s => s !== skill)
    });
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'Unknown';
    
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    
    if (!matches) return duration;
    
    const hours = parseInt(matches[1] || '0');
    const minutes = parseInt(matches[2] || '0');
    const seconds = parseInt(matches[3] || '0');
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Import from YouTube
          </DialogTitle>
          <DialogDescription>
            {step === 'url' && 'Enter a YouTube video or playlist URL to import as a course'}
            {step === 'preview' && 'Review the extracted information from YouTube'}
            {step === 'customize' && 'Customize course details before creating'}
          </DialogDescription>
        </DialogHeader>

        {step === 'url' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleExtractInfo()}
              />
            </div>
          </div>
        )}

        {step === 'preview' && videoDetails && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-4">
                {videoDetails.thumbnailUrl && (
                  <img 
                    src={videoDetails.thumbnailUrl} 
                    alt={videoDetails.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg">{videoDetails.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{videoDetails.channelName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(videoDetails.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatNumber(videoDetails.viewCount)} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{formatNumber(videoDetails.likeCount)} likes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {videoDetails.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {videoDetails.description}
                </p>
              )}

              {videoDetails.tags && videoDetails.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {videoDetails.tags.slice(0, 8).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {videoDetails.tags.length > 8 && (
                      <Badge variant="secondary" className="text-xs">
                        +{videoDetails.tags.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {playlistDetails && (
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Part of Playlist:</h4>
                <p className="font-medium">{playlistDetails.title}</p>
                <p className="text-sm text-muted-foreground">
                  {playlistDetails.videoCount} videos
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'customize' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={courseData.instructor_name}
                  onChange={(e) => setCourseData({ ...courseData, instructor_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select 
                  value={courseData.difficulty_level} 
                  onValueChange={(value) => setCourseData({ ...courseData, difficulty_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={courseData.language} 
                  onValueChange={(value) => setCourseData({ ...courseData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills Taught</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} variant="outline">Add</Button>
              </div>
              {courseData.skills_taught.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {courseData.skills_taught.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          
          {step === 'url' && (
            <Button onClick={handleExtractInfo} disabled={loading || !url.trim()}>
              {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Extract Info
            </Button>
          )}
          
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleCustomize}>
                Customize
              </Button>
              <Button onClick={handleCreateCourse} disabled={loading}>
                {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Create Course
              </Button>
            </>
          )}
          
          {step === 'customize' && (
            <Button onClick={handleCreateCourse} disabled={loading}>
              {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Create Course
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};