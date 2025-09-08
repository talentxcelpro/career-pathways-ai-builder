import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioRecorder, encodeAudioForAPI, AudioQueue } from '@/utils/audioUtils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

export const useVoiceChat = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentTranscriptRef = useRef<string>('');

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);
      
      // Resume context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      console.log('🔌 Connecting to voice chat...');
      await initAudioContext();
      
      const ws = new WebSocket('wss://dthlgsnakhoftinssokm.functions.supabase.co/realtime-career-coach');
      
      ws.onopen = () => {
        console.log('✅ Voice chat connected');
        setIsConnected(true);
        setSocket(ws);
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Received message type:', data.type);

        switch (data.type) {
          case 'response.audio.delta':
            if (audioQueueRef.current && data.delta) {
              try {
                // Convert base64 to Uint8Array
                const binaryString = atob(data.delta);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                await audioQueueRef.current.addToQueue(bytes);
                setIsAISpeaking(true);
              } catch (error) {
                console.error('❌ Error processing audio delta:', error);
              }
            }
            break;

          case 'response.audio_transcript.delta':
            if (data.delta) {
              currentTranscriptRef.current += data.delta;
            }
            break;

          case 'response.audio_transcript.done':
            if (currentTranscriptRef.current) {
              const aiMessage: Message = {
                id: Date.now().toString(),
                type: 'ai',
                content: currentTranscriptRef.current,
                timestamp: new Date(),
                isAudio: true
              };
              setMessages(prev => [...prev, aiMessage]);
              currentTranscriptRef.current = '';
            }
            break;

          case 'response.done':
            console.log('✅ AI response completed');
            setIsAISpeaking(false);
            break;

          case 'input_audio_buffer.speech_started':
            console.log('🎤 User started speaking');
            break;

          case 'input_audio_buffer.speech_stopped':
            console.log('🔇 User stopped speaking');
            break;

          case 'error':
            console.error('❌ Voice chat error:', data.message);
            break;

          default:
            console.log('📝 Other message type:', data.type);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 Voice chat disconnected');
        setIsConnected(false);
        setSocket(null);
      };

    } catch (error) {
      console.error('❌ Failed to connect to voice chat:', error);
    }
  }, [initAudioContext]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting voice chat...');
    
    if (socket) {
      socket.close();
    }
    
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    
    if (audioQueueRef.current) {
      audioQueueRef.current.clear();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    setIsAISpeaking(false);
    setIsConnected(false);
    setSocket(null);
  }, [socket]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting voice recording...');
      await initAudioContext();
      
      const recorder = new AudioRecorder((audioData: Float32Array) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          const message = {
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          };
          socket.send(JSON.stringify(message));
        }
      });

      await recorder.start();
      audioRecorderRef.current = recorder;
      setIsRecording(true);
      
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
    }
  }, [socket, initAudioContext]);

  const stopRecording = useCallback(() => {
    console.log('🔇 Stopping voice recording...');
    
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    
    setIsRecording(false);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    
    console.log('💬 Sending text message:', text);
    
    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isAudio: false
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to OpenAI
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    };
    
    socket.send(JSON.stringify(event));
    socket.send(JSON.stringify({ type: 'response.create' }));
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages,
    isConnected,
    isRecording,
    isAISpeaking,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage
  };
};