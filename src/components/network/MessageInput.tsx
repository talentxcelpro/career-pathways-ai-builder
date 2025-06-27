
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Mic, Image, Plus } from "lucide-react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  sendMessageMutation: any;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleKeyPress,
  sendMessageMutation
}) => {
  return (
    <div className="border-t bg-white p-1">
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-5 w-5 p-0">
          <Plus className="h-2.5 w-2.5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-5 w-5 p-0">
          <Paperclip className="h-2.5 w-2.5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-5 w-5 p-0">
          <Image className="h-2.5 w-2.5" />
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-5 w-5 p-0">
          <Smile className="h-2.5 w-2.5" />
        </Button>
        
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-0 bg-gray-100 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-full px-1.5 py-0.5 text-xs transition-all h-6"
          disabled={sendMessageMutation.isPending}
        />
        
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-5 w-5 p-0">
          <Mic className="h-2.5 w-2.5" />
        </Button>
        
        <Button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-1.5 py-0.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 h-6 text-xs"
        >
          <Send className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
