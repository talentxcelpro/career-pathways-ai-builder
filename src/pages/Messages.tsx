import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, Plus, Phone, Video } from 'lucide-react';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'HR Manager at TechCorp',
      lastMessage: 'Thanks for your application. We\'d like to schedule an interview.',
      time: '2m ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Senior Developer',
      lastMessage: 'The project looks interesting. When can we discuss?',
      time: '1h ago',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'Recruiter at StartupXYZ',
      lastMessage: 'We have a role that might interest you.',
      time: '3h ago',
      unread: 1,
      online: true
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      message: 'Hi! Thank you for applying to the Software Engineer position at TechCorp.',
      time: '10:30 AM',
      isMe: false
    },
    {
      id: 2,
      sender: 'You',
      message: 'Thank you for reaching out! I\'m very interested in the position.',
      time: '10:45 AM',
      isMe: true
    },
    {
      id: 3,
      sender: 'Sarah Johnson',
      message: 'Great! I\'d love to schedule a call to discuss your experience further. Are you available this week?',
      time: '11:00 AM',
      isMe: false
    },
    {
      id: 4,
      sender: 'You',
      message: 'Yes, I\'m available Wednesday or Thursday afternoon. What works best for you?',
      time: '11:15 AM',
      isMe: true
    },
    {
      id: 5,
      sender: 'Sarah Johnson',
      message: 'Thanks for your application. We\'d like to schedule an interview.',
      time: '11:58 AM',
      isMe: false
    }
  ];

  const sendMessage = () => {
    if (newMessage.trim()) {
      // In real app, this would send the message
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto">
          {conversations.map((conversation, index) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation === index ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedConversation(index)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>
                      {conversation.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{conversation.name}</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{conversation.time}</span>
                      {conversation.unread > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conversation.role}</p>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {conversations[selectedConversation]?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{conversations[selectedConversation]?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {conversations[selectedConversation]?.role}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isMe
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;