import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Video, Users } from "lucide-react";
import DirectMessaging from "@/components/communication/DirectMessaging";
import VideoConsultations from "@/components/communication/VideoConsultations";
import GroupChatSystem from "@/components/communication/GroupChatSystem";

const Communication = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Communication Hub</h1>
          <p className="text-muted-foreground">Connect, collaborate, and communicate with your network</p>
        </div>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Direct Messages
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Consultations
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group Chats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Direct Messages</CardTitle>
              <CardDescription>Send and receive private messages with your connections</CardDescription>
            </CardHeader>
            <CardContent>
              <DirectMessaging />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Consultations</CardTitle>
              <CardDescription>Schedule and manage video consultations with experts</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoConsultations />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Chats</CardTitle>
              <CardDescription>Participate in group discussions and communities</CardDescription>
            </CardHeader>
            <CardContent>
              <GroupChatSystem />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communication;