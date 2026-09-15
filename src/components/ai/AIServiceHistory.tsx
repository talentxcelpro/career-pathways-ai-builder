import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare, Calendar } from 'lucide-react';
import { useAIServiceMatching } from '@/hooks/useAIServiceMatching';
import { formatDistanceToNow } from 'date-fns';

const serviceTypeLabels = {
  career_coaching: 'Career Coaching',
  resume_optimization: 'Resume Optimization',
  interview_prep: 'Interview Preparation',
  salary_negotiation: 'Salary Negotiation',
  skill_development: 'Skill Development'
};

export const AIServiceHistory = () => {
  const { 
    conversations, 
    conversationsLoading, 
    deleteConversation, 
    isDeletingConversation 
  } = useAIServiceMatching();

  if (conversationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>Loading your previous conversations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Conversation History
        </CardTitle>
        <CardDescription>
          Your previous AI service conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!conversations || conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No conversations yet. Start chatting with the AI assistant!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {serviceTypeLabels[conversation.service_type as keyof typeof serviceTypeLabels] || 
                       conversation.service_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-sm line-clamp-2">
                    {conversation.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground">
                    Last activity: {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: Navigate to conversation detail view
                      console.log('View conversation:', conversation.id);
                    }}
                  >
                    View
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteConversation(conversation.id)}
                    disabled={isDeletingConversation}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};