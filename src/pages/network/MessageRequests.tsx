
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Check, X } from "lucide-react";

const MessageRequests = () => {
  // Mock data - replace with real data later
  const requests = [
    {
      id: '1',
      sender: {
        name: 'John Smith',
        title: 'Software Engineer at TechCorp',
        avatar: null
      },
      message: 'Hi! I saw your profile and would love to connect. I work in similar field.',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      sender: {
        name: 'Sarah Johnson',
        title: 'Product Manager at StartupXYZ',
        avatar: null
      },
      message: 'Hello! I came across your profile and was impressed by your experience.',
      timestamp: '1 day ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Requests</h1>
            <p className="text-gray-600 mt-1">Review connection requests from new contacts</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Pending Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="divide-y">
              {requests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.sender.avatar} />
                      <AvatarFallback>
                        {request.sender.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.sender.name}</h3>
                          <p className="text-sm text-gray-600">{request.sender.title}</p>
                        </div>
                        <span className="text-xs text-gray-500">{request.timestamp}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{request.message}</p>
                      
                      <div className="flex space-x-3">
                        <Button size="sm" className="flex items-center">
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageRequests;
