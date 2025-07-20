import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Facebook, Linkedin, Youtube, Twitter, ExternalLink, Share2 } from 'lucide-react';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/groups/505063915318291',
    icon: Facebook,
    color: 'hover:bg-blue-600 hover:text-white',
    description: 'Join our Facebook community for career tips and networking'
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/talentxcel-services-private-limited/posts/',
    icon: Linkedin,
    color: 'hover:bg-blue-700 hover:text-white',
    description: 'Follow us on LinkedIn for professional insights and job updates'
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@talentxcel-net',
    icon: Youtube,
    color: 'hover:bg-red-600 hover:text-white',
    description: 'Subscribe to our YouTube channel for career guidance videos'
  },
  {
    name: 'Twitter',
    url: 'https://x.com/TalentxcelS',
    icon: Twitter,
    color: 'hover:bg-black hover:text-white',
    description: 'Follow us on X (Twitter) for the latest career trends and tips'
  }
];

interface SocialConnectProps {
  title?: string;
  description?: string;
  showDescription?: boolean;
  variant?: 'default' | 'compact' | 'cards';
  size?: 'sm' | 'md' | 'lg';
}

export const SocialConnect: React.FC<SocialConnectProps> = ({
  title = 'Connect With Us',
  description = 'Follow TalentXcel on social media for career insights, job updates, and networking opportunities',
  showDescription = true,
  variant = 'default',
  size = 'md'
}) => {
  const handleSocialClick = (url: string, platform: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Track social media clicks
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'social_click', {
        platform: platform,
        action: 'external_link'
      });
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'default';
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <Button
              key={social.name}
              variant="outline"
              size={getButtonSize()}
              className={`transition-colors ${social.color}`}
              onClick={() => handleSocialClick(social.url, social.name)}
              aria-label={`Follow us on ${social.name}`}
            >
              <Icon size={getIconSize()} />
            </Button>
          );
        })}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="space-y-4">
        {title && (
          <div className="text-center">
            <h3 className="text-2xl font-bold">{title}</h3>
            {showDescription && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Card key={social.name} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSocialClick(social.url, social.name)}>
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-muted transition-colors ${social.color}`}>
                    <Icon size={24} />
                  </div>
                  <CardTitle className="text-lg">{social.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="text-sm">
                    {social.description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSocialClick(social.url, social.name);
                    }}
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Follow
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Share2 size={24} />
            {title}
          </h3>
          {showDescription && (
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((social) => {
          const Icon = social.icon;
          return (
            <Button
              key={social.name}
              variant="outline"
              size={getButtonSize()}
              className={`transition-all duration-300 ${social.color} min-w-[120px]`}
              onClick={() => handleSocialClick(social.url, social.name)}
            >
              <Icon size={getIconSize()} className="mr-2" />
              {social.name}
              <ExternalLink size={14} className="ml-2" />
            </Button>
          );
        })}
      </div>
    </div>
  );
};