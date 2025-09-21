import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Star,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useMessaging } from '@/hooks/useMessaging';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
}

interface ChatContact {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  unreadCount: number;
  lastMessage?: string;
}

interface LiveChatProps {
  selectedContact?: ChatContact;
  onContactSelect?: (contact: ChatContact) => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  selectedContact,
  onContactSelect
}) => {
  const { toast } = useToast();
  const { contacts, messages, isLoading, fetchMessages, sendMessage } = useMessaging();
  const [message, setMessage] = useState('');

  const [activeContact, setActiveContact] = useState<ChatContact | null>(
    selectedContact || (contacts.length > 0 ? contacts[0] : null)
  );

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id);
    }
  }, [activeContact, fetchMessages]);

  useEffect(() => {
    if (contacts.length > 0 && !activeContact) {
      setActiveContact(contacts[0]);
    }
  }, [contacts, activeContact]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeContact) return;

    await sendMessage(activeContact.id, message);
    setMessage('');
  };

  const handleContactSelect = (contact: ChatContact) => {
    setActiveContact(contact);
    onContactSelect?.(contact);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Circle className="h-3 w-3 text-gray-400" />;
      case 'delivered': return <CheckCircle2 className="h-3 w-3 text-gray-400" />;
      case 'read': return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Contacts List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                className={`p-3 cursor-pointer transition-colors ${
                  activeContact?.id === contact.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                      <div className="flex items-center gap-1">
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                            {contact.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTime(contact.lastSeen)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2 flex flex-col">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activeContact.avatar} />
                      <AvatarFallback>{activeContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {activeContact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{activeContact.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeContact.isOnline ? 'Online' : `Last seen ${formatTime(activeContact.lastSeen)}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.senderId === 'current-user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            msg.senderId === 'current-user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${
                          msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(msg.timestamp)}
                          </span>
                          {msg.senderId === 'current-user' && getMessageStatusIcon(msg.status)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Smile className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a contact to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};