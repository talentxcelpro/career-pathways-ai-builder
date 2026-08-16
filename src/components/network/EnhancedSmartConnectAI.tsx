import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Sparkles, 
  Target,
  Briefcase,
  TrendingUp,
  MapPin,
  Building,
  RefreshCw,
  Search,
  Wand2,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { useEnhancedConnectionSuggestions } from '@/hooks/useEnhancedConnectionSuggestions';
import { Link } from 'react-router-dom';
import { generateGeminiSmartConnect } from '@/utils/geminiAi';
import { toast } from 'sonner';

type FilterType = 'all' | 'skill_match' | 'location_match' | 'industry_match' | 'title_match';

export const EnhancedSmartConnectAI: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingPitchFor, setGeneratingPitchFor] = useState<string | null>(null);
  const [pitchMessages, setPitchMessages] = useState<Record<string, string>>({});
  
  const {
    suggestions,
    isLoading,
    sendConnection,
    isSendingConnection,
    refreshSuggestions,
    currentUserProfile
  } = useEnhancedConnectionSuggestions();

  const handleGenerateGeminiPitch = async (suggestion: any) => {
    setGeneratingPitchFor(suggestion.id);
    try {
      const res = await generateGeminiSmartConnect(currentUserProfile, suggestion);
      setPitchMessages(prev => ({ ...prev, [suggestion.id]: res.message }));
      toast.success("Gemini AI generated a personalized connection pitch!");
    } catch (err) {
      toast.error("Failed to generate AI pitch");
    } finally {
      setGeneratingPitchFor(null);
    }
  };

  const filteredSuggestions = suggestions
    .filter(suggestion => {
      if (selectedFilter !== 'all' && suggestion.suggestionType !== selectedFilter) {
        return false;
      }
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          suggestion.full_name?.toLowerCase().includes(searchLower) ||
          suggestion.title?.toLowerCase().includes(searchLower) ||
          suggestion.company?.toLowerCase().includes(searchLower) ||
          suggestion.location?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'skill_match': return 'Similar Skills';
      case 'location_match': return 'Same Location';
      case 'industry_match': return 'Same Industry';
      case 'title_match': return 'Similar Role';
      default: return 'Suggested';
    }
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'skill_match': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'location_match': return 'bg-green-100 text-green-800 border-green-200';
      case 'industry_match': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'title_match': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Gemini AI Header Card */}
      <Card className="border border-purple-200 dark:border-purple-900 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Gemini AI Smart Connect &amp; Matchmaker
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              AI-driven connection recommendations and personalized pitch messages powered by Gemini AI.
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshSuggestions}
            disabled={isLoading}
            className="rounded-2xl border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50 shrink-0 font-bold text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Recommendations
          </Button>
        </div>
      </Card>

      {/* Enhanced Search and Filters */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-xs rounded-2xl"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'all', label: 'All', icon: Users },
                { key: 'skill_match', label: 'Skills', icon: Target },
                { key: 'title_match', label: 'Roles', icon: Briefcase },
                { key: 'location_match', label: 'Location', icon: MapPin },
                { key: 'industry_match', label: 'Industry', icon: Building }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={selectedFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(key as FilterType)}
                  className="rounded-xl h-8 text-xs font-bold gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Connections List */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-extrabold">
            <Users className="h-4 w-4 text-primary" />
            Suggested Connections
            {filteredSuggestions.length > 0 && (
              <Badge variant="secondary" className="rounded-full">{filteredSuggestions.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <div 
              key={suggestion.id} 
              className="p-5 border border-slate-200/80 dark:border-border/60 rounded-3xl bg-white dark:bg-card hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5 min-w-0">
                  <Link to={`/passport/public/${suggestion.id}`}>
                    <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-800 shadow-md">
                      <AvatarImage src={suggestion.profile_picture_url} />
                      <AvatarFallback className="font-extrabold text-xs bg-slate-900 text-white">
                        {suggestion.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/passport/public/${suggestion.id}`} className="font-extrabold text-sm text-foreground hover:text-primary transition-colors truncate">
                        {suggestion.full_name}
                      </Link>
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    </div>

                    <p className="text-xs text-muted-foreground font-semibold truncate">{suggestion.title || 'Professional'}</p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                      {suggestion.company && <span className="flex items-center gap-1"><Building className="h-3 w-3 text-primary" /> {suggestion.company}</span>}
                      {suggestion.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {suggestion.location}</span>}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className={`text-[10px] font-bold ${getSuggestionTypeColor(suggestion.suggestionType)}`}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        {getSuggestionTypeLabel(suggestion.suggestionType)}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {suggestion.matchScore}% Match
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateGeminiPitch(suggestion)}
                    disabled={generatingPitchFor === suggestion.id}
                    className="rounded-2xl text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-50 h-8"
                  >
                    <Wand2 className="h-3.5 w-3.5 mr-1 text-purple-600" />
                    AI Pitch
                  </Button>

                  <Button 
                    size="sm"
                    onClick={() => sendConnection(suggestion.id)}
                    disabled={isSendingConnection(suggestion.id)}
                    className="rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white h-8 shadow-sm"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Connect
                  </Button>
                </div>
              </div>

              {/* Gemini AI Generated Pitch Message Box */}
              {pitchMessages[suggestion.id] && (
                <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 text-xs space-y-2">
                  <div className="flex items-center justify-between font-extrabold text-purple-900 dark:text-purple-200">
                    <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-purple-600" /> Gemini AI Personalized Pitch</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(pitchMessages[suggestion.id]);
                        toast.success("Pitch message copied to clipboard!");
                      }} 
                      className="flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300 font-bold hover:underline"
                    >
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <p className="text-foreground font-medium leading-relaxed">{pitchMessages[suggestion.id]}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};