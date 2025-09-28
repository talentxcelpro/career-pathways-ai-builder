import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Flag, UserX, Eye, EyeOff, Share2, Bookmark, Edit } from 'lucide-react';
import { useContentModeration } from '@/hooks/useContentModeration';
import { ReportContentDialog } from './ReportContentDialog';
import { useAuth } from '@/contexts/AuthContext';

interface ContentActionsMenuProps {
  contentType: 'post' | 'comment' | 'user' | 'group';
  contentId: string;
  contentTitle?: string;
  authorId?: string;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export const ContentActionsMenu: React.FC<ContentActionsMenuProps> = ({
  contentType,
  contentId,
  contentTitle,
  authorId,
  isOwner = false,
  onEdit,
  onDelete,
  onShare,
  onBookmark
}) => {
  const { user } = useAuth();
  const { blockUser, unblockUser, isUserBlocked } = useContentModeration();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const isBlocked = authorId ? isUserBlocked(authorId) : false;

  const handleBlockUser = () => {
    if (authorId && authorId !== user?.id) {
      if (isBlocked) {
        unblockUser(authorId);
      } else {
        blockUser(authorId);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Share option */}
          {onShare && (
            <DropdownMenuItem onClick={onShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </DropdownMenuItem>
          )}

          {/* Bookmark option */}
          {onBookmark && contentType === 'post' && (
            <DropdownMenuItem onClick={onBookmark} className="gap-2">
              <Bookmark className="w-4 h-4" />
              Bookmark
            </DropdownMenuItem>
          )}

          {/* Owner actions */}
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={onEdit} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="gap-2 text-red-600">
                  <Eye className="w-4 h-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </>
          )}

          {/* Actions for other users' content */}
          {!isOwner && user && (
            <>
              <DropdownMenuSeparator />
              
              {/* Block/Unblock user */}
              {authorId && authorId !== user.id && (
                <DropdownMenuItem onClick={handleBlockUser} className="gap-2">
                  {isBlocked ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Unblock User
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Block User
                    </>
                  )}
                </DropdownMenuItem>
              )}

              {/* Report content */}
              <DropdownMenuItem 
                onClick={() => setShowReportDialog(true)} 
                className="gap-2 text-red-600"
              >
                <Flag className="w-4 h-4" />
                Report {contentType}
              </DropdownMenuItem>
            </>
          )}

          {/* Hide content for blocked users */}
          {isBlocked && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="gap-2 text-muted-foreground">
                <EyeOff className="w-4 h-4" />
                Content hidden (user blocked)
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report Dialog */}
      <ReportContentDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        contentType={contentType}
        contentId={contentId}
        contentTitle={contentTitle}
      />
    </>
  );
};