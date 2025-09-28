import React from 'react';
import { MobileFirstLayout, MobileFirstSection } from '@/components/layout/MobileFirstLayout';
import { MobileOptimizedContainer } from '@/components/layout/MobileOptimized';
import { MobileFirstGrid, MobileFirstFlex } from '@/components/ui/mobile-first-grid';
import { MobileButton, MobileCard, MobileText, MobileSpacing } from '@/components/shared/MobileFirstComponents';
import { Star, Heart, Share2 } from 'lucide-react';

// Example page showing mobile-first optimization patterns
const MobileOptimizedExample: React.FC = () => {
  return (
    <MobileFirstLayout 
      includeHeader 
      headerContent={
        <MobileFirstFlex direction="row" justify="between" align="center">
          <MobileText variant="heading" as="h1">Mobile-First Demo</MobileText>
          <MobileButton size="sm" touchOptimized>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Share</span>
          </MobileButton>
        </MobileFirstFlex>
      }
    >
      <MobileSpacing size="lg">
        {/* Hero Section */}
        <MobileFirstSection
          title="Mobile-First Design System"
          subtitle="Every component optimized for mobile experience while maintaining desktop functionality"
          centered
        >
          <MobileFirstFlex direction="row" justify="center" gap="md">
            <MobileButton variant="default" touchOptimized>
              <Star className="h-4 w-4 mr-2" />
              Get Started
            </MobileButton>
            <MobileButton variant="outline" touchOptimized>
              <Heart className="h-4 w-4 mr-2" />
              Learn More
            </MobileButton>
          </MobileFirstFlex>
        </MobileFirstSection>

        {/* Features Grid */}
        <MobileFirstSection title="Key Features">
          <MobileFirstGrid mobileColumns={1} tabletColumns={2} desktopColumns={3}>
            {[
              { title: "Touch-Friendly", description: "44px minimum touch targets for all interactive elements" },
              { title: "Responsive Text", description: "Typography scales perfectly from mobile to desktop" },
              { title: "Optimized Images", description: "Lazy loading and responsive images by default" },
              { title: "Mobile Navigation", description: "Bottom tabs and drawer menus for mobile users" },
              { title: "Performance First", description: "Virtual scrolling and optimized rendering" },
              { title: "Cross-Platform", description: "Works seamlessly on all devices and browsers" }
            ].map((feature, index) => (
              <MobileCard key={index} mobileOptimized>
                <MobileSpacing size="sm">
                  <MobileText variant="subheading" as="h3">{feature.title}</MobileText>
                  <MobileText variant="body">{feature.description}</MobileText>
                </MobileSpacing>
              </MobileCard>
            ))}
          </MobileFirstGrid>
        </MobileFirstSection>

        {/* Statistics */}
        <MobileFirstSection title="Impact" centered>
          <MobileFirstGrid mobileColumns={1} tabletColumns={3} desktopColumns={3}>
            {[
              { value: "300%", label: "Faster Mobile Load" },
              { value: "95%", label: "Better Touch UX" },
              { value: "100%", label: "Desktop Compatibility" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <MobileText variant="hero" className="text-primary">{stat.value}</MobileText>
                <MobileText variant="body" className="text-muted-foreground">{stat.label}</MobileText>
              </div>
            ))}
          </MobileFirstGrid>
        </MobileFirstSection>

        {/* Call to Action */}
        <MobileFirstSection centered>
          <MobileCard className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <MobileSpacing size="md">
              <MobileText variant="heading" as="h2" className="text-center">
                Ready to Experience Mobile-First?
              </MobileText>
              <MobileText variant="body" className="text-center text-muted-foreground">
                All pages are now optimized for mobile without changing desktop functionality.
              </MobileText>
              <div className="flex justify-center">
                <MobileButton size="lg" className="bg-primary hover:bg-primary/90">
                  <span className="hidden sm:inline">Explore All Pages</span>
                  <span className="sm:hidden">Explore</span>
                </MobileButton>
              </div>
            </MobileSpacing>
          </MobileCard>
        </MobileFirstSection>
      </MobileSpacing>
    </MobileFirstLayout>
  );
};

export default MobileOptimizedExample;