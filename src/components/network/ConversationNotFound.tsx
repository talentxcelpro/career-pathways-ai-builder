
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MoreVertical } from "lucide-react";

const ConversationNotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-2 py-3">
        <Link to="/network/messages" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-3 transition-colors text-sm">
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Messages
        </Link>
        <Card className="shadow-lg border-0">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Conversation not found</h3>
            <p className="text-gray-600 text-xs">This conversation may have been deleted or you don't have access to it.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationNotFound;
