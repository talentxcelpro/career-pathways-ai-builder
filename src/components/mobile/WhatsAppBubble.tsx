import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppBubbleProps {
  content: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'voice';
  senderName?: string;
}

export const WhatsAppBubble: React.FC<WhatsAppBubbleProps> = ({
  content,
  timestamp,
  isMe,
  status = 'sent',
  type = 'text',
  senderName
}) => {
  return (
    <div className={cn(
      "flex w-full mb-2 px-4",
      isMe ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "relative max-w-[85%] px-3 py-2 rounded-2xl shadow-sm",
        isMe 
          ? "bg-[#DCF8C6] text-slate-800 rounded-tr-none" 
          : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
      )}>
        {/* Tail */}
        <div className={cn(
          "absolute top-0 w-2 h-2",
          isMe 
            ? "-right-1 bg-[#DCF8C6] [clip-path:polygon(0_0,100%_0,0_100%)]" 
            : "-left-1 bg-white [clip-path:polygon(100%_0,0_0,100%_100%)]"
        )} />

        {!isMe && senderName && (
          <p className="text-[11px] font-bold text-blue-600 mb-0.5">{senderName}</p>
        )}

        <div className="flex flex-col">
          <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>
          
          <div className="flex items-center justify-end gap-1 mt-0.5 -mr-1">
            <span className="text-[10px] text-slate-400">
              {timestamp}
            </span>
            {isMe && (
              <div className="flex items-center">
                {status === 'sent' && <Check className="w-3 h-3 text-slate-400" />}
                {status === 'delivered' && <CheckCheck className="w-3 h-3 text-slate-400" />}
                {status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
