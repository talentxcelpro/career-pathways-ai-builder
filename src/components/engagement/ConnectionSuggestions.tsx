import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConnectionSuggestions } from '@/hooks/useConnectionSuggestions';
import { 
  Users, 
  UserPlus, 
  X, 
  RefreshCw,
  MapPin,
  Building,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const ConnectionSuggestions: React.FC = () => {
  const { 
    suggestions, 
    isLoading, 
    sendConnection, 
    dismissSuggestion, 
    generateSuggestions,
    isSendingConnection,
    isDismissing,
    isGenerating
  } = useConnectionSuggestions();

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'skills_match': return 'Similar Skills';
      case 'company_match': return 'Same Company';
      case 'education_match': return 'Same Education';
      case 'mutual_connections': return 'Mutual Connections';
      default: return 'Suggested';
    }
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'skills_match': return 'bg-blue-100 text-blue-800';
      case 'company_match': return 'bg-green-100 text-green-800';
      case 'education_match': return 'bg-purple-100 text-purple-800';
      case 'mutual_connections': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            People You May Know
            {suggestions.length > 0 && (
              <Badge variant="secondary">{suggestions.length}</Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateSuggestions()}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No suggestions available</p>
            <p className="text-xs">Try refreshing to get new connection suggestions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="group p-4 rounded-lg border bg-gradient-subtle hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={suggestion.suggested_user?.profile_photo_url} 
                      alt={suggestion.suggested_user?.full_name} 
                    />
                    <AvatarFallback>
                      {suggestion.suggested_user?.full_name
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate">
                          {suggestion.suggested_user?.full_name}
                        </h3>
                        {suggestion.suggested_user?.headline && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {suggestion.suggested_user.headline}
                          </p>
                        )}
                        {suggestion.suggested_user?.location && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {suggestion.suggested_user.location}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissSuggestion(suggestion.id)}
                          disabled={isDismissing}
                          className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getSuggestionTypeColor(suggestion.suggestion_type)}`}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {getSuggestionTypeLabel(suggestion.suggestion_type)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {Math.round(suggestion.confidence_score * 100)}% match
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => sendConnection(suggestion.suggested_user_id)}
                        disabled={isSendingConnection}
                        className="gap-2"
                      >
                        <UserPlus className="h-3 w-3" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {suggestions.length >= 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  View All Suggestions
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};