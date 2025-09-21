import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Add keyboard navigation support
    const handleKeydown = (e: KeyboardEvent) => {
      // Skip to main content with Alt+M
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const main = document.querySelector('main');
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Skip to navigation with Alt+N
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const nav = document.querySelector('nav');
        if (nav) {
          nav.focus();
          nav.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    // Set up focus management
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    const handleFocusVisible = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.matches(focusableElements)) {
        target.classList.add('focus-visible');
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.classList.remove('focus-visible');
      }
    };

    document.addEventListener('focusin', handleFocusVisible);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocusVisible);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  return (
    <div
      role="application"
      aria-label="TalentXcel Professional Network"
      className="min-h-screen"
    >
      {/* Skip links for screen readers */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium ml-2"
        >
          Skip to navigation
        </a>
      </div>

      {/* Accessibility announcements */}
      <div
        id="accessibility-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {children}
    </div>
  );
};

// Screen reader optimized component wrapper
export const ScreenReaderOptimized: React.FC<{
  children: React.ReactNode;
  announcement?: string;
}> = ({ children, announcement }) => {
  useEffect(() => {
    if (announcement) {
      const announcer = document.getElementById('accessibility-announcements');
      if (announcer) {
        announcer.textContent = announcement;
        setTimeout(() => {
          announcer.textContent = '';
        }, 1000);
      }
    }
  }, [announcement]);

  return <>{children}</>;
};

// High contrast mode detector and handler
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const highContrast = window.matchMedia('(-ms-high-contrast: active)').matches ||
        window.matchMedia('(prefers-contrast: high)').matches;
      
      setIsHighContrast(highContrast);
      
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    checkHighContrast();

    // Listen for changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addEventListener('change', checkHighContrast);

    return () => {
      contrastQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);

  return isHighContrast;
};

// Keyboard navigation helper
export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }

      // Arrow key navigation for lists
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.getAttribute('role') === 'listitem') {
          e.preventDefault();
          const listItems = Array.from(
            activeElement.parentElement?.querySelectorAll('[role="listitem"]') || []
          ) as HTMLElement[];
          
          const currentIndex = listItems.indexOf(activeElement);
          const nextIndex = e.key === 'ArrowDown' 
            ? Math.min(currentIndex + 1, listItems.length - 1)
            : Math.max(currentIndex - 1, 0);
          
          listItems[nextIndex]?.focus();
        }
      }
    };

    const handleMousedown = () => {
      document.body.classList.remove('using-keyboard');
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleMousedown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, []);
};

// Accessible card component
export const AccessibleCard: React.FC<{
  children: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}> = ({ children, title, description, onClick, className = '' }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleKeydown = (e: KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      ref={cardRef}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      aria-label={title}
      aria-describedby={description ? `${title}-description` : undefined}
      className={`
        ${className}
        ${onClick ? 'cursor-pointer' : ''}
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      `}
      onClick={onClick}
      onKeyDown={handleKeydown}
    >
      <h3 className="sr-only">{title}</h3>
      {description && (
        <p id={`${title}-description`} className="sr-only">
          {description}
        </p>
      )}
      {children}
    </div>
  );
};