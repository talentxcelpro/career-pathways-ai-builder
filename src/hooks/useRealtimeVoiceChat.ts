import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeChat } from '@/utils/RealtimeAudio';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

export const useRealtimeVoiceChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatRef = useRef<RealtimeChat | null>(null);
  const currentTranscriptRef = useRef<string>('');
  const userTranscriptRef = useRef<string>('');

  const handleMessage = useCallback((event: any) => {
    console.log('📨 Handling message:', event.type);

    switch (event.type) {
      case 'response.audio_transcript.delta':
        if (event.delta) {
          currentTranscriptRef.current += event.delta;
        }
        break;

      case 'response.audio_transcript.done':
        if (currentTranscriptRef.current.trim()) {
          const aiMessage: Message = {
            id: Date.now().toString(),
            type: 'ai',
            content: currentTranscriptRef.current.trim(),
            timestamp: new Date(),
            isAudio: true
          };
          setMessages(prev => [...prev, aiMessage]);
          currentTranscriptRef.current = '';
        }
        setIsAISpeaking(false);
        break;

      case 'input_audio_buffer.speech_started':
        console.log('🎤 User started speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('🔇 User stopped speaking');
        if (userTranscriptRef.current.trim()) {
          const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: userTranscriptRef.current.trim(),
            timestamp: new Date(),
            isAudio: true
          };
          setMessages(prev => [...prev, userMessage]);
          userTranscriptRef.current = '';
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          userTranscriptRef.current = event.transcript;
        }
        break;

      case 'response.created':
        console.log('🎯 AI response started');
        setIsAISpeaking(true);
        break;

      case 'response.done':
        console.log('✅ AI response completed');
        setIsAISpeaking(false);
        break;

      case 'response.function_call_arguments.done':
        console.log('🔧 Function call:', event.name, event.arguments);
        
        let result = "";
        if (event.name === 'get_career_insights') {
          const args = JSON.parse(event.arguments);
          result = `Based on current market analysis for ${args.topic}, here are key insights: Focus on developing both technical and soft skills, particularly in areas like AI literacy, emotional intelligence, and adaptability. The job market is increasingly favoring candidates who can demonstrate continuous learning and cross-functional collaboration.`;
        } else if (event.name === 'analyze_market_trends') {
          const args = JSON.parse(event.arguments);
          result = `Market analysis for ${args.industry}: Strong growth projected, with increasing demand for ${args.role || 'skilled professionals'}. Remote and hybrid work options continue to expand. Key trends include AI integration, sustainability focus, and emphasis on data-driven decision making.`;
        }

        // Send function result back
        if (chatRef.current?.isReady()) {
          const functionResult = {
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: event.call_id,
              output: result
            }
          };
          
          chatRef.current.dc?.send(JSON.stringify(functionResult));
          chatRef.current.dc?.send(JSON.stringify({ type: "response.create" }));
        }
        break;

      case 'error':
        console.error('❌ Realtime API error:', event);
        setError(event.error?.message || 'An error occurred');
        break;

      default:
        console.log('📝 Unhandled event type:', event.type);
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('🔌 Starting WebRTC connection...');
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      setIsConnected(true);
      setIsConnecting(false);
      
      console.log('✅ WebRTC connection established');
      
    } catch (error) {
      console.error('❌ Failed to connect:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [isConnecting, isConnected, handleMessage]);

  const disconnect = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsAISpeaking(false);
    setError(null);
    currentTranscriptRef.current = '';
    userTranscriptRef.current = '';
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!chatRef.current || !isConnected) {
      throw new Error('Not connected to voice chat');
    }

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isAudio: false
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI
    await chatRef.current.sendMessage(text);
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages,
    isConnected,
    isConnecting,
    isAISpeaking,
    error,
    connect,
    disconnect,
    sendTextMessage
  };
};