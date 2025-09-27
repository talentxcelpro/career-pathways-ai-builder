import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  isActive?: boolean;
  onActiveChange?: (active: boolean) => void;
}

export const VoiceInput = ({ 
  onTranscript, 
  placeholder = "Click to start voice input...",
  isActive = false,
  onActiveChange 
}: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition error. Please try again.');
        setIsListening(false);
        onActiveChange?.(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        onActiveChange?.(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, [onTranscript, onActiveChange]);

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    try {
      setIsListening(true);
      setTranscript('');
      onActiveChange?.(true);
      recognitionRef.current?.start();
      toast.success('Voice input started. Speak now...');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      toast.error('Failed to start voice input');
      setIsListening(false);
      onActiveChange?.(false);
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
      onActiveChange?.(false);
      if (transcript) {
        toast.success('Voice input completed');
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const speakText = (text: string) => {
    if (!speechSynthRef.current || !text.trim()) return;

    // Cancel any ongoing speech
    speechSynthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Speech synthesis error');
    };

    speechSynthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    speechSynthRef.current?.cancel();
    setIsSpeaking(false);
  };

  if (!isSupported) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Voice input not supported in this browser</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 ${isListening ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Voice Input</h3>
            {isListening && (
              <Badge variant="secondary" className="animate-pulse">
                Listening...
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {transcript && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakText(transcript)}
                disabled={isSpeaking}
                className="gap-2"
              >
                {isSpeaking ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {isSpeaking ? 'Stop' : 'Play'}
              </Button>
            )}
            
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className="gap-2"
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              {isListening ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>

        <div className="min-h-[100px] p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
          {transcript ? (
            <p className="text-sm leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">{placeholder}</p>
          )}
        </div>

        {isListening && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-primary rounded-full animate-pulse`}
                  style={{
                    height: Math.random() * 20 + 10,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 Tips: Speak clearly and at a normal pace. Voice input works best in quiet environments.</p>
        </div>
      </CardContent>
    </Card>
  );
};