// src/components/conversion/NetworkTopicDiscussionWidget.tsx
// Above-the-fold PLG Conversion Widget for Network Topics, Communities & Reels
// Features verified insights seeded by Director Operations Sanobar Khan + 1-Click Google OAuth to reply/endorse

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Share2, Award, Sparkles, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NetworkTopicDiscussionWidgetProps {
  topicTitle?: string;
  industry?: string;
  initialPostSnippet?: string;
  className?: string;
}

export const NetworkTopicDiscussionWidget: React.FC<NetworkTopicDiscussionWidgetProps> = ({
  topicTitle = 'Tech Hiring Trends & Salary Negotiation 2026',
  industry = 'Engineering & Technology',
  initialPostSnippet,
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState<number>(47);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);

  const defaultInsight = initialPostSnippet || 
    `In 2026, recruiters across India, MENA, and North America are prioritizing verified hands-on execution over passive certifications. When preparing for technical rounds or negotiating compensation, anchor your contributions to measurable business outcomes (e.g. latency reduction, revenue acceleration, or automated pipeline uptime). A verified TalentXcel Career Passport accelerates recruiter callbacks by 3x.`;

  const handleUpvote = () => {
    if (!hasUpvoted) {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
      toast.success('Endorsed discussion insight!');
    }
  };

  const handleReplyOrJoin = () => {
    if (user) {
      navigate('/network');
    } else {
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}&intent=network_reply`);
    }
  };

  return (
    <Card className={`border-2 border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-md rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 px-4 py-2 text-white flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-sky-300" />
          <span>TalentXcel Professional Network &bull; Verified Discussion</span>
        </span>
        <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-[10px]">
          {industry}
        </Badge>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight">
            {topicTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active peer discussion &amp; expert advisory thread.
          </p>
        </div>

        {/* Featured Seed Insight Post Card by Sanobar Khan */}
        <div className="bg-white dark:bg-card p-4 rounded-xl border border-slate-200/80 dark:border-border/60 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-blue-200">
                <AvatarImage src="/assets/avatars/sanobar-khan.png" alt="Sanobar Khan" />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">SK</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">Sanobar Khan</span>
                  <Badge variant="secondary" className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0 h-4">
                    Director Operations
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Transforming Businesses and Lives &bull; TalentXcel Verified</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Today</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {defaultInsight}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-border/40 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpvote}
              className={`h-7 px-2.5 text-xs gap-1.5 rounded-lg ${hasUpvoted ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/60' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{upvotes} Endorsements</span>
            </Button>
            <span className="text-[11px] text-muted-foreground">18 replies from Senior Engineers &amp; Recruiters</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1 space-y-2">
          <Button
            onClick={handleReplyOrJoin}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-2"
          >
            {user ? (
              <>
                <span>Reply to Discussion &amp; Share Perspective</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Join Discussion &amp; Connect with Peers (1-Click Google)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Professionals who contribute to network discussions receive 3x more direct recruiter views.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkTopicDiscussionWidget;
