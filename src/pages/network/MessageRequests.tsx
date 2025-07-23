
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Check, X } from "lucide-react";

const MessageRequests = () => {
  // Mock data - replace with real data later
  const requests: any[] = [];

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
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No pending requests
            </h3>
            <p className="text-gray-600">
              You're all caught up with message requests!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageRequests;
