import React, { useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX,
  Type,
  Contrast,
  MousePointer,
  Keyboard,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Accessibility preferences hook
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = React.useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    soundEnabled: true,
    keyboardNavigation: false,
    screenReader: false
  });

  useEffect(() => {
    // Detect system preferences
    const mediaQueries = {
      reducedMotion: '(prefers-reduced-motion: reduce)',
      highContrast: '(prefers-contrast: high)',
      largeText: '(prefers-color-scheme: dark)'
    };

    Object.entries(mediaQueries).forEach(([key, query]) => {
      const mq = window.matchMedia(query);
      setPreferences(prev => ({ ...prev, [key]: mq.matches }));
      
      const handler = (e: MediaQueryListEvent) => {
        setPreferences(prev => ({ ...prev, [key]: e.matches }));
      };
      
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    });

    // Apply preferences to document
    document.documentElement.setAttribute('data-reduced-motion', preferences.reducedMotion.toString());
    document.documentElement.setAttribute('data-high-contrast', preferences.highContrast.toString());
    document.documentElement.setAttribute('data-large-text', preferences.largeText.toString());
  }, [preferences]);

  return { preferences, setPreferences };
};

// ARIA live region for announcements
export const AriaLiveRegion: React.FC = memo(() => {
  const [announcement, setAnnouncement] = React.useState('');

  useEffect(() => {
    // Listen for custom accessibility events
    const handleAnnouncement = (event: CustomEvent) => {
      setAnnouncement(event.detail.message);
      setTimeout(() => setAnnouncement(''), 1000);
    };

    window.addEventListener('accessibility-announce', handleAnnouncement as EventListener);
    return () => window.removeEventListener('accessibility-announce', handleAnnouncement as EventListener);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {announcement}
    </div>
  );
});

// Accessibility-enhanced button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  description?: string;
  shortcut?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = memo(({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  description,
  shortcut,
  className,
  ...props
}) => {
  const announceAction = (action: string) => {
    window.dispatchEvent(new CustomEvent('accessibility-announce', {
      detail: { message: action }
    }));
  };

  return (
    <Button
      {...props}
      className={cn(
        "focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none",
        "hover:scale-105 active:scale-95 transition-transform",
        className
      )}
      aria-describedby={description ? `${props.id}-desc` : undefined}
      aria-keyshortcuts={shortcut}
      onClick={(e) => {
        announceAction(`${children} activated`);
        props.onClick?.(e);
      }}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
      
      {description && (
        <span id={`${props.id}-desc`} className="sr-only">
          {description}
        </span>
      )}
      
      {shortcut && (
        <kbd className="ml-2 text-xs bg-muted px-1 rounded">
          {shortcut}
        </kbd>
      )}
    </Button>
  );
});

// Skip navigation link
export const SkipNavigation: React.FC = memo(() => (
  <a
    href="#main-content"
    className={cn(
      "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
      "bg-primary text-primary-foreground px-4 py-2 rounded-md",
      "focus:z-50 focus:outline-none focus:ring-2 focus:ring-primary-foreground"
    )}
  >
    Skip to main content
  </a>
));

// Focus trap for modals and dropdowns
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  active: boolean;
}> = memo(({ children, active }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
});

