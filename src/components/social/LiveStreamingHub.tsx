import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Radio, Users, Eye, Settings, Share2 } from 'lucide-react';
import { useLiveStreaming } from '@/hooks/useLiveStreaming';

export const LiveStreamingHub: React.FC = () => {
  const {
    activeStreams,
    userStream,
    startStream,
    endStream,
    joinStream,
    isLoading
  } = useLiveStreaming();

  return (
    <div className="space-y-6">
      {/* User's Stream Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Your Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStream ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{userStream.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {userStream.viewer_count} viewers
                    </span>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={endStream}
                    disabled={isLoading}
                  >
                    End Stream
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Video className="h-12 w-12 mx-auto mb-2" />
                  <p>Stream Preview</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Start Your Live Stream</h3>
              <p className="text-muted-foreground mb-4">
                Share your expertise with the community through live streaming
              </p>
              <Button 
                onClick={() => startStream({
                  title: 'Professional Development Session',
                  description: 'Sharing career insights and tips'
                })}
                disabled={isLoading}
              >
                <Radio className="h-4 w-4 mr-2" />
                Go Live
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Streams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Live Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeStreams.map((stream) => (
                <Card key={stream.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-900 rounded-lg mb-3 relative">
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        <Radio className="h-3 w-3 mr-1" />
                        LIVE
                      </Badge>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        <Eye className="h-3 w-3 inline mr-1" />
                        {stream.viewer_count}
                      </div>
                    </div>
                    <h3 className="font-semibold truncate">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {stream.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stream.streamer_name}</span>
                      <Button 
                        size="sm" 
                        onClick={() => joinStream(stream.id)}
                        disabled={isLoading}
                      >
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Live Streams</h3>
              <p className="text-muted-foreground">
                No one is streaming right now. Be the first to go live!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};