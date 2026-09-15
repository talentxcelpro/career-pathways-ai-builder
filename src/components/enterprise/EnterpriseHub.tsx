import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Video, Users, Calendar, Globe, Shield, Zap, MessageSquare } from 'lucide-react';
import { useEnterpriseHub } from '@/hooks/useEnterpriseHub';

export const EnterpriseHub: React.FC = () => {
  const {
    meetings,
    teams,
    startMeeting,
    createTeam,
    isLoading
  } = useEnterpriseHub();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Video className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Start Meeting</h3>
            <Button 
              onClick={() => startMeeting({ type: 'instant' })}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              Start Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-secondary/30 hover:border-secondary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-3 text-secondary" />
            <h3 className="font-semibold mb-2">Schedule</h3>
            <Button 
              variant="secondary"
              onClick={() => startMeeting({ type: 'scheduled' })}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              Schedule
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-accent/30 hover:border-accent/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-accent" />
            <h3 className="font-semibold mb-2">Team Space</h3>
            <Button 
              variant="outline"
              onClick={() => createTeam()}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              Create Team
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-muted/30 hover:border-muted/50 transition-colors">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">AI Assistant</h3>
            <Button 
              variant="outline"
              className="w-full"
              size="sm"
            >
              Chat with AI
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Active Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{meeting.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {meeting.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {meeting.duration} min
                        </span>
                        {meeting.isRecording && (
                          <Badge variant="destructive" className="text-xs">
                            Recording
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                    <Button size="sm">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Active Meetings</h3>
              <p className="text-muted-foreground">
                Start a meeting or schedule one for later
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enterprise Teams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Enterprise Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{team.name}</h3>
                      <Badge variant={team.isPrivate ? 'secondary' : 'outline'}>
                        {team.isPrivate ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {team.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {team.memberCount} members
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Globe className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Teams Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create enterprise teams to organize your organization
              </p>
              <Button onClick={() => createTeam()} disabled={isLoading}>
                <Building2 className="h-4 w-4 mr-2" />
                Create First Team
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};