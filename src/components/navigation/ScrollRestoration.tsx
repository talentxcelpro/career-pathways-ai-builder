import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures page scroll is reset to top on navigation,
 * while respecting hash links and preserving BFCache state.
 */
export const ScrollRestoration: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If navigating to an anchor like #features, scroll smoothly to the element
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Scroll to top instantly without flash
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, hash]);

  return null;
};
