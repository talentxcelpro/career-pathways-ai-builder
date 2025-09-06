import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users2, Calendar, TrendingUp } from 'lucide-react';

export const CommunityManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Community & Engagement</h2>
          <p className="text-muted-foreground">Foster learning communities and discussions</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Active discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users2 className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Study Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Active groups</p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-sm text-muted-foreground">Participation rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Discussion Forums</CardTitle>
            <CardDescription>Course-specific and general discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">
                No discussions yet
              </div>
              <Button variant="outline" className="w-full">
                Create Forum
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Q&A Sessions</CardTitle>
            <CardDescription>Schedule and manage live interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">
                No sessions scheduled
              </div>
              <Button variant="outline" className="w-full">
                Schedule Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Tools</CardTitle>
          <CardDescription>Engagement and moderation features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col">
              <MessageSquare className="h-6 w-6 mb-2" />
              Moderate Posts
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <Users2 className="h-6 w-6 mb-2" />
              Manage Groups
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};