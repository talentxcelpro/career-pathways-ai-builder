import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { withMobileFirst } from '@/utils/mobileFirstWrapper';
import { useMobileFirstStyles } from '@/utils/mobileFirstWrapper';

// Enhanced mobile-first Profile page
const ProfilePageMobileFirst = () => {
  const { user } = useAuth();
  const styles = useMobileFirstStyles();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.sectionSpacing}>
          {/* Profile Header */}
          <div className={styles.componentSpacing}>
            <div className="text-center">
              <h1 className={styles.heroText}>Your Profile</h1>
              <p className={styles.bodyText + " text-muted-foreground"}>
                Manage your professional information
              </p>
            </div>
          </div>

          {/* Profile Actions */}
          <div className={styles.flexRow + " justify-center"}>
            <button className={styles.button + " bg-primary text-primary-foreground hover:bg-primary/90"}>
              Edit Profile
            </button>
            <button className={styles.button + " border border-input bg-background hover:bg-accent"}>
              Share Profile
            </button>
          </div>

          {/* Profile Content Grid */}
          <div className={styles.grid}>
            <div className={styles.card + " bg-card"}>
              <h3 className={styles.subheadingText}>Personal Information</h3>
              <div className={styles.itemSpacing}>
                <p className={styles.bodyText}>Update your basic details</p>
              </div>
            </div>
            
            <div className={styles.card + " bg-card"}>
              <h3 className={styles.subheadingText}>Professional Details</h3>
              <div className={styles.itemSpacing}>
                <p className={styles.bodyText}>Manage your career information</p>
              </div>
            </div>
            
            <div className={styles.card + " bg-card"}>
              <h3 className={styles.subheadingText}>Portfolio</h3>
              <div className={styles.itemSpacing}>
                <p className={styles.bodyText}>Showcase your work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export with mobile-first HOC
export const EnhancedProfilePage = withMobileFirst(ProfilePageMobileFirst);