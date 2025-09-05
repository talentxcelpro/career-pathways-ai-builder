import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Gift, Zap, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ExitIntentPopupProps {
  page?: 'resume' | 'jobs' | 'interview' | 'insights';
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ page = 'resume' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Don't show for logged-in users
    if (user || hasShown) return;

    let timeout: NodeJS.Timeout;
    
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from top of viewport
      if (e.clientY <= 0 && !hasShown) {
        timeout = setTimeout(() => {
          setIsOpen(true);
          setHasShown(true);
        }, 100);
      }
    };

    const handleMouseEnter = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };

    // Also show after 30 seconds if user hasn't left
    const showTimeout = setTimeout(() => {
      if (!hasShown && !user) {
        setIsOpen(true);
        setHasShown(true);
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (timeout) clearTimeout(timeout);
      clearTimeout(showTimeout);
    };
  }, [user, hasShown]);

  const getOfferContent = () => {
    const offers = {
      resume: {
        title: 'Wait! Get Your Free Resume Review',
        subtitle: 'Before you go, let us help you improve your resume',
        benefits: [
          'Free ATS compatibility check',
          'Professional formatting tips',
          'Keyword optimization suggestions'
        ],
        cta: 'Get Free Review'
      },
      jobs: {
        title: 'Don\'t Miss Out on Perfect Jobs!',
        subtitle: 'Get job alerts delivered to your inbox',
        benefits: [
          'Personalized job recommendations',
          'First to know about new openings',
          'No spam, only relevant opportunities'
        ],
        cta: 'Get Job Alerts'
      },
      interview: {
        title: 'Free Interview Preparation Guide',
        subtitle: 'Master your next interview with our comprehensive guide',
        benefits: [
          '50+ common interview questions',
          'Industry-specific tips',
          'Mock interview checklist'
        ],
        cta: 'Download Guide'
      },
      insights: {
        title: 'Your Personalized Career Report',
        subtitle: 'Get insights about your career path and salary potential',
        benefits: [
          'Market salary benchmarks',
          'Skills gap analysis',
          'Career growth recommendations'
        ],
        cta: 'Get Report'
      }
    };

    return offers[page];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Here you would typically call an API to save the email
      // For now, we'll just simulate the action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Great! Check your email for your free resource.');
      setIsOpen(false);
      
      // Redirect to signup with email pre-filled
      window.location.href = `/auth?mode=signup&email=${encodeURIComponent(email)}&flow=${page}`;
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const offer = getOfferContent();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-2 border-primary/20">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">{offer.title}</DialogTitle>
          <p className="text-muted-foreground">{offer.subtitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-2">
            {offer.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-center"
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  {offer.cta}
                </>
              )}
            </Button>
          </form>

          {/* Trust signals */}
          <div className="text-center text-xs text-muted-foreground">
            <p>✨ Trusted by 10,000+ professionals</p>
            <p>🔒 We respect your privacy. No spam ever.</p>
          </div>

          {/* No thanks option */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, I'll continue browsing
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};