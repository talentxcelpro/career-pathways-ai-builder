import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  User, 
  Building, 
  GraduationCap, 
  Landmark,
  Star,
  Clock,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Shield,
  Globe,
  Briefcase,
  CheckCircle
} from 'lucide-react';

interface AudienceSectionProps {
  audience: 'individuals' | 'businesses' | 'universities' | 'governments';
}

const audienceData = {
  individuals: {
    title: 'For Individuals',
    subtitle: 'Build job-relevant skills with courses, certificates, and hands-on projects',
    icon: User,
    color: 'blue',
    features: [
      {
        icon: Star,
        title: 'World-class content',
        description: 'Learn from 275+ leading universities and companies'
      },
      {
        icon: Award,
        title: 'Industry credentials',
        description: 'Earn certificates and degrees that employers recognize'
      },
      {
        icon: Clock,
        title: 'Flexible learning',
        description: 'Learn at your own pace, anywhere, anytime'
      },
      {
        icon: TrendingUp,
        title: 'Career advancement',
        description: 'Advance your career with new skills and qualifications'
      }
    ],
    stats: [
      { value: '100M+', label: 'Registered learners' },
      { value: '7,000+', label: 'Courses' },
      { value: '90%', label: 'Career advancement rate' }
    ],
    cta: {
      primary: 'Start Learning for Free',
      secondary: 'Explore Courses'
    }
  },
  businesses: {
    title: 'For Businesses',
    subtitle: 'Advance your workforce with world-class online training',
    icon: Building,
    color: 'green',
    features: [
      {
        icon: Users,
        title: 'Scalable training',
        description: 'Train teams of any size with enterprise-grade content'
      },
      {
        icon: BookOpen,
        title: 'Curated content',
        description: 'Access job-relevant courses from leading institutions'
      },
      {
        icon: Shield,
        title: 'Security & compliance',
        description: 'Enterprise-grade security and compliance features'
      },
      {
        icon: TrendingUp,
        title: 'Analytics & insights',
        description: 'Track progress and measure learning impact'
      }
    ],
    stats: [
      { value: '5,000+', label: 'Companies trust us' },
      { value: '70%', label: 'Skill improvement' },
      { value: '80%', label: 'Employee satisfaction' }
    ],
    cta: {
      primary: 'Contact Sales',
      secondary: 'Explore Solutions'
    }
  },
  universities: {
    title: 'For Universities',
    subtitle: 'Enhance your curriculum with industry-relevant online content',
    icon: GraduationCap,
    color: 'purple',
    features: [
      {
        icon: Globe,
        title: 'Global reach',
        description: 'Expand your reach with online and blended programs'
      },
      {
        icon: Award,
        title: 'Accredited programs',
        description: 'Offer degrees and certificates that meet industry standards'
      },
      {
        icon: Users,
        title: 'Student engagement',
        description: 'Enhance student engagement with interactive content'
      },
      {
        icon: TrendingUp,
        title: 'Learning analytics',
        description: 'Track student progress and improve outcomes'
      }
    ],
    stats: [
      { value: '275+', label: 'University partners' },
      { value: '4.7', label: 'Average rating' },
      { value: '85%', label: 'Course completion rate' }
    ],
    cta: {
      primary: 'Become a Partner',
      secondary: 'Learn More'
    }
  },
  governments: {
    title: 'For Governments',
    subtitle: 'Transform your workforce with digital skills training at scale',
    icon: Landmark,
    color: 'orange',
    features: [
      {
        icon: Users,
        title: 'Workforce development',
        description: 'Upskill citizens for the digital economy'
      },
      {
        icon: Globe,
        title: 'National programs',
        description: 'Deploy training programs at national scale'
      },
      {
        icon: TrendingUp,
        title: 'Economic impact',
        description: 'Drive economic growth through skills development'
      },
      {
        icon: Shield,
        title: 'Public sector ready',
        description: 'Secure, compliant solutions for government use'
      }
    ],
    stats: [
      { value: '50+', label: 'Government partners' },
      { value: '2M+', label: 'Citizens trained' },
      { value: '60%', label: 'Skills improvement' }
    ],
    cta: {
      primary: 'Contact Us',
      secondary: 'View Case Studies'
    }
  }
};

export const AudienceSpecificSections: React.FC<AudienceSectionProps> = ({ audience }) => {
  const data = audienceData[audience];
  const IconComponent = data.icon;
  
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
        badge: 'bg-blue-100 text-blue-800'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700',
        badge: 'bg-green-100 text-green-800'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        badge: 'bg-purple-100 text-purple-800'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700',
        badge: 'bg-orange-100 text-orange-800'
      }
    };
    return colorMap[color as keyof typeof colorMap];
  };

  const colors = getColorClasses(data.color);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className={`${colors.bg} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-2xl ${colors.bg} shadow-lg`}>
                <IconComponent className={`h-12 w-12 ${colors.text}`} />
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {data.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {data.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className={`${colors.button} text-white px-8 py-4`}>
                {data.cta.primary}
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4">
                {data.cta.secondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why choose TalentXcel {data.title.toLowerCase()}?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl ${colors.bg} flex items-center justify-center`}>
                    <FeatureIcon className={`h-8 w-8 ${colors.text}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {data.stats.map((stat, index) => (
              <div key={index}>
                <div className={`text-4xl font-bold ${colors.text} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground">
            See how organizations are transforming with TalentXcel
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Building className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Company {i}</h4>
                    <p className="text-sm text-muted-foreground">Technology</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  "TalentXcel helped us upskill our entire workforce in just 6 months. 
                  The results were incredible - productivity increased by 40%."
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className={colors.badge}>
                    40% increase
                  </Badge>
                  <Badge variant="outline">
                    6 months
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${colors.bg} py-16`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of organizations already transforming with TalentXcel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className={`${colors.button} text-white px-8 py-4`}>
              {data.cta.primary}
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};