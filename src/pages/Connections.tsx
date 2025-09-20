import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, MessageCircle, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Connections = () => {
  return (
    <>
      <Helmet>
        <title>Connections | Professional Network & Contacts</title>
        <meta name="description" content="Manage your professional connections. Connect with industry peers, mentors, and potential collaborators." />
        <link rel="canonical" href="https://talentxcel.in/connections" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Network className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">My Connections</h1>
            </div>
            <p className="text-muted-foreground">Build and manage your professional network</p>
          </div>

          <div className="grid gap-6">
            {/* Connection Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-2xl font-bold">156</h3>
                  <p className="text-muted-foreground">Total Connections</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <UserPlus className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-2xl font-bold">23</h3>
                  <p className="text-muted-foreground">New This Month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-2xl font-bold">7</h3>
                  <p className="text-muted-foreground">Active Conversations</p>
                </CardContent>
              </Card>
            </div>

            {/* Suggested Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Suggested Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Sarah Johnson", title: "Senior Developer", company: "TechCorp", mutualConnections: 12 },
                    { name: "Mike Chen", title: "Product Manager", company: "StartupXYZ", mutualConnections: 8 },
                    { name: "Emily Davis", title: "UX Designer", company: "DesignStudio", mutualConnections: 15 },
                    { name: "Alex Rodriguez", title: "Data Scientist", company: "DataInc", mutualConnections: 5 }
                  ].map((person, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{person.name}</h3>
                            <p className="text-sm text-muted-foreground">{person.title}</p>
                            <p className="text-xs text-muted-foreground">{person.company}</p>
                            <Badge variant="outline" className="mt-1">
                              {person.mutualConnections} mutual connections
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm">Connect</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recent Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Jennifer Smith", title: "Marketing Director", status: "Connected 2 days ago" },
                    { name: "Robert Brown", title: "Software Engineer", status: "Connected 1 week ago" },
                    { name: "Lisa Wilson", title: "HR Manager", status: "Connected 2 weeks ago" }
                  ].map((person, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{person.name}</h3>
                          <p className="text-sm text-muted-foreground">{person.title}</p>
                          <p className="text-xs text-muted-foreground">{person.status}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Message</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Connections;