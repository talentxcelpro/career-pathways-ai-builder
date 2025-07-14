import React from 'react';

export const SecretForm = ({ name }: { name: string }) => {
  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <p className="text-sm text-yellow-800 mb-2">
        The AI enhancement features require the {name} to be configured.
      </p>
      <p className="text-xs text-yellow-600">
        Please add this secret in your Supabase project settings under Edge Functions.
      </p>
    </div>
  );
};