import React, { useState } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { MapPin, ExternalLink, Users, Eye, Phone, Mail, UserPlus, FileUser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WorkWithMeDialog } from '@/components/contact/WorkWithMeDialog';
import { downloadVCard } from '@/utils/vcard';

const TalentXcelServices = () => {
  // Set up SEO
  useSEO({
    title: 'TalentXcel SERVICES - Strategic Talent Solutions for the Future of Work',
    description: 'I specialise in helping high-performing professionals and companies tell their talent story in a way that cuts through noise. Expert in talent acquisition, employer branding, and workforce planning.',
    keywords: [
      'TalentXcel Services',
      'talent acquisition',
      'employer branding', 
      'workforce planning',
      'executive search',
      'recruitment services',
      'talent strategy',
      'HR consulting'
    ],
    canonical: 'https://talentxcel.in/talentxcelservices'
  });

  const [workOpen, setWorkOpen] = useState(false);

  const profileData = {
    name: 'TalentXcel SERVICES',
    title: 'Director',
    headline: 'Strategic Talent Solutions for the Future of Work',
    location: 'Noida India',
    email: 'talentxcelservices@gmail.com',
    website: 'https://talentxcel.in/',
    profilePicture: 'https://dthlgsnakhoftinssokm.supabase.co/storage/v1/object/public/avatars/61b6d8bb-bbea-41c5-8ca4-152c4bc5d599/avatar.jpg',
    about: `I specialise in helping high-performing professionals and companies tell their talent story in a way that cuts through noise. I've worked across the resume, recruitment, and job platform ecosystem — from building AI-enabled job portals and resume builders, to advising executives on career strategy. I focus on what works — not trends, but timeless strategy paired with modern tools.`,
    skills: [
      'Talent Acquisition Strategy',
      'Employer Branding',
      'Workforce Planning',
      'Executive Search & Headhunting',
      'Behavioral Interviewing',
      'Diversity, Equity & Inclusion (DEI)',
      'Campus Hiring & Early Careers Programs',
      'HR Analytics & Insights',
      'Candidate Experience Design',
      'Learning & Development (L&D)',
      'Performance Management Systems',
      'Leadership Coaching',
      'Talent Mapping',
      'Succession Planning',
      'Recruitment Marketing'
    ]
  };

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profileData.name,
    jobTitle: profileData.title,
    url: 'https://talentxcel.in/talentxcelservices',
    email: profileData.email,
    image: profileData.profilePicture,
    description: profileData.about,
    worksFor: {
      '@type': 'Organization',
      name: 'TalentXcel'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Noida',
      addressCountry: 'India'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32">
                    <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                    <AvatarFallback className="text-2xl font-semibold">
                      TS
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profileData.name}</h1>
                    <p className="text-xl text-muted-foreground mt-1">{profileData.title}</p>
                    <p className="text-foreground mt-2">{profileData.headline}</p>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profileData.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        // Simple connect action - could be enhanced with actual connection logic
                        window.location.href = `mailto:${profileData.email}?subject=Let's Connect&body=Hi, I'd like to connect with you on TalentXcel.`;
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        window.location.href = `mailto:${profileData.email}?subject=Message from TalentXcel&body=Hi, I have a message for you.`;
                      }}
                    >
                      Message
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="md:min-w-48">
                  <Card>
                    <CardHeader className="pb-3">
                      <h3 className="font-semibold">Profile Stats</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Profile Views</span>
                        </div>
                        <span className="font-semibold">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Connections</span>
                        </div>
                        <span className="font-semibold">0</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">About</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {profileData.about}
                  </p>
                </CardContent>
              </Card>

              {/* Skills Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Skills</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Contact</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${profileData.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {profileData.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Website
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <Card>
                <CardContent className="p-6 text-center space-y-4">
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setWorkOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Work With Me
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => downloadVCard({
                      fullName: profileData.name,
                      title: profileData.title,
                      organization: 'TalentXcel Services',
                      email: profileData.email,
                      website: profileData.website,
                      location: profileData.location,
                      note: profileData.headline
                    }, 'TalentXcel-Services.vcf')}
                  >
                    <FileUser className="h-4 w-4 mr-2" />
                    Download vCard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-6 text-sm text-muted-foreground border-t">
            © 2025 TalentXcel. All rights reserved.
          </div>
        </div>
      </main>

      <WorkWithMeDialog 
        open={workOpen} 
        onOpenChange={setWorkOpen}
        toEmail={profileData.email}
        subject="Work With Me - TalentXcel Services"
        defaultMessage="Hi, I'm interested in working with TalentXcel Services. Please let me know about your availability and services."
      />
    </>
  );
};

export default TalentXcelServices;