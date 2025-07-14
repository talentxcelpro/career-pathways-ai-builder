import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Camera, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface InterviewSession {
  id: string;
  jobTitle: string;
  company: string;
  interviewer: string;
  scheduledTime: Date;
  duration: number;
  type: 'one-on-one' | 'panel' | 'technical' | 'behavioral';
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
}

export const MobileVideoInterview = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Mock interview data
    const mockInterviews: InterviewSession[] = [
      {
        id: '1',
        jobTitle: 'Senior React Developer',
        company: 'TechCorp',
        interviewer: 'Sarah Johnson',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        duration: 45,
        type: 'technical',
        status: 'upcoming'
      },
      {
        id: '2',
        jobTitle: 'Frontend Engineer',
        company: 'StartupXYZ',
        interviewer: 'Mike Chen',
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 30,
        type: 'behavioral',
        status: 'upcoming'
      }
    ];

    setInterviews(mockInterviews);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCallActive(true);
      toast({
        title: "Interview Started",
        description: "Your video interview is now live",
      });
    } catch (error) {
      toast({
        title: "Camera Access Required",
        description: "Please allow camera and microphone access",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCallActive(false);
    setCallDuration(0);
    toast({
      title: "Interview Ended",
      description: "Thank you for your time!",
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatInterviewTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isCallActive) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Video Container */}
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Call Duration */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {formatDuration(callDuration)}
          </div>
          
          {/* Connection Status */}
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Live
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-900">
          <div className="flex justify-center items-center gap-4">
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              className="rounded-full w-14 h-14 p-0"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
            
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              className="rounded-full w-14 h-14 p-0"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14 p-0"
              onClick={endCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Video Interviews</h2>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Camera Test */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Camera Test</h3>
        <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startCall}>
            <Camera className="h-4 w-4 mr-1" />
            Test Camera
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </Card>

      {/* Upcoming Interviews */}
      <div className="space-y-3">
        <h3 className="font-medium">Upcoming Interviews</h3>
        {interviews.map((interview) => (
          <Card key={interview.id} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">{interview.jobTitle}</h4>
                  <p className="text-sm text-muted-foreground">{interview.company}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {interview.type}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>with {interview.interviewer}</span>
              </div>

              <div className="text-sm">
                <p className="font-medium">{formatInterviewTime(interview.scheduledTime)}</p>
                <p className="text-muted-foreground text-xs">{interview.duration} minutes</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={startCall}>
                  <Phone className="h-4 w-4 mr-1" />
                  Join Call
                </Button>
                <Button variant="outline" size="sm">
                  Reschedule
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Interview Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Test your camera and audio before the interview</li>
          <li>• Find a quiet, well-lit location</li>
          <li>• Have your resume and questions ready</li>
          <li>• Join 2-3 minutes early</li>
        </ul>
      </Card>
    </div>
  );
};