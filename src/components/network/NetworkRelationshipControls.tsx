import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Check, 
  Clock, 
  MessageCircle, 
  UserCheck, 
  CheckCircle2, 
  X, 
  Edit3, 
  UserX,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRelationship, useNetworkRelationships } from '@/hooks/useNetworkRelationships';

interface NetworkRelationshipControlsProps {
  targetUserId: string;
  targetName: string;
  profileLink?: string;
  layout?: 'card-bottom' | 'compact' | 'full' | 'inline';
  className?: string;
  onActionComplete?: () => void;
}

export const NetworkRelationshipControls: React.FC<NetworkRelationshipControlsProps> = ({
  targetUserId,
  targetName,
  profileLink,
  layout = 'card-bottom',
  className = '',
  onActionComplete
}) => {
  const navigate = useNavigate();
  const {
    getRelationship,
    connect,
    accept,
    decline,
    withdraw,
    toggleFollow,
    isConnecting,
    isAccepting,
    isDeclining,
    isWithdrawing,
    isTogglingFollow,
    currentUser
  } = useNetworkRelationships();

  const rel = getRelationship(targetUserId);

  const handleProfileClick = () => {
    if (profileLink) {
      navigate(profileLink);
    } else {
      navigate(`/network/people/${targetUserId}`);
    }
  };

  const handleMessageClick = () => {
    navigate(`/network/messages/new?userId=${targetUserId}`);
  };

  // Case 1: SELF (The logged in user's own card)
  if (rel.isSelf) {
    if (layout === 'card-bottom') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-7.5 px-3 rounded-lg font-bold border-slate-200 dark:border-border hover:bg-slate-100 dark:hover:bg-muted cursor-pointer"
            onClick={handleProfileClick}
          >
            View My Profile
          </Button>
          <Button
            size="sm"
            className="text-xs h-7.5 px-3 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-2xs"
            onClick={() => navigate('/profile/edit')}
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      );
    }

    return (
      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200">
        You
      </Badge>
    );
  }

  // Case 2: PENDING RECEIVED (Target user sent an invitation to current user: "Wants to connect")
  if (rel.isPendingReceived && rel.connectionId) {
    const connId = rel.connectionId;
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-blue-700 dark:text-blue-300 font-bold px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-blue-500 animate-pulse" />
            Wants to connect with you
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            className="flex-1 text-[11px] h-7 px-2.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
            onClick={() => {
              accept(connId, targetName);
              onActionComplete?.();
            }}
            disabled={isAccepting}
          >
            <Check className="h-3 w-3 mr-1" />
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] h-7 px-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 border-slate-200 cursor-pointer"
            onClick={() => {
              decline(connId, targetName);
              onActionComplete?.();
            }}
            disabled={isDeclining}
            title="Decline invitation"
          >
            <X className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[11px] h-7 px-2 rounded-lg font-medium text-slate-500 hover:text-foreground cursor-pointer"
            onClick={handleProfileClick}
          >
            View
          </Button>
        </div>
      </div>
    );
  }

  // Case 3: PENDING SENT (Current user sent invitation to target: awaiting acceptance)
  if (rel.isPendingSent && rel.connectionId) {
    const connId = rel.connectionId;
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 border-slate-200 dark:border-border cursor-pointer truncate"
          onClick={handleProfileClick}
        >
          View
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className={`text-[11px] h-7 px-2.5 rounded-lg font-bold shrink-0 cursor-pointer ${
            rel.isFollowing
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
          }`}
          onClick={() => toggleFollow(targetUserId, targetName)}
          disabled={isTogglingFollow}
        >
          {rel.isFollowing ? 'Following ✓' : 'Follow'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-[11px] h-7 px-2.5 rounded-lg font-bold bg-amber-50/80 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800 shrink-0 cursor-pointer shadow-2xs group"
          onClick={() => {
            withdraw(connId, targetName);
            onActionComplete?.();
          }}
          disabled={isWithdrawing}
          title="Click to withdraw invitation"
        >
          <Clock className="h-3 w-3 mr-1 text-amber-600 group-hover:hidden" />
          <X className="h-3 w-3 mr-1 text-amber-700 hidden group-hover:inline" />
          <span className="group-hover:hidden">Pending</span>
          <span className="hidden group-hover:inline">Withdraw</span>
        </Button>
      </div>
    );
  }

  // Case 4: CONNECTED (Both users are connected!)
  if (rel.isConnected) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 border-slate-200 dark:border-border cursor-pointer truncate"
          onClick={handleProfileClick}
        >
          View
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className={`text-[11px] h-7 px-2.5 rounded-lg font-bold shrink-0 cursor-pointer ${
            rel.isFollowing
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
          }`}
          onClick={() => toggleFollow(targetUserId, targetName)}
          disabled={isTogglingFollow}
        >
          {rel.isFollowing ? 'Following ✓' : 'Follow'}
        </Button>
        <Button
          size="sm"
          className="text-[11px] h-7 px-2.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 cursor-pointer shadow-2xs"
          onClick={handleMessageClick}
          title={`Send message to ${targetName}`}
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Message
        </Button>
      </div>
    );
  }

  // Case 5: NOT CONNECTED (Standard default state)
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 text-[11px] h-7 px-2 rounded-lg font-bold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 border-slate-200 dark:border-border cursor-pointer truncate"
        onClick={handleProfileClick}
      >
        View
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className={`text-[11px] h-7 px-2.5 rounded-lg font-bold shrink-0 cursor-pointer ${
          rel.isFollowing
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
        }`}
        onClick={() => toggleFollow(targetUserId, targetName)}
        disabled={isTogglingFollow}
      >
        {rel.isFollowing ? 'Following ✓' : 'Follow'}
      </Button>
      <Button
        size="sm"
        className="text-[11px] h-7 px-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shrink-0 cursor-pointer shadow-2xs"
        onClick={() => connect(targetUserId, targetName)}
        disabled={isConnecting}
        title={`Connect with ${targetName}`}
      >
        <UserPlus className="h-3 w-3 mr-1" />
        Connect
      </Button>
    </div>
  );
};

export const NetworkRelationshipBadge: React.FC<{ targetUserId: string; className?: string }> = ({
  targetUserId,
  className = ''
}) => {
  const { getRelationship } = useNetworkRelationships();
  const rel = getRelationship(targetUserId);

  if (rel.isSelf) {
    return (
      <Badge variant="outline" className={`text-[9.5px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 ${className}`}>
        You
      </Badge>
    );
  }

  if (rel.isConnected) {
    return (
      <Badge variant="outline" className={`text-[9.5px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 shadow-2xs flex items-center gap-1 ${className}`}>
        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
        Connected
      </Badge>
    );
  }

  if (rel.isPendingReceived) {
    return (
      <Badge variant="outline" className={`text-[9.5px] font-bold px-2 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 shadow-2xs flex items-center gap-1 animate-pulse ${className}`}>
        <Sparkles className="h-2.5 w-2.5 text-sky-600" />
        Wants to connect
      </Badge>
    );
  }

  if (rel.isPendingSent) {
    return (
      <Badge variant="outline" className={`text-[9.5px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 shadow-2xs flex items-center gap-1 ${className}`}>
        <Clock className="h-2.5 w-2.5 text-amber-600" />
        Pending
      </Badge>
    );
  }

  if (rel.followsYou) {
    return (
      <Badge variant="outline" className={`text-[9px] font-medium px-1.5 py-0 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 ${className}`}>
        Follows you
      </Badge>
    );
  }

  return null;
};
