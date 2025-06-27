
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
    <div className="border-t bg-white px-4 py-3">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 transition-colors"
            title="Add attachment"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 transition-colors"
            title="Add image"
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 transition-colors"
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-full px-4 py-2 text-sm transition-all bg-gray-50 focus:bg-white"
          disabled={sendMessageMutation.isPending}
        />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 transition-colors"
          title="Voice message"
        >
          <Mic className="h-4 w-4" />
        </Button>
        
        <Button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
