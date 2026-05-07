import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Eye, Sparkles } from "lucide-react";
import { PageShell, Section } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";

const About = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Smart Resume Builder & Cover Letters",
      description: "AI-powered tools to create compelling resumes and cover letters",
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "AI Career Mapping & Job Matching",
      description: "Intelligent career planning and personalized job recommendations",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Learning Hub with Certifications",
      description: "Comprehensive courses and industry-recognized certifications",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Professional Networking & Messaging",
      description: "Connect with professionals and build meaningful relationships",
    },
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "Employer & Freelancer Marketplace",
      description: "Opportunities for both full-time roles and freelance projects",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageShell width="md" pad="lg">
        <PageHeader
          eyebrow="About TalentXcel"
          title="Empowering talent. Elevating careers."
          description="Transforming the way professionals connect, learn, and grow with AI-powered career solutions."
          size="lg"
          align="center"
        />

        <Section spacing="lg">
          <Card>
            <CardContent className="p-6 md:p-8 space-y-3">
              <h2 className="text-title-1 text-foreground">Who we are</h2>
              <p className="text-body-lg text-muted-foreground">
                TalentXcel is an all-in-one AI-powered platform built to transform the way
                professionals connect, learn, and grow. From job discovery and resume building to
                networking, mentorship, and career planning — we're here for your entire journey.
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section>
          <Card>
            <CardContent className="p-6 md:p-8 space-y-3">
              <h2 className="text-title-1 text-foreground">Our mission</h2>
              <p className="text-body-lg text-muted-foreground">
                To create a future-ready ecosystem that accelerates personal and professional growth
                for millions by blending intelligent tools, community, and opportunity.
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section>
          <h2 className="text-title-1 text-foreground text-center mb-8">What we offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-elegant transition-shadow">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="flex justify-center">{feature.icon}</div>
                  <h3 className="text-title-3 text-foreground">{feature.title}</h3>
                  <p className="text-body text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section>
          <Card>
            <CardContent className="p-6 md:p-8 space-y-3">
              <h2 className="text-title-1 text-foreground">Our vision</h2>
              <p className="text-body-lg text-muted-foreground">
                To become the world's most intelligent, trusted, and lovable career platform.
              </p>
            </CardContent>
          </Card>
        </Section>
      </PageShell>
    </div>
  );
};

export default About;
