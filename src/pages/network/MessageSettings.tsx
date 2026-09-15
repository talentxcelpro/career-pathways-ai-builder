
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, Bell, Shield, Eye } from "lucide-react";

const MessageSettings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Settings</h1>
            <p className="text-gray-600 mt-1">Manage your messaging preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <p className="text-sm text-gray-600">Receive email alerts for new messages</p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push notifications</Label>
                  <p className="text-sm text-gray-600">Get instant notifications for messages</p>
                </div>
                <Switch id="push-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound-notifications">Sound notifications</Label>
                  <p className="text-sm text-gray-600">Play sound when receiving messages</p>
                </div>
                <Switch id="sound-notifications" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="read-receipts">Read receipts</Label>
                  <p className="text-sm text-gray-600">Let others know when you've read their messages</p>
                </div>
                <Switch id="read-receipts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="typing-indicators">Typing indicators</Label>
                  <p className="text-sm text-gray-600">Show when you're typing</p>
                </div>
                <Switch id="typing-indicators" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="online-status">Online status</Label>
                  <p className="text-sm text-gray-600">Show when you're online</p>
                </div>
                <Switch id="online-status" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Message Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Message Requests
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-accept">Auto-accept from connections</Label>
                  <p className="text-sm text-gray-600">Automatically accept messages from your connections</p>
                </div>
                <Switch id="auto-accept" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="filter-requests">Filter message requests</Label>
                  <p className="text-sm text-gray-600">Hide messages from users with incomplete profiles</p>
                </div>
                <Switch id="filter-requests" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSettings;
