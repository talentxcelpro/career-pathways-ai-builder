import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Send, 
  Bot, 
  User, 
  MessageSquare,
  Volume2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRealtimeVoiceChat } from '@/hooks/useRealtimeVoiceChat';
import { toast } from 'sonner';

const WebRTCVoiceCoach: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const {
    messages,
    isConnected,
    isConnecting,
    isAISpeaking,
    error,
    connect,
    disconnect,
    sendTextMessage
  } = useRealtimeVoiceChat();

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Connected to voice chat!');
    } catch (error) {
      toast.error('Failed to connect to voice chat');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info('Disconnected from voice chat');
  };

  const handleSendText = async () => {
    if (!textInput.trim()) return;
    
    try {
      await sendTextMessage(textInput);
      setTextInput('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">WebRTC Voice Coach</h2>
            <p className="text-muted-foreground">High-quality real-time voice conversations with AI</p>
          </div>
        </div>

        {/* Connection Control */}
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : isConnecting ? "secondary" : "outline"}>
            {isConnecting ? (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Connecting...
              </div>
            ) : isConnected ? (
              "Connected"
            ) : (
              "Disconnected"
            )}
          </Badge>
          
          {!isConnected && !isConnecting ? (
            <Button onClick={handleConnect} className="gap-2">
              <Phone className="h-4 w-4" />
              Connect
            </Button>
          ) : (
            <Button 
              onClick={handleDisconnect} 
              variant="destructive" 
              className="gap-2"
              disabled={isConnecting}
            >
              <PhoneOff className="h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>WebRTC Voice Interface</span>
            <div className="flex items-center gap-2">
              {isAISpeaking && (
                <div className="flex items-center gap-1 text-primary">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm">AI Speaking</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {!isConnected ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {isConnecting 
                    ? "Establishing WebRTC connection..." 
                    : "Click Connect to start a voice conversation with your AI career coach"
                  }
                </p>
                {isConnecting && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Setting up secure connection...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-primary font-medium">✅ Voice chat is active</p>
                <p className="text-sm text-muted-foreground">
                  Speak naturally or type below. The AI will respond with voice and show transcripts.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Voice Conversation
            {isConnected && (
              <Badge variant="default" className="ml-auto">WebRTC Active</Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm leading-relaxed">
                      👋 Hello! I'm your WebRTC-powered AI Career Coach. Connect above to start our voice conversation. You can speak naturally or type messages - I'll respond with both voice and text!
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Just now
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {message.isAudio && (
                        <div className="flex items-center gap-1 mt-2">
                          <Volume2 className="h-3 w-3" />
                          <span className="text-xs opacity-70">Voice message</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Text Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message or speak directly..."
                className="flex-1"
                disabled={!isConnected}
              />
              <Button 
                onClick={handleSendText}
                disabled={!textInput.trim() || !isConnected}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">WebRTC Connection</h3>
            <p className="text-sm text-muted-foreground">Low-latency peer-to-peer audio streaming</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Bot className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Advanced AI Model</h3>
            <p className="text-sm text-muted-foreground">Latest GPT-4o with real-time capabilities</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Natural Dialogue</h3>
            <p className="text-sm text-muted-foreground">Seamless back-and-forth conversation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebRTCVoiceCoach;