/**
 * GPU-Accelerated Animations
 * 60fps smooth animations for mobile
 */

import { useEffect, useRef, useState } from 'react';

interface AnimationConfig {
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  delay?: number;
}

// CSS transforms that trigger GPU acceleration
const GPU_PROPS = ['transform', 'opacity', 'filter'];

export function useGPUAnimation(
  targetRef: React.RefObject<HTMLElement>,
  config: AnimationConfig = {}
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const { duration = 300, easing = 'ease-out', delay = 0 } = config;

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    // Force GPU acceleration
    element.style.willChange = 'transform, opacity';
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';

    return () => {
      if (element) {
        element.style.willChange = 'auto';
      }
    };
  }, [targetRef]);

  const animate = (properties: Record<string, string | number>) => {
    const element = targetRef.current;
    if (!element) return Promise.resolve();

    setIsAnimating(true);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        element.style.transition = `all ${duration}ms ${getEasingFunction(easing)}`;
        
        Object.entries(properties).forEach(([prop, value]) => {
          if (GPU_PROPS.some(gpuProp => prop.includes(gpuProp))) {
            (element.style as any)[prop] = value;
          }
        });

        const handleTransitionEnd = () => {
          element.removeEventListener('transitionend', handleTransitionEnd);
          setIsAnimating(false);
          resolve();
        };

        element.addEventListener('transitionend', handleTransitionEnd);
      }, delay);
    });
  };

  const fadeIn = () => animate({ opacity: '1' });
  const fadeOut = () => animate({ opacity: '0' });
  
  const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'right') => {
    const transforms = {
      left: 'translateX(0)',
      right: 'translateX(0)',
      up: 'translateY(0)',
      down: 'translateY(0)',
    };
    return animate({ transform: transforms[direction], opacity: '1' });
  };

  const slideOut = (direction: 'left' | 'right' | 'up' | 'down' = 'left') => {
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)',
    };
    return animate({ transform: transforms[direction], opacity: '0' });
  };

  const scale = (value: number) => animate({ transform: `scale(${value})` });
  
  const spring = (from: number, to: number, property: string = 'transform') => {
    const element = targetRef.current;
    if (!element) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const startTime = performance.now();
      const duration = 600; // Spring duration
      const tension = 170;
      const friction = 26;

      const springAnimation = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Spring physics calculation
        const springValue = calculateSpring(progress, from, to, tension, friction);
        
        if (property === 'transform') {
          element.style.transform = `scale(${springValue})`;
        } else {
          (element.style as any)[property] = springValue;
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(springAnimation);
        } else {
          setIsAnimating(false);
          resolve();
        }
      };

      setIsAnimating(true);
      animationFrameRef.current = requestAnimationFrame(springAnimation);
    });
  };

  const pulse = async () => {
    await spring(1, 1.1);
    await spring(1.1, 1);
  };

  return {
    isAnimating,
    animate,
    fadeIn,
    fadeOut,
    slideIn,
    slideOut,
    scale,
    spring,
    pulse,
  };
}

function getEasingFunction(easing: string): string {
  const easings: Record<string, string> = {
    linear: 'linear',
    'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
    'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
  return easings[easing] || easings['ease-out'];
}

function calculateSpring(
  progress: number,
  from: number,
  to: number,
  tension: number,
  friction: number
): number {
  const distance = to - from;
  const damping = friction / (2 * Math.sqrt(tension));
  const angularFreq = Math.sqrt(tension);
  
  if (damping < 1) {
    // Underdamped spring
    const dampedFreq = angularFreq * Math.sqrt(1 - damping * damping);
    const envelope = Math.exp(-damping * angularFreq * progress);
    const value = from + distance * (1 - envelope * (
      Math.cos(dampedFreq * progress) +
      (damping * angularFreq / dampedFreq) * Math.sin(dampedFreq * progress)
    ));
    return value;
  } else {
    // Critically or overdamped
    return from + distance * (1 - Math.exp(-angularFreq * progress));
  }
}

// Pre-configured mobile animations
export const mobileAnimations = {
  // Card entrance
  cardEnter: {
    from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
    duration: 400,
    easing: 'spring' as const,
  },

  // Card exit
  cardExit: {
    from: { opacity: 1, transform: 'translateY(0) scale(1)' },
    to: { opacity: 0, transform: 'translateY(-20px) scale(0.95)' },
    duration: 300,
    easing: 'ease-in' as const,
  },

  // Bottom sheet
  bottomSheet: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
    duration: 350,
    easing: 'spring' as const,
  },

  // Modal backdrop
  backdrop: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 200,
    easing: 'linear' as const,
  },

  // Button press
  buttonPress: {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(0.95)' },
    duration: 100,
    easing: 'ease-out' as const,
  },

  // Skeleton loading
  skeletonPulse: {
    from: { opacity: 0.6 },
    to: { opacity: 1 },
    duration: 1000,
    easing: 'ease-in-out' as const,
  },
};
