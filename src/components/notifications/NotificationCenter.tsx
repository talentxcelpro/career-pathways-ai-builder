import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  TestTube2,
  Check,
  Trash2
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { TestNotificationSender } from './TestNotificationSender';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isSubscribed,
    isLoading,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    playNotificationSound
  } = useNotifications();

  const navigate = useNavigate();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_match':
        return '💼';
      case 'connection_request':
        return '👥';
      case 'message':
        return '💬';
      case 'application_update':
        return '📋';
      case 'profile_view':
        return '👁️';
      case 'profile_completion_reminder':
        return '✨';
      case 'welcome':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const formatNotificationContent = (notification: any) => {
    // Parse structured content if available
    let content = notification.message;
    let actions = [];
    
    // Check if message contains structured data
    try {
      if (notification.data && typeof notification.data === 'object') {
        const data = notification.data;
        if (data.actions) {
          actions = data.actions;
        }
        if (data.rich_content) {
          content = data.rich_content;
        }
      }
    } catch (e) {
      // Fallback to original message
    }

    return { content, actions };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-25 shadow-sm';
      case 'normal':
        return 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-25 shadow-sm';
      case 'low':
        return 'border-l-gray-500 bg-gradient-to-r from-gray-50 to-gray-25 shadow-sm';
      default:
        return 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-25 shadow-sm';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div className="space-y-6">
      <TestNotificationSender />
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={playNotificationSound}
              title="Test sound"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              title="Send test notification"
            >
              <TestTube2 className="h-4 w-4" />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Push Notification Controls */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Push Notifications:</span>
            {permission === 'granted' ? (
              <Badge variant="outline" className="text-green-600">
                <Bell className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600">
                <BellOff className="h-3 w-3 mr-1" />
                Disabled
              </Badge>
            )}
          </div>
          
          {permission !== 'granted' ? (
            <Button
              size="sm"
              onClick={subscribeToPush}
              disabled={isLoading}
            >
              Enable Notifications
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribeFromPush}
              disabled={isLoading}
            >
              Disable
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">We'll let you know when something happens!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                 <div
                   key={notification.id}
                   className={`border-l-4 p-5 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                     getPriorityColor(notification.priority)
                   } ${!notification.is_read ? 'ring-2 ring-blue-200 bg-white' : ''}`}
                   onClick={() => handleNotificationClick(notification)}
                 >
                  <div className="flex items-start justify-between">
                     <div className="flex items-start gap-4 flex-1">
                       <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                         {getNotificationIcon(notification.type)}
                       </div>
                      
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-semibold text-base text-gray-900">
                             {notification.title}
                           </h4>
                           {!notification.is_read && (
                             <div className="w-2 h-2 bg-blue-500 rounded-full" />
                           )}
                         </div>
                         
                         <div className="mb-3">
                           {(() => {
                             const { content, actions } = formatNotificationContent(notification);
                             return (
                               <div>
                                 <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                   {content}
                                 </p>
                                 
                                 {/* Rich content for specific notification types */}
                                 {notification.type === 'profile_completion_reminder' && (
                                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 mb-2">
                                     <div className="flex items-center gap-2 mb-2">
                                       <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                         <span className="text-blue-600 text-sm">✨</span>
                                       </div>
                                       <div>
                                         <p className="font-medium text-sm text-blue-900">Complete Your Profile</p>
                                         <p className="text-xs text-blue-700">Unlock all TalentXcel features</p>
                                       </div>
                                     </div>
                                     <Button 
                                       size="sm" 
                                       className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         navigate('/profile');
                                       }}
                                     >
                                       Complete Now
                                     </Button>
                                   </div>
                                 )}
                                 
                                 {notification.type === 'welcome' && (
                                   <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100 mb-2">
                                     <div className="flex items-center gap-2 mb-2">
                                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                         <span className="text-green-600 text-sm">🎉</span>
                                       </div>
                                       <div>
                                         <p className="font-medium text-sm text-green-900">Welcome to TalentXcel!</p>
                                         <p className="text-xs text-green-700">Your career journey starts here</p>
                                       </div>
                                     </div>
                                     <div className="flex gap-2">
                                       <Button 
                                         size="sm" 
                                         variant="outline"
                                         className="flex-1"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           navigate('/jobs');
                                         }}
                                       >
                                         Explore Jobs
                                       </Button>
                                       <Button 
                                         size="sm" 
                                         className="flex-1 bg-green-600 hover:bg-green-700"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           navigate('/profile');
                                         }}
                                       >
                                         Setup Profile
                                       </Button>
                                     </div>
                                   </div>
                                 )}
                                 
                                 {notification.type === 'job_match' && (
                                   <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-100 mb-2">
                                     <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                         <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                           <span className="text-purple-600 text-sm">💼</span>
                                         </div>
                                         <div>
                                           <p className="font-medium text-sm text-purple-900">New Job Match</p>
                                           <p className="text-xs text-purple-700">Perfect for your skills</p>
                                         </div>
                                       </div>
                                       <Button 
                                         size="sm" 
                                         className="bg-purple-600 hover:bg-purple-700"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           navigate('/jobs');
                                         }}
                                       >
                                         View Job
                                       </Button>
                                     </div>
                                   </div>
                                 )}
                                 
                                 {actions.length > 0 && (
                                   <div className="flex gap-2 mt-2">
                                     {actions.map((action: any, index: number) => (
                                       <Button
                                         key={index}
                                         size="sm"
                                         variant={index === 0 ? "default" : "outline"}
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           if (action.url) navigate(action.url);
                                         }}
                                       >
                                         {action.label}
                                       </Button>
                                     ))}
                                   </div>
                                 )}
                               </div>
                             );
                           })()}
                         </div>
                         
                         <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-500">
                             {formatDistanceToNow(new Date(notification.created_at), { 
                               addSuffix: true 
                             })}
                           </span>
                           
                           <Badge variant="outline" className="text-xs">
                             {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                           </Badge>
                         </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
    </div>
  );
};