import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  description: string;
  duration: string;
  channelName: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[];
  categoryId: string;
}

interface YouTubePlaylistDetails {
  playlistId: string;
  title: string;
  description: string;
  channelName: string;
  videoCount: number;
  publishedAt: string;
  thumbnailUrl: string;
}

export const useYouTubeIntegration = () => {
  const [loading, setLoading] = useState(false);

  const extractVideoInfo = async (url: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-integration', {
        body: { action: 'extract_video_info', url }
      });

      if (error) throw error;

      return {
        videoDetails: data.videoDetails as YouTubeVideoDetails,
        playlistDetails: data.playlistDetails as YouTubePlaylistDetails | null,
        extractedVideoId: data.extractedVideoId as string,
        extractedPlaylistId: data.extractedPlaylistId as string | null
      };
    } catch (error) {
      console.error('Error extracting video info:', error);
      toast.error('Failed to extract YouTube video information');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCourseYouTubeData = async (courseId: string, videoId?: string, playlistId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-integration', {
        body: { action: 'update_course_youtube_data', courseId, videoId, playlistId }
      });

      if (error) throw error;

      toast.success('Course YouTube data updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating course YouTube data:', error);
      toast.error('Failed to update course YouTube data');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncYouTubeStats = async (courseId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-integration', {
        body: { action: 'sync_youtube_stats', courseId }
      });

      if (error) throw error;

      toast.success('YouTube stats synchronized successfully');
      return data;
    } catch (error) {
      console.error('Error syncing YouTube stats:', error);
      toast.error('Failed to sync YouTube stats');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCourseFromYouTube = async (url: string) => {
    setLoading(true);
    try {
      // First extract video info
      const { videoDetails, playlistDetails, extractedVideoId, extractedPlaylistId } = await extractVideoInfo(url);
      
      // Create course with YouTube data
      const courseData = {
        title: videoDetails.title,
        description: videoDetails.description,
        instructor_name: videoDetails.channelName,
        duration_hours: parseDurationToHours(videoDetails.duration),
        difficulty_level: 'beginner', // Default value
        is_free: true, // Default value
        youtube_video_id: extractedVideoId,
        youtube_playlist_id: extractedPlaylistId,
        youtube_channel_name: videoDetails.channelName,
        video_duration: videoDetails.duration,
        view_count: videoDetails.viewCount,
        like_count: videoDetails.likeCount,
        content_type: extractedPlaylistId ? 'playlist' : 'video',
        external_url: url,
        thumbnail_url: videoDetails.thumbnailUrl,
        language: 'en', // Default value
        youtube_stats: {
          publishedAt: videoDetails.publishedAt,
          tags: videoDetails.tags,
          categoryId: videoDetails.categoryId
        }
      };

      const { data: course, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Course created from YouTube video successfully');
      return course;
    } catch (error) {
      console.error('Error creating course from YouTube:', error);
      toast.error('Failed to create course from YouTube video');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse YouTube duration format (PT1H2M10S) to hours
  const parseDurationToHours = (duration: string): number => {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    
    if (!matches) return 0;
    
    const hours = parseInt(matches[1] || '0');
    const minutes = parseInt(matches[2] || '0');
    const seconds = parseInt(matches[3] || '0');
    
    return hours + (minutes / 60) + (seconds / 3600);
  };

  return {
    loading,
    extractVideoInfo,
    updateCourseYouTubeData,
    syncYouTubeStats,
    createCourseFromYouTube,
    parseDurationToHours
  };
};