// Accessibility settings panel
export const AccessibilityPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = memo(({ isOpen, onClose }) => {
  const { preferences, setPreferences } = useAccessibilityPreferences();

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`${key} ${preferences[key] ? 'disabled' : 'enabled'}`);
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 shadow-lg border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="w-5 h-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <FocusTrap active={isOpen}>
          <div className="space-y-3">
            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                <span className="text-sm font-medium">Reduce Motion</span>
              </div>
              <Button
                size="sm"
                variant={preferences.reducedMotion ? "default" : "outline"}
                onClick={() => togglePreference('reducedMotion')}
                aria-pressed={preferences.reducedMotion}
              >
                {preferences.reducedMotion ? "On" : "Off"}
              </Button>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contrast className="w-4 h-4" />
                <span className="text-sm font-medium">High Contrast</span>
              </div>
              <Button
                size="sm"
                variant={preferences.highContrast ? "default" : "outline"}
                onClick={() => togglePreference('highContrast')}
                aria-pressed={preferences.highContrast}
              >
                {preferences.highContrast ? "On" : "Off"}
              </Button>
            </div>

            {/* Large Text */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="text-sm font-medium">Large Text</span>
              </div>
              <Button
                size="sm"
                variant={preferences.largeText ? "default" : "outline"}
                onClick={() => togglePreference('largeText')}
                aria-pressed={preferences.largeText}
              >
                {preferences.largeText ? "On" : "Off"}
              </Button>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-sm font-medium">Sound Effects</span>
              </div>
              <Button
                size="sm"
                variant={preferences.soundEnabled ? "default" : "outline"}
                onClick={() => togglePreference('soundEnabled')}
                aria-pressed={preferences.soundEnabled}
              >
                {preferences.soundEnabled ? "On" : "Off"}
              </Button>
            </div>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                <span className="text-sm font-medium">Keyboard Navigation</span>
              </div>
              <Button
                size="sm"
                variant={preferences.keyboardNavigation ? "default" : "outline"}
                onClick={() => togglePreference('keyboardNavigation')}
                aria-pressed={preferences.keyboardNavigation}
              >
                {preferences.keyboardNavigation ? "On" : "Off"}
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="pt-4 border-t space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                Object.keys(preferences).forEach(key => {
                  setPreferences(prev => ({ ...prev, [key]: false }));
                });
                toast.success('All accessibility features disabled');
              }}
            >
              Reset to Defaults
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Close Settings
            </Button>
          </div>
        </FocusTrap>
      </CardContent>
    </Card>
  );
});

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  window.dispatchEvent(new CustomEvent('accessibility-announce', {
    detail: { message, priority }
  }));
};

// Accessibility checker component (development only)
export const AccessibilityChecker: React.FC = memo(() => {
  const [issues, setIssues] = React.useState<Array<{ type: string; message: string; severity: 'error' | 'warning' }>>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const checkAccessibility = () => {
      const foundIssues: typeof issues = [];

      // Check for missing alt text
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        foundIssues.push({
          type: 'missing-alt',
          message: `${images.length} images missing alt text`,
          severity: 'error'
        });
      }

      // Check for low contrast (simplified check)
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      if (buttons.length > 0) {
        foundIssues.push({
          type: 'missing-label',
          message: `${buttons.length} buttons may need better labels`,
          severity: 'warning'
        });
      }

      // Check for keyboard navigation
      const focusableElements = document.querySelectorAll('[tabindex="-1"]');
      if (focusableElements.length > 5) {
        foundIssues.push({
          type: 'keyboard-navigation',
          message: 'Many elements removed from tab order',
          severity: 'warning'
        });
      }

      setIssues(foundIssues);
    };

    // Run check after a delay to allow DOM to settle
    const timer = setTimeout(checkAccessibility, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (process.env.NODE_ENV !== 'development' || issues.length === 0) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle className="w-4 h-4" />
          Accessibility Issues ({issues.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {issues.map((issue, index) => (
          <div key={index} className="flex items-start gap-2">
            <Badge 
              variant={issue.severity === 'error' ? 'destructive' : 'secondary'}
              className="text-xs mt-0.5"
            >
              {issue.severity}
            </Badge>
            <span className="text-xs text-amber-700">{issue.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

AriaLiveRegion.displayName = 'AriaLiveRegion';
AccessibleButton.displayName = 'AccessibleButton';
SkipNavigation.displayName = 'SkipNavigation';
FocusTrap.displayName = 'FocusTrap';
AccessibilityPanel.displayName = 'AccessibilityPanel';
AccessibilityChecker.displayName = 'AccessibilityChecker';