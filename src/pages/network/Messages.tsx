
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter, 
  Archive, 
  Settings, 
  Bot,
  Users,
  Clock
} from "lucide-react";
import { ConversationsList } from "@/components/network/ConversationsList";
import { useConversations } from "@/hooks/useConversations";

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { conversations, isLoading } = useConversations();

  const filteredConversations = conversations?.filter(conv => {
    if (activeTab === 'unread') {
      // Filter unread conversations (this would need additional logic)
      return true;
    }
    if (activeTab === 'groups') {
      return conv.is_group;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">Connect with your professional network</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/network/messages/ai">
              <Button variant="outline" className="flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </Link>
            <Link to="/network/messages/new">
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Link to="/network/messages/requests">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Requests
                <Badge variant="secondary" className="ml-2">2</Badge>
              </Button>
            </Link>
            <Link to="/network/messages/archived">
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archived
              </Button>
            </Link>
            <Link to="/network/messages/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  <Badge variant="secondary" className="ml-2">3</Badge>
                </TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0">
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading conversations...</p>
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                <ConversationsList
                  conversations={filteredConversations}
                  searchTerm={searchTerm}
                />
              ) : (
                <div className="p-12 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start connecting with your professional network
                  </p>
                  <Link to="/network/messages/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Start a Conversation
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link to="/network/messages/ai">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bot className="h-8 w-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">AI Career Assistant</h3>
                    <p className="text-sm text-gray-600">Get career advice and tips</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/network/messages/requests">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600 mr-4" />
                    <div>
                      <h3 className="font-semibold">Connection Requests</h3>
                      <p className="text-sm text-gray-600">Pending messages</p>
                    </div>
                  </div>
                  <Badge variant="secondary">2</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/network/messages/archived">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Archive className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">Archived</h3>
                    <p className="text-sm text-gray-600">View old conversations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Messages;
