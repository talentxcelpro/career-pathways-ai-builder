import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

async function getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
  try {
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${youtubeApiKey}`
    );
    
    if (!videoResponse.ok) {
      console.error('YouTube API error:', await videoResponse.text());
      return null;
    }
    
    const videoData = await videoResponse.json();
    
    if (!videoData.items || videoData.items.length === 0) {
      console.error('No video found for ID:', videoId);
      return null;
    }
    
    const video = videoData.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;
    
    return {
      videoId,
      title: snippet.title,
      description: snippet.description,
      duration: contentDetails.duration,
      channelName: snippet.channelTitle,
      viewCount: parseInt(statistics.viewCount || '0'),
      likeCount: parseInt(statistics.likeCount || '0'),
      publishedAt: snippet.publishedAt,
      thumbnailUrl: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      tags: snippet.tags || [],
      categoryId: snippet.categoryId
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

async function getPlaylistDetails(playlistId: string): Promise<YouTubePlaylistDetails | null> {
  try {
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&part=snippet,contentDetails&key=${youtubeApiKey}`
    );
    
    if (!playlistResponse.ok) {
      console.error('YouTube API error:', await playlistResponse.text());
      return null;
    }
    
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      console.error('No playlist found for ID:', playlistId);
      return null;
    }
    
    const playlist = playlistData.items[0];
    const snippet = playlist.snippet;
    const contentDetails = playlist.contentDetails;
    
    return {
      playlistId,
      title: snippet.title,
      description: snippet.description,
      channelName: snippet.channelTitle,
      videoCount: contentDetails.itemCount,
      publishedAt: snippet.publishedAt,
      thumbnailUrl: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url
    };
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    return null;
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractPlaylistId(url: string): string | null {
  const pattern = /[?&]list=([^&\n]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, url, courseId, videoId, playlistId } = await req.json();

    console.log('YouTube integration request:', { action, url, courseId, videoId, playlistId });

    switch (action) {
      case 'extract_video_info': {
        if (!url) {
          return new Response(JSON.stringify({ error: 'URL is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const extractedVideoId = extractVideoId(url);
        const extractedPlaylistId = extractPlaylistId(url);
        
        if (!extractedVideoId) {
          return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const videoDetails = await getVideoDetails(extractedVideoId);
        if (!videoDetails) {
          return new Response(JSON.stringify({ error: 'Failed to fetch video details' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let playlistDetails = null;
        if (extractedPlaylistId) {
          playlistDetails = await getPlaylistDetails(extractedPlaylistId);
        }

        return new Response(JSON.stringify({
          videoDetails,
          playlistDetails,
          extractedVideoId,
          extractedPlaylistId
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_course_youtube_data': {
        if (!courseId) {
          return new Response(JSON.stringify({ error: 'Course ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updates: any = {};
        
        if (videoId) {
          const videoDetails = await getVideoDetails(videoId);
          if (videoDetails) {
            updates.youtube_video_id = videoId;
            updates.youtube_channel_name = videoDetails.channelName;
            updates.video_duration = videoDetails.duration;
            updates.view_count = videoDetails.viewCount;
            updates.like_count = videoDetails.likeCount;
            updates.youtube_stats = {
              publishedAt: videoDetails.publishedAt,
              tags: videoDetails.tags,
              categoryId: videoDetails.categoryId
            };
            updates.external_url = `https://www.youtube.com/watch?v=${videoId}`;
            updates.content_type = 'video';
            updates.thumbnail_url = videoDetails.thumbnailUrl;
          }
        }

        if (playlistId) {
          const playlistDetails = await getPlaylistDetails(playlistId);
          if (playlistDetails) {
            updates.youtube_playlist_id = playlistId;
            updates.youtube_channel_name = playlistDetails.channelName;
            updates.content_type = 'playlist';
            updates.thumbnail_url = playlistDetails.thumbnailUrl;
          }
        }

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          
          const { error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId);

          if (error) {
            console.error('Error updating course:', error);
            return new Response(JSON.stringify({ error: 'Failed to update course' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        return new Response(JSON.stringify({ success: true, updates }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync_youtube_stats': {
        if (!courseId) {
          return new Response(JSON.stringify({ error: 'Course ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get course data
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('youtube_video_id, youtube_playlist_id')
          .eq('id', courseId)
          .single();

        if (courseError || !course) {
          return new Response(JSON.stringify({ error: 'Course not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updates: any = {};

        if (course.youtube_video_id) {
          const videoDetails = await getVideoDetails(course.youtube_video_id);
          if (videoDetails) {
            updates.view_count = videoDetails.viewCount;
            updates.like_count = videoDetails.likeCount;
            updates.youtube_stats = {
              ...updates.youtube_stats,
              viewCount: videoDetails.viewCount,
              likeCount: videoDetails.likeCount,
              lastSynced: new Date().toISOString()
            };
          }
        }

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          
          const { error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId);

          if (error) {
            console.error('Error syncing stats:', error);
            return new Response(JSON.stringify({ error: 'Failed to sync stats' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        return new Response(JSON.stringify({ success: true, updates }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in YouTube integration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});