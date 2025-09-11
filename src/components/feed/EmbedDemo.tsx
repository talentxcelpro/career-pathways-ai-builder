import React from 'react';
import { ContentEmbed } from '@/components/embeds/ContentEmbed';
import { UrlInputEmbed } from './UrlInputEmbed';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const EmbedDemo: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Native-Looking Embeds Demo
            <Badge variant="secondary">New Feature</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <div>
            <h3 className="font-medium mb-3">Try It Out</h3>
            <UrlInputEmbed />
          </div>

          {/* Demo Examples */}
          <div className="space-y-4">
            <h3 className="font-medium">Example Embeds</h3>
            
            {/* YouTube Example */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">YouTube Video:</p>
              <ContentEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
            </div>

            {/* Article Example */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Article:</p>
              <ContentEmbed url="https://techcrunch.com" />
            </div>

            {/* Social Example */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Social Media:</p>
              <ContentEmbed url="https://facebook.com/post/123" />
            </div>
          </div>

          {/* Features */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Videos play inline without redirects</li>
              <li>• Articles show full previews</li>
              <li>• Tiny source attribution for legal compliance</li>
              <li>• Native TalentXcel styling</li>
              <li>• Works with YouTube, Facebook, Instagram, Twitter, and more</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};