import React from 'react';
import { EmbedDemo } from '@/components/feed/EmbedDemo';
import { EmbedStatusCheck } from '@/components/feed/EmbedStatusCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UrlInputEmbed } from '@/components/feed/UrlInputEmbed';
import { ContentEmbed } from '@/components/embeds/ContentEmbed';

const FeedEmbeds: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Native-Looking Embeds 
          <Badge variant="secondary" className="ml-2">Beta</Badge>
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform any external content into native TalentXcel posts with minimal source attribution.
        </p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status Check</TabsTrigger>
          <TabsTrigger value="demo">Interactive Demo</TabsTrigger>
          <TabsTrigger value="examples">Live Examples</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-6">
          <EmbedStatusCheck />
        </TabsContent>

        <TabsContent value="demo" className="mt-6">
          <EmbedDemo />
        </TabsContent>

        <TabsContent value="examples" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Embed Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Try embedding different types of content */}
              <div>
                <h4 className="font-medium mb-3">Test URL Input</h4>
                <UrlInputEmbed />
              </div>

              <div className="grid gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Sample YouTube Video</h4>
                  <ContentEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Sample Article</h4>
                  <ContentEmbed url="https://techcrunch.com" />
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Sample Facebook Post</h4>
                  <ContentEmbed url="https://www.facebook.com/share/r/1DCBFuMRLx/?mibextid=wwXIfr" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Supported Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>YouTube - Inline video players</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Facebook - Social post embeds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Instagram - Photo/reel embeds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span>Twitter/X - Tweet embeds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>LinkedIn - Professional posts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Articles - Full previews with images</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Videos play inline without redirects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Native TalentXcel styling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Minimal source attribution</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Legal compliance maintained</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Seamless user experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Automatic content detection</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold mb-2 mx-auto">1</div>
                    <p className="text-sm font-medium">Paste URL</p>
                    <p className="text-xs text-muted-foreground">User shares any link</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold mb-2 mx-auto">2</div>
                    <p className="text-sm font-medium">Auto-Scrape</p>
                    <p className="text-xs text-muted-foreground">System extracts content</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold mb-2 mx-auto">3</div>
                    <p className="text-sm font-medium">Style & Render</p>
                    <p className="text-xs text-muted-foreground">Apply TalentXcel design</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold mb-2 mx-auto">4</div>
                    <p className="text-sm font-medium">Native Feel</p>
                    <p className="text-xs text-muted-foreground">Looks like our content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedEmbeds;