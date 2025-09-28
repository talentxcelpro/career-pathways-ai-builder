import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useContentSubscriptions } from "@/hooks/useContentSubscriptions";
import { cn } from "@/lib/utils";

type SubscriptionType = 'topic' | 'hashtag' | 'category' | 'user' | 'company';

interface ContentSubscriptionButtonProps {
  type: SubscriptionType;
  value: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  showText?: boolean;
}

export function ContentSubscriptionButton({ 
  type,
  value,
  size = "sm",
  variant = "ghost",
  className,
  showText = true
}: ContentSubscriptionButtonProps) {
  const { 
    subscriptions,
    isLoading,
    subscribe,
    unsubscribe,
    isSubscribed
  } = useContentSubscriptions();

  const [isUpdating, setIsUpdating] = React.useState(false);
  const subscribed = isSubscribed(type, value);
  const subscription = subscriptions.find(
    sub => sub.subscription_type === type && sub.subscription_value === value
  );

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      if (subscribed && subscription) {
        await unsubscribe(subscription.id);
      } else {
        await subscribe(type, value);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={subscribed ? "default" : variant}
      size={size}
      onClick={handleToggle}
      disabled={isUpdating}
      className={cn(
        "flex items-center gap-2",
        subscribed && "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white",
        className
      )}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : subscribed ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      
      {showText && (
        <span className="font-medium">
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </span>
      )}
    </Button>
  );
}