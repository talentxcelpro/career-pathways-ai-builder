import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ThumbsUp, UserPlus } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { EnhancedCommentsSection } from '@/components/posts/EnhancedCommentsSection';
import { EnhancedPostMenu } from '@/components/posts/EnhancedPostMenu';
import { QuickShareActions } from '@/components/shared/QuickShareActions';
import { useShareContent } from '@/hooks/useShareContent';
import { EngagementActions } from '@/components/engagement/EngagementActions';
import ProBadge from '@/components/network/ProBadge';
import MediaPreview from '@/components/posts/MediaPreview';
import { VideoNetworkPostCard } from './VideoNetworkPostCard';
import { linkifyText } from '@/utils/textUtils';
import { supabase } from '@/integrations/supabase/client';
import { ReshareButton } from './ReshareButton';
import { useViewportProfileTracking } from '@/hooks/useViewportProfileTracking';
import { ContentEmbed } from '@/components/embeds/ContentEmbed';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';
import { VoiceButton } from '@/voice/components/VoiceButton';

type connectionStatus = 'none' | 'pending' | 'accepted' | 'declined';

interface NetworkPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  link_previews?: Array<{ url: string }>;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  profiles?: {
    id: string;
    full_name?: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
    pro_plan?: string;
    pro_status?: string;
    pro_expires_at?: string;
  };
}

interface NetworkPostCardProps {
  post: NetworkPost;
  openComments?: string | null;
  onCommentClick?: (postId: string) => void;
}

