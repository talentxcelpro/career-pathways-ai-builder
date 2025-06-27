
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Archive, MessageCircle } from "lucide-react";

const ArchivedMessages = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Archived Messages</h1>
            <p className="text-gray-600 mt-1">View your archived conversations</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Archive className="h-5 w-5 mr-2" />
              Archived Conversations
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No archived messages</h3>
            <p className="text-gray-600">Conversations you archive will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArchivedMessages;
