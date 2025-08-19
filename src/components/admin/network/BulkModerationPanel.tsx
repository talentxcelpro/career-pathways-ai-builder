import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Flag, 
  Trash2, 
  AlertTriangle,
  Shield,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BulkModerationPanelProps {
  selectedPosts: string[];
  onBulkAction: (action: 'approve' | 'reject' | 'flag' | 'delete', reason: string) => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

export const BulkModerationPanel: React.FC<BulkModerationPanelProps> = ({
  selectedPosts,
  onBulkAction,
  onClearSelection,
  isLoading
}) => {
  const [actionReason, setActionReason] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'flag' | 'delete'>('approve');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmitAction = () => {
    if (!actionReason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    onBulkAction(selectedAction, actionReason);
    setActionReason('');
    setIsDialogOpen(false);
  };

  const moderationActions = [
    {
      value: 'approve' as const,
      label: 'Approve',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Approve selected posts for public visibility'
    },
    {
      value: 'reject' as const,
      label: 'Reject',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Reject posts and hide from public feed'
    },
    {
      value: 'flag' as const,
      label: 'Flag',
      icon: Flag,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Flag for review without hiding'
    },
    {
      value: 'delete' as const,
      label: 'Delete',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Permanently delete selected posts'
    }
  ];

  const presetReasons = {
    approve: [
      'Content meets community guidelines',
      'High quality and relevant content',
      'Approved after review'
    ],
    reject: [
      'Violates community guidelines',
      'Inappropriate content',
      'Spam or promotional content',
      'Off-topic or irrelevant'
    ],
    flag: [
      'Requires further review',
      'Potentially sensitive content',
      'User reported content',
      'Automated flag for manual review'
    ],
    delete: [
      'Severe policy violation',
      'Harmful or dangerous content',
      'Copyright infringement',
      'Legal compliance requirement'
    ]
  };

  if (selectedPosts.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Posts Selected
          </h3>
          <p className="text-gray-500">
            Select posts from the list below to perform bulk moderation actions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Bulk Moderation
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {selectedPosts.length} selected
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearSelection}
            className="text-gray-600"
          >
            Clear Selection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moderationActions.map((action) => (
            <Dialog key={action.value} open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className={`flex flex-col items-center gap-2 h-auto p-4 ${action.bgColor} hover:${action.bgColor}`}
                  onClick={() => setSelectedAction(action.value)}
                  disabled={isLoading}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className={`text-sm font-medium ${action.color}`}>
                    {action.label}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    {action.label} {selectedPosts.length} Posts
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Action Description:</p>
                    <p className="text-sm font-medium">{action.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Action *
                    </label>
                    <Select 
                      value={actionReason} 
                      onValueChange={setActionReason}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason or enter custom" />
                      </SelectTrigger>
                      <SelectContent>
                        {presetReasons[action.value].map((reason, index) => (
                          <SelectItem key={index} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom reason...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(actionReason === 'custom' || !presetReasons[action.value].includes(actionReason)) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Reason
                      </label>
                      <Textarea
                        value={actionReason === 'custom' ? '' : actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Enter detailed reason for this action..."
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      This action will affect {selectedPosts.length} posts and cannot be undone.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitAction}
                      disabled={!actionReason.trim() || isLoading}
                      className={`flex-1 ${
                        action.value === 'delete' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : action.value === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isLoading ? 'Processing...' : `${action.label} Posts`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Selected Posts Summary */}
        <div className="pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">
              Selected Posts: {selectedPosts.length}
            </span>
            <div className="flex items-center gap-4 text-blue-600">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Review Selected
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};