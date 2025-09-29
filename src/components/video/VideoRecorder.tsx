import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  Square, 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Camera, 
  Mic, 
  MicOff,
  VideoOff,
  RotateCcw
} from 'lucide-react';

interface VideoRecorderProps {
  onVideoRecorded: (blob: Blob, duration: number) => void;
  maxDuration?: number;
  className?: string;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoRecorded,
  maxDuration = 120, // 2 minutes default
  className = ''
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: isAudioEnabled
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setHasPermission(true);

      toast({
        title: "Permissions Granted",
        description: "Camera and microphone access enabled",
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setHasPermission(false);
      toast({
        title: "Permission Denied",
        description: "Please allow camera and microphone access to record videos",
        variant: "destructive"
      });
    }
  }, [isAudioEnabled, isVideoEnabled, toast]);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) {
      await requestPermissions();
      if (!streamRef.current) return;
    }

    try {
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
        audioBitsPerSecond: 128000   // 128 kbps
      };

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        onVideoRecorded(blob, duration);
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Your video introduction is being recorded",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Unable to start video recording",
        variant: "destructive"
      });
    }
  }, [duration, maxDuration, onVideoRecorded, requestPermissions, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      toast({
        title: "Recording Completed",
        description: `Video recorded successfully (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
      });
    }
  }, [isRecording, duration, toast]);

  const resetRecording = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    chunksRef.current = [];
  }, [videoUrl]);

  const toggleAudio = useCallback(async () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [isVideoEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Record Video Introduction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">REC {formatTime(duration)}</span>
            </div>
          )}

          {/* Duration Badge */}
          {videoBlob && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {formatTime(duration)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* Permission Request */}
          {hasPermission === null && (
            <Button onClick={requestPermissions} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Enable Camera & Microphone
            </Button>
          )}

          {/* Recording Controls */}
          {hasPermission && !videoBlob && (
            <div className="flex justify-center gap-3">
              <Button
                onClick={toggleVideo}
                variant="outline"
                size="sm"
                className={isVideoEnabled ? '' : 'bg-red-50 border-red-200'}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={toggleAudio}
                variant="outline"
                size="sm"
                className={isAudioEnabled ? '' : 'bg-red-50 border-red-200'}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>

              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white px-6"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 px-6"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          )}

          {/* Playback Controls */}
          {videoBlob && (
            <div className="flex justify-center gap-3">
              <Button
                onClick={resetRecording}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Record Again
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(duration)}</span>
              <span>{formatTime(maxDuration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(duration / maxDuration) * 100}%` }}
              />
            </div>
          </div>

          {/* Recording Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recording Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep your introduction between 30-120 seconds</li>
              <li>• Introduce yourself and your professional background</li>
              <li>• Mention your skills and what you're looking for</li>
              <li>• Speak clearly and maintain eye contact with the camera</li>
              <li>• Ensure good lighting and minimal background noise</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};