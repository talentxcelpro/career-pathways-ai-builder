import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Image, Plus, X } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 pb-[env(safe-area-inset-bottom)]">
      {/* Emoji Quick Bar */}
      {showEmojiPicker && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto py-2 px-1 scrollbar-hide animate-in slide-in-from-bottom-2 duration-300">
          {commonEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="text-2xl hover:scale-125 transition-transform active:scale-95 shrink-0"
            >
              {emoji}
            </button>
          ))}
          <button 
            onClick={() => setShowEmojiPicker(false)}
            className="p-1 rounded-full bg-slate-100 ml-auto shrink-0"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3 max-w-6xl mx-auto">
        <div className="flex items-center gap-1 mb-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10 transition-colors",
              showEmojiPicker && "text-blue-600 bg-blue-50"
            )}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 relative">
          <Input
            placeholder="Write a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-slate-50 border-none rounded-[1.5rem] py-6 px-5 text-[16px] focus-visible:ring-2 focus-visible:ring-blue-500/10 transition-all placeholder:text-slate-400"
            disabled={sendMessageMutation.isPending || uploading}
          />
        </div>
        
        <Button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendMessageMutation.isPending || uploading}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-90 shrink-0 mb-0.5",
            newMessage.trim() 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-slate-100 text-slate-400"
          )}
        >
          <Send className={cn("h-5 w-5", newMessage.trim() && "ml-1")} />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
