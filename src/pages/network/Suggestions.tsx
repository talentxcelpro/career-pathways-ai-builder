
import React from 'react';
import { AISuggestionEngine } from "@/components/network/AISuggestionEngine";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Suggestions = () => {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Suggestions</h1>
          <p className="text-gray-600 mt-2">
            Discover relevant people, content, and opportunities curated just for you
          </p>
        </div>

        {/* AI Suggestion Engine */}
        <AISuggestionEngine userId={currentUser?.id} />
      </div>
    </div>
  );
};

export default Suggestions;
