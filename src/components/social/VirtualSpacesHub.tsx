import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Headphones, Users, Play, Settings, Globe, Zap, Calendar } from 'lucide-react';
import { useVirtualSpaces } from '@/hooks/useVirtualSpaces';

export const VirtualSpacesHub: React.FC = () => {
  const {
    spaces,
    activeSessions,
    createSpace,
    joinSession,
    isLoading
  } = useVirtualSpaces();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Headphones className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Create VR Space</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Host immersive career discussions in virtual reality
            </p>
            <Button 
              onClick={() => createSpace({
                name: 'Career Networking VR',
                type: 'vr',
                capacity: 20
              })}
              disabled={isLoading}
              className="w-full"
            >
              Create VR Space
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-secondary/30 hover:border-secondary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold mb-2">AR Meeting Room</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enhanced video calls with augmented reality features
            </p>
            <Button 
              variant="secondary"
              onClick={() => createSpace({
                name: 'AR Interview Prep',
                type: 'ar',
                capacity: 10
              })}
              disabled={isLoading}
              className="w-full"
            >
              Create AR Room
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-accent/30 hover:border-accent/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold mb-2">Quick Session</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start an instant virtual meetup with colleagues
            </p>
            <Button 
              variant="outline"
              onClick={() => createSpace({
                name: 'Quick Chat',
                type: 'standard',
                capacity: 5
              })}
              disabled={isLoading}
              className="w-full"
            >
              Start Session
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Your Virtual Spaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Your Virtual Spaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          {spaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {spaces.map((space) => (
                <Card key={space.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{space.name}</h3>
                        <p className="text-sm text-muted-foreground">{space.description}</p>
                      </div>
                      <Badge variant={space.type === 'vr' ? 'default' : space.type === 'ar' ? 'secondary' : 'outline'}>
                        {space.type.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {space.current_participants}/{space.max_capacity}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(space.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Enter Space
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Headphones className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Virtual Spaces Yet</h3>
              <p className="text-muted-foreground">
                Create your first virtual space to start hosting immersive meetings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length > 0 ? (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Headphones className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{session.space_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Hosted by {session.host_name} • {session.duration} minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        {session.participant_count} participants
                      </div>
                      <Badge variant="secondary" className="mt-1">
                        {session.space_type.toUpperCase()}
                      </Badge>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => joinSession(session.id)}
                      disabled={isLoading}
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Active Sessions</h3>
              <p className="text-muted-foreground">
                No virtual sessions are currently running. Create one to get started!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};