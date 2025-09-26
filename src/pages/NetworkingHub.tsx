import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lightbulb, Calendar, BookOpen, Network } from "lucide-react";
import ProfessionalNetworking from "@/components/networking/ProfessionalNetworking";
import CommunitiesHub from "@/components/networking/CommunitiesHub";
import MentorshipCenter from "@/components/networking/MentorshipCenter";
import EventsCalendar from "@/components/networking/EventsCalendar";
import SocialLearning from "@/components/networking/SocialLearning";

const NetworkingHub = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Network className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Networking Hub</h1>
          <p className="text-muted-foreground">Build meaningful professional connections and grow your career</p>
        </div>
      </div>

      <Tabs defaultValue="networking" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="networking" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Professional Networking
          </TabsTrigger>
          <TabsTrigger value="communities" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Communities
          </TabsTrigger>
          <TabsTrigger value="mentorship" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Mentorship
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Social Learning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="networking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Networking</CardTitle>
              <CardDescription>Discover and connect with professionals in your field</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfessionalNetworking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Communities</CardTitle>
              <CardDescription>Join industry-specific communities and discussions</CardDescription>
            </CardHeader>
            <CardContent>
              <CommunitiesHub />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentorship" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Programs</CardTitle>
              <CardDescription>Find mentors or become one to guide others</CardDescription>
            </CardHeader>
            <CardContent>
              <MentorshipCenter />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Professional Events</CardTitle>
              <CardDescription>Attend webinars, workshops, and networking events</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsCalendar />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Learning Paths</CardTitle>
              <CardDescription>Learn together with peers and industry experts</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialLearning />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkingHub;