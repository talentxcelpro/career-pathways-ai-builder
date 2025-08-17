
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Image, Plus } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useFileUpload({ 
    bucket: 'post-media',
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '😢', '😮', '😡', '🙄', '😎', '🤗'];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      const url = await uploadFile(file);
      
      // Send the file URL as a message
      const fileMessage = `📎 ${file.name}\n${url}`;
      setNewMessage(fileMessage);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t bg-white px-2 py-2 relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-2 right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 mb-1 z-10">
          <div className="grid grid-cols-8 gap-1">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="p-1 hover:bg-gray-100 rounded text-sm transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-1">
        {/* File Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx"
        />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-0 transition-colors"
          title="Attach file"
          onClick={() => {
            console.log('Attachment clicked');
            fileInputRef.current?.click();
          }}
          disabled={uploading}
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          ) : (
            <Paperclip className="h-3 w-3" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-0 transition-colors"
          title="Add image"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Image className="h-3 w-3" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-gray-500 hover:text-blue-600 hover:bg-blue-50 h-6 w-6 p-0 transition-colors ${showEmojiPicker ? 'bg-blue-50 text-blue-600' : ''}`}
          title="Add emoji"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-3 w-3" />
        </Button>
        
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent rounded-full px-3 py-1 text-xs transition-all bg-gray-50 focus:bg-white h-7"
          disabled={sendMessageMutation.isPending || uploading}
        />
        
        <Button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendMessageMutation.isPending || uploading}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-2 py-1 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-7 w-7"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
