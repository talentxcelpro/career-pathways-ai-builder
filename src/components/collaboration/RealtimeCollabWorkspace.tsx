import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Users, Share2, Clock, Edit3, MessageSquare, Eye, Download } from 'lucide-react';
import { useRealtimeCollab } from '@/hooks/useRealtimeCollab';

export const RealtimeCollabWorkspace: React.FC = () => {
  const {
    activeDocuments,
    collaborators,
    createDocument,
    joinDocument,
    isLoading
  } = useRealtimeCollab();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collaboration Workspace</h2>
          <p className="text-muted-foreground">Real-time document collaboration and project management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => createDocument({ type: 'document' })}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            New Document
          </Button>
          <Button 
            variant="outline"
            onClick={() => createDocument({ type: 'project' })}
            disabled={isLoading}
          >
            <Users className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Active Collaborations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Active Collaborations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeDocuments.length > 0 ? (
            <div className="space-y-3">
              {activeDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{doc.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {doc.activeCollaborators} active
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {doc.lastModified}
                        </span>
                        <Badge variant={doc.isLive ? 'default' : 'secondary'}>
                          {doc.isLive ? 'Live' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {doc.collaborators.slice(0, 3).map((collaborator, idx) => (
                        <div 
                          key={idx}
                          className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs"
                        >
                          {collaborator.name.charAt(0)}
                        </div>
                      ))}
                      {doc.collaborators.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs">
                          +{doc.collaborators.length - 3}
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => joinDocument(doc.id)}
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
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Active Collaborations</h3>
              <p className="text-muted-foreground mb-4">
                Create or join a document to start collaborating
              </p>
              <Button onClick={() => createDocument({ type: 'document' })}>
                <FileText className="h-4 w-4 mr-2" />
                Create First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Document Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Project Proposal</h3>
                    <p className="text-xs text-muted-foreground">Business template</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Collaborative project proposal with sections for goals, timeline, and resources
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Meeting Notes</h3>
                    <p className="text-xs text-muted-foreground">Team template</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Real-time meeting notes with action items and participant tracking
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Review Document</h3>
                    <p className="text-xs text-muted-foreground">Feedback template</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Structured document review with comment threads and approval workflow
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { user: 'Sarah Chen', action: 'edited', document: 'Q4 Strategy Doc', time: '2 min ago' },
                { user: 'Mike Johnson', action: 'commented on', document: 'Product Roadmap', time: '5 min ago' },
                { user: 'Lisa Park', action: 'shared', document: 'Budget Proposal', time: '12 min ago' },
                { user: 'David Kim', action: 'created', document: 'Team Meeting Notes', time: '1 hour ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium">{activity.document}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Share workspace link
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export all documents
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Invite team members
              </Button>
              <div className="border-t pt-3 mt-3">
                <Input placeholder="Search documents..." className="mb-2" />
                <Button size="sm" variant="outline" className="w-full">
                  Advanced Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};