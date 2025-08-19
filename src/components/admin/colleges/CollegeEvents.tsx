import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, MapPin } from 'lucide-react';

export const CollegeEvents: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">College Events</h2>
          <p className="text-muted-foreground">Manage college-hosted events</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <Calendar className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">All events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Ongoing events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <MapPin className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Total registrations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
          <CardDescription>College events calendar and management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No events scheduled yet
          </div>
        </CardContent>
      </Card>
    </div>
  );
};