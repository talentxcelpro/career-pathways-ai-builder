import React, { useState, useRef, useEffect } from 'react';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const MobileQRScanner: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setHasPermission(false);
      setError('Camera permission denied');
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setError(null);
      }
    } catch (err) {
      setError('Failed to start camera');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <MobileNavWrapper>
      <div className="p-4 space-y-6 native-app-style ios-scroll safe-area-top">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Scanner</h1>
          <p className="text-sm text-gray-600">Scan QR codes to connect and share</p>
        </div>

        {/* Camera Section */}
        <div className="native-card p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code</h2>
            <p className="text-sm text-gray-600">Point your camera at a QR code</p>
          </div>

          {!hasPermission && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Camera Permission Required</h3>
              <p className="text-sm text-gray-600 mb-4">Please allow camera access to scan QR codes</p>
              <Button onClick={requestCameraPermission} className="touch-feedback">
                Enable Camera
              </Button>
            </div>
          )}

          {hasPermission && !isScanning && (
            <div className="text-center py-8">
              <Button onClick={startScanning} size="lg" className="touch-feedback">
                Start Scanning
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg bg-black"
                playsInline
                muted
              />
              <div className="absolute inset-0 border-2 border-white rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border-2 border-primary rounded-lg animate-pulse"></div>
              </div>
              <Button
                onClick={stopScanning}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 touch-feedback"
              >
                Stop
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className="native-card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Scan Result</h3>
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm font-mono text-gray-800 break-all">{scanResult}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(scanResult);
                  setFeedback('Copied to clipboard!');
                }}
                variant="outline"
                size="sm"
                className="flex-1 touch-feedback"
              >
                Copy
              </Button>
              <Button
                onClick={() => window.open(scanResult, '_blank')}
                disabled={!scanResult.startsWith('http')}
                size="sm"
                className="flex-1 touch-feedback"
              >
                Open
              </Button>
            </div>
          </div>
        )}

        {/* My QR Code */}
        <div className="native-card p-6">
          <h3 className="font-semibold text-gray-900 mb-3">My QR Code</h3>
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
              <div ref={qrCodeRef} className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">QR Code</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Share this QR code with others to connect</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button
                onClick={() => setFeedback('QR code shared!')}
                variant="outline"
                size="sm"
                className="touch-feedback"
              >
                Share
              </Button>
              <Button
                onClick={() => setFeedback('QR code downloaded!')}
                variant="outline"
                size="sm"
                className="touch-feedback"
              >
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="native-card p-4 text-center touch-feedback">
            <svg className="w-6 h-6 mx-auto mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.502L3 21l1.502-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <p className="text-sm font-medium">Scan History</p>
          </div>
          <div className="native-card p-4 text-center touch-feedback">
            <svg className="w-6 h-6 mx-auto mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium">Settings</p>
          </div>
        </div>

        {feedback && (
          <div className="fixed bottom-20 left-4 right-4 z-50">
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg text-center text-sm">
              {feedback}
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </MobileNavWrapper>
  );
};

export default MobileQRScanner;