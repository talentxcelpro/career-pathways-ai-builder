import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoId, action, playlistId } = await req.json()
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')

    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured')
    }

    let result = {}

    switch (action) {
      case 'getVideoDetails':
        if (!videoId) throw new Error('Video ID required')
        
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics`
        )
        
        if (!videoResponse.ok) {
          throw new Error('Failed to fetch video details')
        }
        
        const videoData = await videoResponse.json()
        if (!videoData.items || videoData.items.length === 0) {
          throw new Error('Video not found')
        }
        
        const video = videoData.items[0]
        result = {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
          duration: video.contentDetails.duration,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          publishedAt: video.snippet.publishedAt,
          channelTitle: video.snippet.channelTitle,
          tags: video.snippet.tags || []
        }
        break

      case 'getPlaylistDetails':
        if (!playlistId) throw new Error('Playlist ID required')
        
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
        )
        
        if (!playlistResponse.ok) {
          throw new Error('Failed to fetch playlist details')
        }
        
        const playlistData = await playlistResponse.json()
        if (!playlistData.items || playlistData.items.length === 0) {
          throw new Error('Playlist not found')
        }
        
        const playlist = playlistData.items[0]
        
        // Get playlist items
        const itemsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails&maxResults=50`
        )
        
        const itemsData = await itemsResponse.json()
        
        result = {
          id: playlist.id,
          title: playlist.snippet.title,
          description: playlist.snippet.description,
          thumbnail: playlist.snippet.thumbnails.maxres?.url || playlist.snippet.thumbnails.high?.url,
          itemCount: playlist.contentDetails.itemCount,
          channelTitle: playlist.snippet.channelTitle,
          videos: itemsData.items?.map((item: any) => ({
            videoId: item.contentDetails.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url,
            position: item.snippet.position
          })) || []
        }
        break

      case 'extractFromUrl':
        const { url } = await req.json()
        if (!url) throw new Error('URL required')
        
        // Extract video ID from various YouTube URL formats
        let extractedVideoId = null
        let extractedPlaylistId = null
        
        const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
        if (videoIdMatch) {
          extractedVideoId = videoIdMatch[1]
        }
        
        const playlistIdMatch = url.match(/[?&]list=([^&\n?#]+)/)
        if (playlistIdMatch) {
          extractedPlaylistId = playlistIdMatch[1]
        }
        
        if (!extractedVideoId && !extractedPlaylistId) {
          throw new Error('Invalid YouTube URL')
        }
        
        result = {
          videoId: extractedVideoId,
          playlistId: extractedPlaylistId
        }
        break

      case 'searchVideos':
        const { query, maxResults = 10 } = await req.json()
        if (!query) throw new Error('Search query required')
        
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=${maxResults}`
        )
        
        if (!searchResponse.ok) {
          throw new Error('Failed to search videos')
        }
        
        const searchData = await searchResponse.json()
        
        result = {
          videos: searchData.items?.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
          })) || []
        }
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('YouTube API Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})