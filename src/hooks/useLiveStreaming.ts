import { useState, useEffect } from 'react';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  streamer_name: string;
  viewer_count: number;
  created_at: string;
}

interface StreamConfig {
  title: string;
  description: string;
}

export const useLiveStreaming = () => {
  const [activeStreams, setActiveStreams] = useState<LiveStream[]>([]);
  const [userStream, setUserStream] = useState<LiveStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for active streams
    setActiveStreams([
      {
        id: '1',
        title: 'Career Tips for Software Engineers',
        description: 'Live Q&A session about breaking into tech',
        streamer_name: 'Sarah Chen',
        viewer_count: 124,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Resume Review Session',
        description: 'Get your resume reviewed live',
        streamer_name: 'Mike Johnson',
        viewer_count: 89,
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  const startStream = async (config: StreamConfig) => {
    setIsLoading(true);
    try {
      // Mock starting a stream
      const newStream: LiveStream = {
        id: Date.now().toString(),
        title: config.title,
        description: config.description,
        streamer_name: 'You',
        viewer_count: 0,
        created_at: new Date().toISOString()
      };
      setUserStream(newStream);
    } catch (error) {
      console.error('Failed to start stream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endStream = async () => {
    setIsLoading(true);
    try {
      setUserStream(null);
    } catch (error) {
      console.error('Failed to end stream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinStream = async (streamId: string) => {
    setIsLoading(true);
    try {
      // Mock joining a stream
      console.log('Joining stream:', streamId);
    } catch (error) {
      console.error('Failed to join stream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeStreams,
    userStream,
    startStream,
    endStream,
    joinStream,
    isLoading
  };
};