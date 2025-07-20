import React from 'react';
import { SocialConnect } from '@/components/social/SocialConnect';
import { SocialShare } from '@/components/social/SocialShare';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, MessageCircle, Share2, Heart } from 'lucide-react';

const SocialPage = () => {
  const communityStats = [
    {
      icon: Users,
      label: 'Community Members',
      value: '50K+',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      label: 'Career Success Stories',
      value: '10K+',
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      label: 'Monthly Discussions',
      value: '25K+',
      color: 'text-purple-600'
    },
    {
      icon: Heart,
      label: 'Success Rate',
      value: '95%',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <Badge variant="secondary" className="px-4 py-2">
          Social Community
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold">
          Join the TalentXcel Community
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect with like-minded professionals, share your career journey, and get inspired by success stories from our global community.
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {communityStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <Icon className={`mx-auto mb-2 ${stat.color}`} size={32} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Social Connect Section */}
      <div className="space-y-8">
        <SocialConnect 
          variant="cards"
          showDescription={true}
        />
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Why Join Our Community?
            </CardTitle>
            <CardDescription>
              Discover the benefits of being part of the TalentXcel social network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Networking Opportunities</h4>
                  <p className="text-sm text-muted-foreground">Connect with professionals across industries and build meaningful relationships</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Career Insights</h4>
                  <p className="text-sm text-muted-foreground">Get exclusive tips, industry trends, and career advice from experts</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Job Opportunities</h4>
                  <p className="text-sm text-muted-foreground">Be the first to know about exclusive job openings and career opportunities</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold">Skill Development</h4>
                  <p className="text-sm text-muted-foreground">Access free resources, webinars, and learning materials</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="text-green-600" size={24} />
                Spread the Word
              </CardTitle>
              <CardDescription>
                Help others discover TalentXcel and grow our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SocialShare 
                showTitle={false}
                title="TalentXcel - AI-Powered Career Platform"
                description="Discover your dream job and advance your career with AI-powered tools. Join thousands of professionals who trust TalentXcel for their career growth."
                hashtags={['TalentXcel', 'CareerGrowth', 'JobSearch', 'AI', 'ProfessionalDevelopment']}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
        <CardContent className="pt-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Join Our Community?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start connecting with thousands of professionals who are accelerating their careers with TalentXcel. 
            Follow us on your favorite platform and become part of the conversation.
          </p>
          <SocialConnect 
            showDescription={false}
            variant="default"
            size="lg"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPage;