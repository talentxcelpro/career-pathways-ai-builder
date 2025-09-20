import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Feed = () => {
  return (
    <>
      <Helmet>
        <title>Feed | Connect & Share Professional Updates</title>
        <meta name="description" content="Stay connected with your professional network. Share updates, celebrate achievements, and engage with industry insights." />
        <link rel="canonical" href="https://talentxcel.in/feed" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Professional Feed</h1>
            <p className="text-muted-foreground">Connect, share, and grow with your professional network</p>
          </div>

          {/* Post Composer */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <textarea 
                    placeholder="Share your professional insights..."
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button>Share Update</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Posts */}
          {[1, 2, 3].map((post) => (
            <Card key={post}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Professional User</h3>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Excited to share my latest project milestone! Building amazing solutions with cutting-edge technology.</p>
                <div className="flex items-center space-x-6 text-muted-foreground">
                  <button className="flex items-center space-x-2 hover:text-primary">
                    <Heart className="h-4 w-4" />
                    <span>12</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-primary">
                    <MessageCircle className="h-4 w-4" />
                    <span>5</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-primary">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Feed;