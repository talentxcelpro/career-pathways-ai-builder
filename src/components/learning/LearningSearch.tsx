import React, { useState } from 'react';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LearningSearchProps {
  className?: string;
}

export const LearningSearch: React.FC<LearningSearchProps> = ({ className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const trendingSearches = [
    'React Development',
    'Data Science',
    'Machine Learning',
    'Digital Marketing',
    'Project Management',
    'UI/UX Design'
  ];

  const recentSearches = [
    'JavaScript Fundamentals',
    'Python Programming',
    'Cloud Computing'
  ];

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/learning/courses?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-ai-violet-medium flex items-center justify-center">
            <Search className="w-3 h-3 text-white" />
          </div>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What do you want to learn?"
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/90 backdrop-blur-apple border border-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 text-sm font-medium shadow-lg hover:shadow-glow transition-all duration-300"
        />
      </div>

      {/* Search Suggestions - Show when input is focused */}
      {searchQuery.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-apple rounded-xl border border-white/50 shadow-xl z-20 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Trending Searches</span>
            </div>
            <div className="space-y-2">
              {trendingSearches
                .filter(search => search.toLowerCase().includes(searchQuery.toLowerCase()))
                .slice(0, 3)
                .map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-lg transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {search}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Show trending when no search query */}
      {searchQuery.length === 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Trending</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.slice(0, 4).map((search, index) => (
              <button
                key={index}
                onClick={() => handleSearch(search)}
                className="px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-white/50 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/80 transition-all duration-200"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};