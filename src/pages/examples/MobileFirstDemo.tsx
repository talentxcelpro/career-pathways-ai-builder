import React from 'react';
import { useMobileFirstStyles, withMobileFirst } from '@/utils/mobileFirstWrapper';

// Example of how to enhance existing pages with mobile-first optimizations
const MobileFirstPageExample = () => {
  const styles = useMobileFirstStyles();

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold">TalentXcel</h1>
            <button className={styles.button + " bg-primary text-primary-foreground"}>
              Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.container}>
        <div className={styles.sectionSpacing}>
          {/* Hero Section */}
          <section className={styles.componentSpacing}>
            <div className="text-center">
              <h1 className={styles.heroText}>Mobile-First Platform</h1>
              <p className={styles.bodyText + " text-muted-foreground mt-2 sm:mt-4"}>
                Every page optimized for mobile while preserving desktop functionality
              </p>
            </div>
            
            <div className={styles.flexRow + " justify-center"}>
              <button className={styles.button + " bg-primary text-primary-foreground hover:bg-primary/90"}>
                Get Started
              </button>
              <button className={styles.button + " border border-input bg-background hover:bg-accent"}>
                Learn More
              </button>
            </div>
          </section>

          {/* Features Grid */}
          <section className={styles.componentSpacing}>
            <h2 className={styles.headingText + " text-center mb-4 sm:mb-8"}>
              Mobile-First Features
            </h2>
            
            <div className={styles.grid}>
              {[
                { title: "Touch-Friendly UI", desc: "44px minimum touch targets" },
                { title: "Responsive Design", desc: "Perfect on all screen sizes" },
                { title: "Fast Performance", desc: "Optimized for mobile networks" },
                { title: "Zero Desktop Impact", desc: "Full functionality preserved" },
                { title: "Modern UX", desc: "Native-like mobile experience" },
                { title: "Cross-Platform", desc: "Works on all devices" }
              ].map((feature, index) => (
                <div key={index} className={styles.card + " bg-card"}>
                  <h3 className={styles.subheadingText}>{feature.title}</h3>
                  <p className={styles.bodyText + " text-muted-foreground mt-2"}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className={styles.componentSpacing}>
            <div className={styles.card + " bg-gradient-to-r from-primary/10 to-secondary/10 text-center"}>
              <h2 className={styles.headingText}>Ready to Experience It?</h2>
              <p className={styles.bodyText + " text-muted-foreground mt-2 mb-4 sm:mb-6"}>
                All 60+ pages are now mobile-optimized with zero impact on desktop users
              </p>
              <button className={styles.button + " bg-primary text-primary-foreground hover:bg-primary/90"}>
                Explore All Pages
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default withMobileFirst(MobileFirstPageExample);