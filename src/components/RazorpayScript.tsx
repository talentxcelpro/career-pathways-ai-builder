import { useEffect } from 'react';

export const RazorpayScript = () => {
  useEffect(() => {
    // Only load if not already loaded and on client side
    if (typeof window !== 'undefined' && !(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
      };
      document.head.appendChild(script);

      // Cleanup function to remove script if component unmounts
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  return null; // This component doesn't render anything
};