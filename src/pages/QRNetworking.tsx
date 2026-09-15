import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Scan, Share2, Users, Zap, Camera } from 'lucide-react';
import { CareerQRCard } from '@/components/qr/CareerQRCard';
import { QRScanner } from '@/components/qr/QRScanner';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const QRNetworking: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [scannedProfiles, setScannedProfiles] = useState<string[]>([]);

  const handleQRScan = (result: string) => {
    setScannedProfiles(prev => {
      if (!prev.includes(result)) {
        return [result, ...prev];
      }
      return prev;
    });
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access QR networking features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>QR Networking - TalentXcel</title>
        <meta 
          name="description" 
          content="Instant professional networking with QR codes. Share your career profile and connect with professionals in seconds." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              QR Networking Hub
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Instant professional connections through smart QR technology
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1</div>
                <div className="text-sm text-muted-foreground">QR Generated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Scan className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{scannedProfiles.length}</div>
                <div className="text-sm text-muted-foreground">Profiles Scanned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">∞</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-muted-foreground">Always Active</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="my-qr" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-qr" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  My QR Profile
                </TabsTrigger>
                <TabsTrigger value="scanner" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Scan QR Codes
                </TabsTrigger>
                <TabsTrigger value="network" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  My Network
                </TabsTrigger>
              </TabsList>

              {/* My QR Profile Tab */}
              <TabsContent value="my-qr" className="space-y-6">
                <CareerQRCard 
                  profile={{
                    id: profile.id,
                    full_name: profile.full_name,
                    title: profile.title,
                    location: profile.location,
                    profile_picture_url: profile.profile_picture_url,
                    headline: profile.headline,
                    skills: (profile as any).skills || []
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Sharing Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                          <QrCode className="h-4 w-4 mr-2" />
                          Print Business Cards
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Add to Email Signature
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Share on Social Media
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Profile Views Today</span>
                          <Badge variant="secondary">12</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">QR Code Scans</span>
                          <Badge variant="secondary">8</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Connection Requests</span>
                          <Badge variant="secondary">3</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* QR Scanner Tab */}
              <TabsContent value="scanner" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <QRScanner onScan={handleQRScan} />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Scans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {scannedProfiles.length > 0 ? (
                        <div className="space-y-3">
                          {scannedProfiles.slice(0, 5).map((profile, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    Profile #{index + 1}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono truncate">
                                    {profile}
                                  </p>
                                </div>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Scan className="h-12 w-12 mx-auto mb-4" />
                          <p>No profiles scanned yet</p>
                          <p className="text-sm">Start scanning to build your network</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Network Tab */}
              <TabsContent value="network" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Professional Network
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage connections made through QR networking
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start Networking</h3>
                      <p className="mb-4">
                        Scan QR codes to connect with professionals instantly
                      </p>
                      <Button onClick={() => {
                        // Switch to scanner tab
                        const scannerTab = document.querySelector('[value="scanner"]') as HTMLElement;
                        scannerTab?.click();
                      }}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Scanning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>QR Networking Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Instant Connections</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with professionals in seconds, no typing required
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <QrCode className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-2">Always Updated</h3>
                    <p className="text-sm text-muted-foreground">
                      Your QR code always shows your latest profile information
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-2">Professional Network</h3>
                    <p className="text-sm text-muted-foreground">
                      Build meaningful connections at events and meetings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default QRNetworking;