export const NetworkPostCard: React.FC<NetworkPostCardProps> = ({
  post,
  openComments,
  onCommentClick,
}) => {
  const { trackElementRef } = useViewportProfileTracking(
    post.profiles?.id || '',
    'network_card',
    {
      threshold: 0.6,
      minViewTime: 3000,
    }
  );
  const { createPostShareData } = useShareContent();
  const { sendConnectionRequest } = useConnectionRequests();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [connectionStatus, setconnectionStatus] = React.useState<connectionStatus>('none');
  const [isCheckingConnection, setIsCheckingConnection] = React.useState(false);

  React.useEffect(() => {
    if (cardRef.current && post.profiles?.id) {
      trackElementRef(cardRef.current);
    }
  }, [trackElementRef, post.profiles?.id]);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    getCurrentUser();
  }, []);

  const refreshconnectionStatus = React.useCallback(async () => {
    if (!currentUserId || !post.author_id || currentUserId === post.author_id) {
      setconnectionStatus('none');
      return;
    }

    setIsCheckingConnection(true);
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(requester_id.eq.${currentUserId},recipient_id.eq.${post.author_id}),and(requester_id.eq.${post.author_id},recipient_id.eq.${currentUserId})`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setconnectionStatus((data?.status as connectionStatus | null) || 'none');
    } catch (error) {
      console.error('Failed to load connection status:', error);
      setconnectionStatus('none');
    } finally {
      setIsCheckingConnection(false);
    }
  }, [currentUserId, post.author_id]);

  React.useEffect(() => {
    refreshconnectionStatus();
  }, [refreshconnectionStatus]);

  const handleConnect = async () => {
    if (!currentUserId || currentUserId === post.author_id || connectionStatus !== 'none') return;

    try {
      await sendConnectionRequest.mutateAsync(post.author_id);
      setconnectionStatus('pending');
    } catch {
      refreshconnectionStatus();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDisplayName = (profile: NetworkPost['profiles']) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const renderContentWithLinks = (content: string) => {
    const parts = linkifyText(content);
    return (
      <div className="whitespace-pre-wrap break-words">
        {parts.map((part, index) => (
          <span key={index}>{part}</span>
        ))}
      </div>
    );
  };

  const hasVideo = post.media_urls?.some(url =>
    url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')
  );

  if (hasVideo) {
    return (
      <VideoNetworkPostCard
        post={post}
        onCommentClick={onCommentClick}
      />
    );
  }

  const shareContent = createPostShareData(post);
  const listenText = [post.headline, post.content].filter(Boolean).join('. ');
  const showConnectionButton = !!currentUserId && currentUserId !== post.author_id;
  const connectionButtonDisabled = isCheckingConnection || sendConnectionRequest.isPending || connectionStatus !== 'none';
  const connectionButtonLabel =
    connectionStatus === 'accepted'
      ? 'Connected'
      : connectionStatus === 'pending'
        ? 'Pending'
        : sendConnectionRequest.isPending
          ? 'Sending'
          : 'Connect';
  const ConnectionIcon = connectionStatus === 'none' ? UserPlus : Check;

  return (
    <div
      ref={cardRef}
      className="bg-white border-b border-gray-100 transition-colors active:bg-gray-50/80"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-start gap-3 mb-3">
          <Link to={`/user/${post.author_id}`} className="shrink-0 mt-0.5">
            <div className="relative">
              <div
                className="rounded-full overflow-hidden transition-transform active:scale-95"
                style={{
                  width: 44,
                  height: 44,
                  boxShadow: '0 0 0 1.5px rgba(0,0,0,0.08)',
                }}
              >
                <UserAvatar
                  src={post.profiles?.profile_picture_url || null}
                  userName={formatDisplayName(post.profiles)}
                  size="md"
                />
              </div>
              {post.profiles?.pro_plan && post.profiles?.pro_status === 'active' &&
                post.profiles?.pro_expires_at && new Date(post.profiles.pro_expires_at) > new Date() && (
                  <div className="absolute -bottom-1 -right-1">
                    <ProBadge plan={post.profiles.pro_plan as any} size="sm" />
                  </div>
                )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link to={`/user/${post.author_id}`}>
                  <p
                    className="font-semibold text-gray-900 truncate leading-tight hover:text-blue-600 transition-colors"
                    style={{ fontSize: 15 }}
                  >
                    {formatDisplayName(post.profiles)}
                  </p>
                </Link>
                {post.profiles?.title && (
                  <p
                    className="text-gray-500 truncate leading-snug"
                    style={{ fontSize: 13 }}
                  >
                    {post.profiles.title}
                    {post.profiles.current_company && ` | ${post.profiles.current_company}`}
                  </p>
                )}
                <p className="text-gray-400 mt-0.5" style={{ fontSize: 12 }}>
                  {formatTimeAgo(post.created_at)}
                </p>
              </div>

              {showConnectionButton && (
                <button
                  onClick={handleConnect}
                  disabled={connectionButtonDisabled}
                  aria-label={`${connectionButtonLabel} with ${formatDisplayName(post.profiles)}`}
                  className="shrink-0 flex items-center gap-1 px-3 h-8 rounded-full border border-blue-500 text-blue-600 font-semibold transition-all active:scale-95 active:bg-blue-50 hover:bg-blue-50 disabled:opacity-60 disabled:active:scale-100"
                  style={{ fontSize: 13, whiteSpace: 'nowrap' }}
                >
                  <ConnectionIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
                  {connectionButtonLabel}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <QuickShareActions content={shareContent} />
            <ReshareButton
              postId={post.id}
              postContent={post.content}
              postAuthor={formatDisplayName(post.profiles)}
              postUrl={`${window.location.origin}/network/posts/${post.id}`}
            />
            <EnhancedPostMenu
              postId={post.id}
              authorId={post.author_id || ''}
              currentUserId={currentUserId}
              postContent={post.content}
              postHeadline={post.headline}
              isOwnPost={currentUserId === post.author_id}
            />
          </div>
        </div>

        {post.headline && (
          <p className="font-semibold text-gray-900 mb-2" style={{ fontSize: 15 }}>
            {post.headline}
          </p>
        )}

        <div className="mb-3">
          <div
            className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed"
            style={{ fontSize: 14, lineHeight: '22px' }}
          >
            {renderContentWithLinks(post.content)}
          </div>
        </div>

        {listenText.trim() && (
          <div className="mb-3">
            <VoiceButton
              text={listenText}
              variant="ghost"
              className="h-8 bg-slate-50 px-3 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            />
          </div>
        )}

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-3 -mx-4 overflow-hidden">
            <MediaPreview content={post.content} mediaUrls={post.media_urls} />
          </div>
        )}

        {post.link_previews && post.link_previews.length > 0 && (
          <div className="space-y-2 mb-3">
            {post.link_previews.map((linkData, index) => (
              <ContentEmbed
                key={index}
                url={linkData.url}
                className="rounded-xl overflow-hidden border border-gray-100"
              />
            ))}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium"
                style={{ fontSize: 12 }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {(post.likes_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-2 pb-2 border-b border-gray-100">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white">
              <ThumbsUp className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
            </span>
            <span className="text-gray-500" style={{ fontSize: 13 }}>
              {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
              {(post.comments_count ?? 0) > 0 && ` | ${post.comments_count} comments`}
            </span>
          </div>
        )}
      </div>

      <EngagementActions
        contentType="post"
        contentId={post.id}
        contentOwnerId={post.author_id}
        module="network"
        initialStats={{
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
          views: 0,
        }}
        variant="default"
        onComment={() => onCommentClick?.(post.id)}
      />

      <EnhancedCommentsSection
        postId={post.id}
        isOpen={openComments === post.id}
      />
    </div>
  );
};


