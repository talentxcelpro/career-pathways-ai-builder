import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Send, 
  Bot, 
  User, 
  MessageSquare,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { toast } from 'sonner';

const VoiceCareerCoach: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const {
    messages,
    isConnected,
    isRecording,
    isAISpeaking,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage
  } = useVoiceChat();

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

  const handleMicToggle = async () => {
    if (!isConnected) {
      toast.error('Please connect to voice chat first');
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
        toast.success('Microphone activated');
      } catch (error) {
        toast.error('Failed to access microphone');
      }
    }
  };

  const handleSendText = () => {
    if (!textInput.trim()) return;
    
    if (!isConnected) {
      toast.error('Please connect to voice chat first');
      return;
    }

    sendTextMessage(textInput);
    setTextInput('');
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
            <h2 className="text-2xl font-bold">Voice Career Coach</h2>
            <p className="text-muted-foreground">Have natural conversations with your AI career coach</p>
          </div>
        </div>

        {/* Connection Control */}
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {!isConnected ? (
            <Button onClick={handleConnect} className="gap-2">
              <Phone className="h-4 w-4" />
              Connect
            </Button>
          ) : (
            <Button onClick={handleDisconnect} variant="destructive" className="gap-2">
              <PhoneOff className="h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voice Controls</span>
            <div className="flex items-center gap-2">
              {isAISpeaking && (
                <div className="flex items-center gap-1 text-primary">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm">AI Speaking</span>
                </div>
              )}
              {isRecording && (
                <div className="flex items-center gap-1 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">Listening</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            {/* Microphone Button */}
            <Button
              size="lg"
              onClick={handleMicToggle}
              disabled={!isConnected}
              variant={isRecording ? "destructive" : "default"}
              className={`h-16 w-16 rounded-full transition-all ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {!isConnected 
                  ? "Connect to start voice chat"
                  : isRecording 
                    ? "Tap to stop recording"
                    : "Tap to start talking"
                }
              </p>
              {isConnected && (
                <p className="text-xs text-muted-foreground mt-1">
                  Hands-free conversation with server-side voice detection
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Voice Chat Session
            {isConnected && (
              <Badge variant="default" className="ml-auto">Live</Badge>
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
                      👋 Hello! I'm your voice-enabled AI Career Coach. Connect and start talking to me about your career goals, challenges, or any professional development questions you have.
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
                placeholder="Type a message or use voice..."
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
            <Mic className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Natural Voice Chat</h3>
            <p className="text-sm text-muted-foreground">Speak naturally with real-time audio processing</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <Bot className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">AI Understanding</h3>
            <p className="text-sm text-muted-foreground">Advanced AI comprehension of career contexts</p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Instant Feedback</h3>
            <p className="text-sm text-muted-foreground">Real-time coaching responses and advice</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceCareerCoach;