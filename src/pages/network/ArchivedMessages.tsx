
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Archive, MessageCircle } from "lucide-react";

const ArchivedMessages = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Archived Messages</h1>
            <p className="text-slate-700 mt-1 font-medium">View your archived conversations</p>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-900 font-semibold tracking-tight">
              <Archive className="h-5 w-5 mr-2" />
              Archived Conversations
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-12 text-center">
            <MessageCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2 tracking-tight">No archived messages</h3>
            <p className="text-slate-600 font-medium">Conversations you archive will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArchivedMessages;
