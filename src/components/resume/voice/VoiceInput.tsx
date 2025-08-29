import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onCommand: (command: string, data: any) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onCommand,
  placeholder = "Click to start voice input...",
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
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
            processVoiceCommand(finalTranscript);
            onTranscript(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Voice recognition error. Please try again.');
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    const lowerText = text.toLowerCase();

    try {
      // Command patterns for resume building
      if (lowerText.includes('add experience') || lowerText.includes('add work experience')) {
        const experiencePattern = /add (?:work )?experience (?:at |for )?(.+?) (?:as |from )(.+?)(?:\s+from\s+(.+?)\s+to\s+(.+?))?/i;
        const match = text.match(experiencePattern);
        
        if (match) {
          onCommand('add_experience', {
            company: match[1]?.trim(),
            title: match[2]?.trim(),
            startDate: match[3]?.trim(),
            endDate: match[4]?.trim() || 'Present'
          });
          toast.success('Experience added via voice!');
        }
      }
      
      else if (lowerText.includes('add education') || lowerText.includes('add degree')) {
        const educationPattern = /add (?:education|degree) (.+?) (?:at |from )(.+?)(?:\s+(?:in\s+)?(.+?))?/i;
        const match = text.match(educationPattern);
        
        if (match) {
          onCommand('add_education', {
            degree: match[1]?.trim(),
            institution: match[2]?.trim(),
            field: match[3]?.trim()
          });
          toast.success('Education added via voice!');
        }
      }
      
      else if (lowerText.includes('add skill')) {
        const skillPattern = /add skill[s]? (.+)/i;
        const match = text.match(skillPattern);
        
        if (match) {
          const skills = match[1].split(/\s+and\s+|,\s*/);
          onCommand('add_skills', { skills });
          toast.success(`${skills.length} skill(s) added via voice!`);
        }
      }
      
      else if (lowerText.includes('add project')) {
        const projectPattern = /add project (.+?)(?:\s+using\s+(.+?))?(?:\s+description\s+(.+?))?/i;
        const match = text.match(projectPattern);
        
        if (match) {
          onCommand('add_project', {
            name: match[1]?.trim(),
            technologies: match[2]?.split(/,\s*/) || [],
            description: match[3]?.trim()
          });
          toast.success('Project added via voice!');
        }
      }
      
      else if (lowerText.includes('update summary') || lowerText.includes('set summary')) {
        const summaryPattern = /(?:update|set) summary (.+)/i;
        const match = text.match(summaryPattern);
        
        if (match) {
          onCommand('update_summary', { summary: match[1].trim() });
          toast.success('Summary updated via voice!');
        }
      }
      
      else if (lowerText.includes('update name') || lowerText.includes('set name')) {
        const namePattern = /(?:update|set) name (?:to )?(.+)/i;
        const match = text.match(namePattern);
        
        if (match) {
          onCommand('update_name', { name: match[1].trim() });
          toast.success('Name updated via voice!');
        }
      }
      
      else if (lowerText.includes('export') && (lowerText.includes('pdf') || lowerText.includes('word'))) {
        const format = lowerText.includes('pdf') ? 'pdf' : 'docx';
        onCommand('export', { format });
        toast.success(`Exporting resume as ${format.toUpperCase()}...`);
      }
      
      else {
        // If no specific command, just treat as general text input
        onCommand('general_input', { text });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error('Error processing voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
      toast.success('Voice input started. Speak now!');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Voice input stopped');
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center text-muted-foreground">
          Voice input is not supported in this browser
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Button
          variant={isListening ? "destructive" : "default"}
          size="sm"
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className="relative"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </Button>

        <div className="flex-1">
          {transcript ? (
            <div className="text-sm p-2 bg-muted rounded-md">
              {transcript}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {isListening ? 'Listening...' : placeholder}
            </div>
          )}
        </div>

        {transcript && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playTTS(transcript)}
            title="Play transcript"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isListening && (
        <div className="mt-3 text-xs text-muted-foreground">
          <div className="mb-1 font-medium">Voice Commands:</div>
          <div className="space-y-1">
            <div>• "Add experience at Google as Software Engineer from 2020 to 2023"</div>
            <div>• "Add education Bachelor's degree from MIT in Computer Science"</div>
            <div>• "Add skills React, TypeScript, and Python"</div>
            <div>• "Add project Portfolio website using React and Node.js"</div>
            <div>• "Update summary to I am a passionate developer..."</div>
            <div>• "Export as PDF" or "Export as Word"</div>
          </div>
        </div>
      )}
    </Card>
  );
};